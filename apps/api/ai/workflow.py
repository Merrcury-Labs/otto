from contextlib import contextmanager, nullcontext
from urllib.parse import quote

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.module_loading import import_string
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from pydantic import ValidationError
from typing_extensions import TypedDict

from .blueprints import CurriculumBlueprint
from .models import GeneratedArtifact, GenerationJob


class BlueprintState(TypedDict, total=False):
    job_id: str
    blueprint: dict
    artifact_id: str
    validation_errors: list[dict]
    revision_count: int
    feedback: str


_memory_checkpointer = InMemorySaver()


def _database_url():
    if settings.LANGGRAPH_DATABASE_URL:
        return settings.LANGGRAPH_DATABASE_URL
    database = settings.DATABASES['default']
    if 'postgresql' not in database['ENGINE']:
        return ''
    user = quote(str(database.get('USER') or ''), safe='')
    password = quote(str(database.get('PASSWORD') or ''), safe='')
    host = database.get('HOST') or 'localhost'
    port = database.get('PORT') or '5432'
    name = quote(str(database.get('NAME') or ''), safe='')
    return f'postgresql://{user}:{password}@{host}:{port}/{name}'


@contextmanager
def workflow_checkpointer():
    database_url = _database_url()
    if not database_url:
        with nullcontext(_memory_checkpointer) as checkpointer:
            yield checkpointer
        return
    with PostgresSaver.from_conn_string(database_url) as checkpointer:
        checkpointer.setup()
        yield checkpointer


def _source_context(job):
    return [
        {
            'document_id': str(chunk.document_id),
            'chunk_id': str(chunk.id),
            'filename': chunk.document.original_filename,
            'page_number': chunk.page_number,
            'heading': chunk.heading,
            'content': chunk.content,
        }
        for chunk in job.source_documents.filter(status='READY')
        .prefetch_related('chunks')
        .all()
        for chunk in chunk.chunks.all()
    ]


def design_blueprint(state: BlueprintState):
    job = GenerationJob.objects.prefetch_related('source_documents__chunks').get(
        pk=state['job_id']
    )
    generator = import_string(settings.CURRICULUM_BLUEPRINT_GENERATOR)
    blueprint = generator(
        brief=job.course_brief,
        sources=_source_context(job),
        feedback=state.get('feedback', ''),
        previous_blueprint=state.get('blueprint'),
    )
    return {'blueprint': blueprint, 'validation_errors': []}


def validate_blueprint(state: BlueprintState):
    try:
        blueprint = CurriculumBlueprint.model_validate(state['blueprint'])
    except ValidationError as exc:
        return {'validation_errors': exc.errors(include_url=False)}
    return {'blueprint': blueprint.model_dump(mode='json'), 'validation_errors': []}


def validation_route(state: BlueprintState):
    if not state.get('validation_errors'):
        return 'persist_blueprint'
    if state.get('revision_count', 0) >= 2:
        return 'validation_failed'
    return 'automatic_revision'


def automatic_revision(state: BlueprintState):
    messages = [error.get('msg', 'Invalid blueprint') for error in state['validation_errors']]
    return {
        'feedback': 'Correct these validation errors: ' + '; '.join(messages),
        'revision_count': state.get('revision_count', 0) + 1,
    }


def validation_failed(state: BlueprintState):
    raise ValueError('Blueprint remained invalid after two automatic revision attempts.')


def persist_blueprint(state: BlueprintState):
    job = GenerationJob.objects.get(pk=state['job_id'])
    version = state.get('revision_count', 0) + 1
    with transaction.atomic():
        GeneratedArtifact.objects.filter(
            job=job,
            type=GeneratedArtifact.Type.BLUEPRINT,
            status=GeneratedArtifact.Status.DRAFT,
        ).update(status=GeneratedArtifact.Status.SUPERSEDED)
        artifact, _ = GeneratedArtifact.objects.update_or_create(
            job=job,
            type=GeneratedArtifact.Type.BLUEPRINT,
            version=version,
            defaults={
                'status': GeneratedArtifact.Status.DRAFT,
                'content': state['blueprint'],
                'validation_errors': [],
                'source_document_ids': [
                    str(document_id)
                    for document_id in job.source_documents.filter(status='READY').values_list(
                        'id', flat=True
                    )
                ],
            },
        )
        job.add_event(
            'BLUEPRINT_READY',
            f'Curriculum blueprint version {version} is ready for review.',
            {'artifact_id': str(artifact.id), 'version': version},
        )
    return {'artifact_id': str(artifact.id)}


