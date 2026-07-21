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
from .models import (
    GeneratedArtifact,
    GenerationJob,
    ResearchFinding,
    ResearchQuestion,
    ResearchSource,
)
from .packages import GeneratedCoursePackage
from .persistence import persist_approved_course
from .research import PlannedResearchQuestion, ResearchProviderResult


class BlueprintState(TypedDict, total=False):
    job_id: str
    blueprint: dict
    artifact_id: str
    validation_errors: list[dict]
    revision_count: int
    feedback: str
    course_package: dict
    package_artifact_id: str
    package_validation_errors: list[dict]
    package_revision_count: int
    package_feedback: str
    research_questions: list[dict]
    research_findings: list[dict]


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


def _research_context(job):
    return [
        {
            'question': finding.question.query,
            'claim': finding.claim,
            'evidence': finding.evidence,
            'confidence': finding.confidence,
            'source': {
                'id': str(finding.source_id),
                'type': finding.source.type,
                'title': finding.source.title,
                'url': finding.source.url,
                'publisher': finding.source.publisher,
                'published_at': (
                    finding.source.published_at.isoformat()
                    if finding.source.published_at else None
                ),
                'reliability_score': finding.source.reliability_score,
            },
            'source_locator': finding.source_locator,
        }
        for finding in ResearchFinding.objects.filter(
            question__job=job,
            confidence__gte=settings.RESEARCH_MIN_CONFIDENCE,
            source__reliability_score__gte=settings.RESEARCH_MIN_RELIABILITY,
        )
        .select_related('question', 'source')
        .all()
    ]


def plan_research(state: BlueprintState):
    job = GenerationJob.objects.prefetch_related('source_documents__chunks').get(
        pk=state['job_id']
    )
    job.status = GenerationJob.Status.RESEARCHING
    job.current_stage = 'planning_research'
    job.progress_percent = 18
    job.status_message = 'Planning research for the curriculum.'
    job.heartbeat_at = timezone.now()
    job.save()
    planner = import_string(settings.COURSE_RESEARCH_PLANNER)
    raw_questions = planner(brief=job.course_brief, documents=_source_context(job))
    questions = [
        PlannedResearchQuestion.model_validate(question).model_dump(mode='json')
        for question in raw_questions
    ]
    with transaction.atomic():
        job.research_questions.all().delete()
        ResearchQuestion.objects.bulk_create(
            [
                ResearchQuestion(
                    job=job,
                    query=question['query'],
                    rationale=question['rationale'],
                    priority=question['priority'],
                )
                for question in questions
            ]
        )
        job.add_event(
            'RESEARCH_PLANNED',
            f'Planned {len(questions)} curriculum research questions.',
        )
    return {'research_questions': questions}


def execute_research(state: BlueprintState):
    job = GenerationJob.objects.prefetch_related('source_documents__chunks').get(
        pk=state['job_id']
    )
    job.current_stage = 'executing_research'
    job.progress_percent = 24
    job.status_message = 'Collecting and validating curriculum research.'
    job.heartbeat_at = timezone.now()
    job.save()
    provider = import_string(settings.COURSE_RESEARCH_PROVIDER)
    raw_result = provider(
        questions=state['research_questions'],
        brief=job.course_brief,
        documents=_source_context(job),
    )
    result = ResearchProviderResult.model_validate(raw_result)
    with transaction.atomic():
        job.research_sources.all().delete()
        source_by_key = {}
        for source_data in result.sources:
            url = str(source_data.url) if source_data.url else ''
            source = ResearchSource.objects.create(
                job=job,
                type=source_data.type,
                canonical_uri=url or source_data.provider_key,
                url=url,
                title=source_data.title,
                publisher=source_data.publisher,
                authors=source_data.authors,
                published_at=source_data.published_at,
                reliability_score=source_data.reliability_score,
                metadata=source_data.metadata,
            )
            source_by_key[source_data.provider_key] = source
        question_by_query = {
            question.query: question for question in job.research_questions.all()
        }
        finding_counts = {query: 0 for query in question_by_query}
        persisted_findings = []
        for finding_data in result.findings:
            question = question_by_query.get(finding_data.question_query)
            if question is None:
                raise ValueError(
                    f'Research finding references an unknown question: {finding_data.question_query}'
                )
            finding = ResearchFinding.objects.create(
                question=question,
                source=source_by_key[finding_data.source_key],
                claim=finding_data.claim,
                evidence=finding_data.evidence,
                confidence=finding_data.confidence,
                source_locator=finding_data.source_locator,
            )
            finding_counts[question.query] += 1
            persisted_findings.append(str(finding.id))
        for query, question in question_by_query.items():
            question.status = (
                ResearchQuestion.Status.COMPLETED
                if finding_counts[query]
                else ResearchQuestion.Status.NO_RESULTS
            )
            question.save(update_fields=('status', 'updated_at'))
        job.add_event(
            'RESEARCH_COMPLETED',
            f'Validated {len(result.sources)} sources and {len(result.findings)} findings.',
            {
                'minimum_reliability': settings.RESEARCH_MIN_RELIABILITY,
                'minimum_confidence': settings.RESEARCH_MIN_CONFIDENCE,
            },
        )
    return {
        'research_findings': _research_context(job),
    }