def review_blueprint(state: BlueprintState):
    response = interrupt(
        {
            'kind': 'curriculum_blueprint_review',
            'artifact_id': state['artifact_id'],
            'blueprint': state['blueprint'],
        }
    )
    decision = response.get('decision') if isinstance(response, dict) else None
    artifact = GeneratedArtifact.objects.select_related('job').get(pk=state['artifact_id'])
    if decision == 'APPROVE':
        artifact.status = GeneratedArtifact.Status.APPROVED
        artifact.save(update_fields=('status', 'updated_at'))
        artifact.job.add_event(
            'BLUEPRINT_APPROVED',
            f'Curriculum blueprint version {artifact.version} was approved.',
            {'artifact_id': str(artifact.id)},
        )
        return Command(goto='blueprint_approved')
    if decision == 'REVISE':
        artifact.status = GeneratedArtifact.Status.REVISION_REQUESTED
        artifact.save(update_fields=('status', 'updated_at'))
        artifact.job.add_event(
            'BLUEPRINT_REVISION_REQUESTED',
            f'Revision requested for blueprint version {artifact.version}.',
            {'artifact_id': str(artifact.id)},
        )
        return Command(
            update={
                'feedback': str(response.get('feedback') or ''),
                'revision_count': state.get('revision_count', 0) + 1,
            },
            goto='design_blueprint',
        )
    raise ValueError('Blueprint review decision must be APPROVE or REVISE.')


def blueprint_approved(state: BlueprintState):
    job = GenerationJob.objects.get(pk=state['job_id'])
    job.status = GenerationJob.Status.BLUEPRINT_APPROVED
    job.current_stage = 'blueprint_approved'
    job.progress_percent = 45
    job.status_message = 'Curriculum blueprint approved.'
    job.heartbeat_at = timezone.now()
    job.save()
    return {}


def build_blueprint_graph(checkpointer):
    builder = StateGraph(BlueprintState)
    builder.add_node('design_blueprint', design_blueprint)
    builder.add_node('validate_blueprint', validate_blueprint)
    builder.add_node('automatic_revision', automatic_revision)
    builder.add_node('validation_failed', validation_failed)
    builder.add_node('persist_blueprint', persist_blueprint)
    builder.add_node('review_blueprint', review_blueprint)
    builder.add_node('blueprint_approved', blueprint_approved)
    builder.add_edge(START, 'design_blueprint')
    builder.add_edge('design_blueprint', 'validate_blueprint')
    builder.add_conditional_edges('validate_blueprint', validation_route)
    builder.add_edge('automatic_revision', 'design_blueprint')
    builder.add_edge('persist_blueprint', 'review_blueprint')
    builder.add_edge('blueprint_approved', END)
    return builder.compile(checkpointer=checkpointer)


def _config(job_id):
    return {'configurable': {'thread_id': str(job_id)}}


def _record_graph_result(job_id, graph, config, result):
    snapshot = graph.get_state(config)
    checkpoint_id = snapshot.config.get('configurable', {}).get('checkpoint_id', '')
    job = GenerationJob.objects.get(pk=job_id)
    job.graph_thread_id = str(job_id)
    job.graph_checkpoint_id = checkpoint_id
    job.heartbeat_at = timezone.now()
    if result.get('__interrupt__'):
        job.status = GenerationJob.Status.WAITING_FOR_BLUEPRINT_APPROVAL
        job.current_stage = 'blueprint_review'
        job.progress_percent = 40
        job.status_message = 'Curriculum blueprint is waiting for approval.'
        job.waiting_since = timezone.now()
        job.add_event('WAITING_FOR_BLUEPRINT_APPROVAL', job.status_message)
    job.save()
    return {
        'job_id': str(job.id),
        'status': job.status,
        'checkpoint_id': checkpoint_id,
        'interrupted': bool(result.get('__interrupt__')),
    }


def run_generation_workflow(job_id):
    job = GenerationJob.objects.get(pk=job_id)
    job.status = GenerationJob.Status.DESIGNING_CURRICULUM
    job.current_stage = 'designing_curriculum'
    job.progress_percent = 30
    job.status_message = 'Designing the curriculum blueprint.'
    job.heartbeat_at = timezone.now()
    job.save()
    config = _config(job_id)
    with workflow_checkpointer() as checkpointer:
        graph = build_blueprint_graph(checkpointer)
        result = graph.invoke(
            {'job_id': str(job_id), 'revision_count': 0, 'feedback': ''}, config=config
        )
        return _record_graph_result(job_id, graph, config, result)


def resume_generation_workflow(job_id, review):
    config = _config(job_id)
    with workflow_checkpointer() as checkpointer:
        graph = build_blueprint_graph(checkpointer)
        result = graph.invoke(Command(resume=review), config=config)
        return _record_graph_result(job_id, graph, config, result)