def design_blueprint(state: BlueprintState):
    job = GenerationJob.objects.prefetch_related('source_documents__chunks').get(
        pk=state['job_id']
    )
    job.status = GenerationJob.Status.DESIGNING_CURRICULUM
    job.current_stage = 'designing_curriculum'
    job.progress_percent = 30
    job.status_message = 'Designing the curriculum blueprint from validated research.'
    job.heartbeat_at = timezone.now()
    job.save()
    generator = import_string(settings.CURRICULUM_BLUEPRINT_GENERATOR)
    blueprint = generator(
        brief=job.course_brief,
        sources=_source_context(job),
        research=_research_context(job),
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
    job.status = GenerationJob.Status.GENERATING_LESSONS
    job.current_stage = 'generating_course_package'
    job.progress_percent = 45
    job.status_message = 'Curriculum blueprint approved; generating course content.'
    job.heartbeat_at = timezone.now()
    job.save()
    return {}


def generate_course_package(state: BlueprintState):
    job = GenerationJob.objects.prefetch_related('source_documents__chunks').get(
        pk=state['job_id']
    )
    generator = import_string(settings.COURSE_PACKAGE_GENERATOR)
    package = generator(
        blueprint=state['blueprint'],
        sources=_source_context(job),
        research=_research_context(job),
        feedback=state.get('package_feedback', ''),
        previous_package=state.get('course_package'),
    )
    return {'course_package': package, 'package_validation_errors': []}


def validate_course_package(state: BlueprintState):
    try:
        package = GeneratedCoursePackage.model_validate(state['course_package'])
        package.validate_against_blueprint(state['blueprint'])
        valid_source_ids = {
            str(chunk_id)
            for chunk_id in GenerationJob.objects.get(pk=state['job_id'])
            .source_documents.filter(status='READY')
            .values_list('chunks__id', flat=True)
            if chunk_id is not None
        }
        referenced_source_ids = {
            chunk_id
            for module in package.modules
            for lesson in module.lessons
            for chunk_id in lesson.source_chunk_ids
        }
        unknown_source_ids = referenced_source_ids - valid_source_ids
        if unknown_source_ids:
            raise ValueError(
                f'Package references unknown source chunks: {sorted(unknown_source_ids)}'
            )
    except (ValidationError, ValueError) as exc:
        errors = exc.errors(include_url=False) if isinstance(exc, ValidationError) else [{'msg': str(exc)}]
        return {'package_validation_errors': errors}
    return {
        'course_package': package.model_dump(mode='json'),
        'package_validation_errors': [],
    }


def package_validation_route(state: BlueprintState):
    if not state.get('package_validation_errors'):
        return 'persist_course_package_artifact'
    if state.get('package_revision_count', 0) >= 2:
        return 'package_validation_failed'
    return 'automatic_package_revision'


def automatic_package_revision(state: BlueprintState):
    messages = [
        error.get('msg', 'Invalid package') for error in state['package_validation_errors']
    ]
    return {
        'package_feedback': 'Correct these validation errors: ' + '; '.join(messages),
        'package_revision_count': state.get('package_revision_count', 0) + 1,
    }


def package_validation_failed(state: BlueprintState):
    raise ValueError('Course package remained invalid after two automatic revision attempts.')


def persist_course_package_artifact(state: BlueprintState):
    job = GenerationJob.objects.get(pk=state['job_id'])
    version = state.get('package_revision_count', 0) + 1
    with transaction.atomic():
        GeneratedArtifact.objects.filter(
            job=job,
            type=GeneratedArtifact.Type.COURSE_PACKAGE,
            status=GeneratedArtifact.Status.DRAFT,
        ).update(status=GeneratedArtifact.Status.SUPERSEDED)
        artifact, _ = GeneratedArtifact.objects.update_or_create(
            job=job,
            type=GeneratedArtifact.Type.COURSE_PACKAGE,
            version=version,
            defaults={
                'status': GeneratedArtifact.Status.DRAFT,
                'content': state['course_package'],
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
            'COURSE_PACKAGE_READY',
            f'Generated course package version {version} is ready for final review.',
            {'artifact_id': str(artifact.id), 'version': version},
        )
    return {'package_artifact_id': str(artifact.id)}


def review_course_package(state: BlueprintState):
    response = interrupt(
        {
            'kind': 'course_package_review',
            'artifact_id': state['package_artifact_id'],
            'course_package': state['course_package'],
        }
    )
    decision = response.get('decision') if isinstance(response, dict) else None
    artifact = GeneratedArtifact.objects.select_related('job').get(
        pk=state['package_artifact_id']
    )
    if decision == 'APPROVE':
        artifact.status = GeneratedArtifact.Status.APPROVED
        artifact.save(update_fields=('status', 'updated_at'))
        artifact.job.add_event(
            'COURSE_PACKAGE_APPROVED',
            f'Generated course package version {artifact.version} was approved.',
            {'artifact_id': str(artifact.id)},
        )
        return Command(goto='persist_approved_course')
    if decision == 'REVISE':
        artifact.status = GeneratedArtifact.Status.REVISION_REQUESTED
        artifact.save(update_fields=('status', 'updated_at'))
        artifact.job.add_event(
            'COURSE_PACKAGE_REVISION_REQUESTED',
            f'Revision requested for course package version {artifact.version}.',
            {'artifact_id': str(artifact.id)},
        )
        return Command(
            update={
                'package_feedback': str(response.get('feedback') or ''),
                'package_revision_count': state.get('package_revision_count', 0) + 1,
            },
            goto='generate_course_package',
        )
    raise ValueError('Course package review decision must be APPROVE or REVISE.')


def persist_approved_course_node(state: BlueprintState):
    persist_approved_course(state['job_id'], state['package_artifact_id'])
    return {}


def build_blueprint_graph(checkpointer):
    builder = StateGraph(BlueprintState)
    builder.add_node('design_blueprint', design_blueprint)
    builder.add_node('plan_research', plan_research)
    builder.add_node('execute_research', execute_research)
    builder.add_node('validate_blueprint', validate_blueprint)
    builder.add_node('automatic_revision', automatic_revision)
    builder.add_node('validation_failed', validation_failed)
    builder.add_node('persist_blueprint', persist_blueprint)
    builder.add_node('review_blueprint', review_blueprint)
    builder.add_node('blueprint_approved', blueprint_approved)
    builder.add_node('generate_course_package', generate_course_package)
    builder.add_node('validate_course_package', validate_course_package)
    builder.add_node('automatic_package_revision', automatic_package_revision)
    builder.add_node('package_validation_failed', package_validation_failed)
    builder.add_node('persist_course_package_artifact', persist_course_package_artifact)
    builder.add_node('review_course_package', review_course_package)
    builder.add_node('persist_approved_course', persist_approved_course_node)
    builder.add_edge(START, 'plan_research')
    builder.add_edge('plan_research', 'execute_research')
    builder.add_edge('execute_research', 'design_blueprint')
    builder.add_edge('design_blueprint', 'validate_blueprint')
    builder.add_conditional_edges('validate_blueprint', validation_route)
    builder.add_edge('automatic_revision', 'design_blueprint')
    builder.add_edge('persist_blueprint', 'review_blueprint')
    builder.add_edge('blueprint_approved', 'generate_course_package')
    builder.add_edge('generate_course_package', 'validate_course_package')
    builder.add_conditional_edges('validate_course_package', package_validation_route)
    builder.add_edge('automatic_package_revision', 'generate_course_package')
    builder.add_edge('persist_course_package_artifact', 'review_course_package')
    builder.add_edge('persist_approved_course', END)
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
    interrupts = result.get('__interrupt__') or []
    if interrupts:
        interrupt_value = getattr(interrupts[0], 'value', {})
        kind = interrupt_value.get('kind') if isinstance(interrupt_value, dict) else ''
        if kind == 'course_package_review':
            job.status = GenerationJob.Status.WAITING_FOR_FINAL_APPROVAL
            job.current_stage = 'course_package_review'
            job.progress_percent = 95
            job.status_message = 'Generated course package is waiting for final approval.'
        else:
            job.status = GenerationJob.Status.WAITING_FOR_BLUEPRINT_APPROVAL
            job.current_stage = 'blueprint_review'
            job.progress_percent = 40
            job.status_message = 'Curriculum blueprint is waiting for approval.'
        job.waiting_since = timezone.now()
        job.add_event(job.status, job.status_message)
    job.save()
    return {
        'job_id': str(job.id),
        'status': job.status,
        'checkpoint_id': checkpoint_id,
        'interrupted': bool(interrupts),
    }


def run_generation_workflow(job_id):
    job = GenerationJob.objects.get(pk=job_id)
    job.status = GenerationJob.Status.RESEARCHING
    job.current_stage = 'starting_research'
    job.progress_percent = 15
    job.status_message = 'Preparing curriculum research.'
    job.heartbeat_at = timezone.now()
    job.save()
    config = _config(job_id)
    with workflow_checkpointer() as checkpointer:
        graph = build_blueprint_graph(checkpointer)
        result = graph.invoke(
            {
                'job_id': str(job_id),
                'revision_count': 0,
                'feedback': '',
                'package_revision_count': 0,
                'package_feedback': '',
            },
            config=config,
        )
        return _record_graph_result(job_id, graph, config, result)


def resume_generation_workflow(job_id, review):
    config = _config(job_id)
    with workflow_checkpointer() as checkpointer:
        graph = build_blueprint_graph(checkpointer)
        result = graph.invoke(Command(resume=review), config=config)
        return _record_graph_result(job_id, graph, config, result)
