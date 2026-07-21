from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.utils.module_loading import import_string

from .extraction import chunk_sections, extract_sections
from .models import GenerationJob, SourceChunk, SourceDocument


class WorkflowNotConfigured(RuntimeError):
    pass


@shared_task(
    bind=True,
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
    name='ai.tasks.extract_source_document',
)
def extract_source_document(self, document_id):
    with transaction.atomic():
        document = SourceDocument.objects.select_for_update().select_related('job').get(
            pk=document_id
        )
        if document.status == SourceDocument.Status.READY:
            return {'document_id': str(document.id), 'status': document.status, 'ignored': True}
        document.status = SourceDocument.Status.PROCESSING
        document.extraction_task_id = self.request.id or document.extraction_task_id
        document.error_code = ''
        document.error_message = ''
        document.save()
        document.job.add_event(
            'DOCUMENT_PROCESSING',
            f'Processing source document {document.original_filename}.',
            {'document_id': str(document.id)},
        )

    try:
        sections = extract_sections(document)
        chunks = chunk_sections(sections)
        if not chunks:
            raise ValueError('No readable text was found in the document.')
        with transaction.atomic():
            document = SourceDocument.objects.select_for_update().select_related('job').get(
                pk=document_id
            )
            document.chunks.all().delete()
            SourceChunk.objects.bulk_create(
                [SourceChunk(document=document, position=index, **chunk) for index, chunk in enumerate(chunks)]
            )
            document.status = SourceDocument.Status.READY
            document.page_count = max(
                (section.page_number or 0 for section in sections), default=0
            )
            document.character_count = sum(chunk['character_count'] for chunk in chunks)
            document.processed_at = timezone.now()
            document.save()
            document.job.add_event(
                'DOCUMENT_READY',
                f'Source document {document.original_filename} is ready.',
                {'document_id': str(document.id), 'chunk_count': len(chunks)},
            )
        return {'document_id': str(document.id), 'status': document.status, 'chunks': len(chunks)}
    except Exception as exc:
        with transaction.atomic():
            document = SourceDocument.objects.select_for_update().select_related('job').get(
                pk=document_id
            )
            document.status = SourceDocument.Status.FAILED
            document.error_code = 'EXTRACTION_FAILED'
            document.error_message = str(exc)
            document.processed_at = timezone.now()
            document.save()
            document.job.add_event(
                'DOCUMENT_FAILED',
                f'Could not process source document {document.original_filename}.',
                {'document_id': str(document.id), 'error_code': document.error_code},
            )
        raise


def _workflow_runner():
    path = settings.GENERATION_WORKFLOW_RUNNER
    if not path:
        raise WorkflowNotConfigured(
            'GENERATION_WORKFLOW_RUNNER is not configured; the LangGraph runner is not installed yet.'
        )
    return import_string(path)


@shared_task(
    bind=True,
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
    name='ai.tasks.start_generation_job',
)
def start_generation_job(self, job_id):
    with transaction.atomic():
        job = GenerationJob.objects.select_for_update().get(pk=job_id)
        if job.status == GenerationJob.Status.CANCEL_REQUESTED:
            job.status = GenerationJob.Status.CANCELLED
            job.status_message = 'Job cancelled before execution.'
            job.save()
            job.add_event('CANCELLED', job.status_message)
            return {'job_id': str(job.id), 'status': job.status}
        if job.status != GenerationJob.Status.QUEUED:
            return {'job_id': str(job.id), 'status': job.status, 'ignored': True}
        now = timezone.now()
        job.status = GenerationJob.Status.STARTING
        job.current_stage = 'starting'
        job.status_message = 'Generation worker started.'
        job.started_at = job.started_at or now
        job.heartbeat_at = now
        job.attempt_count += 1
        job.celery_task_id = self.request.id or job.celery_task_id
        job.save()
        job.add_event('STARTED', job.status_message, {'attempt': job.attempt_count})

    try:
        result = _workflow_runner()(str(job.id))
    except WorkflowNotConfigured as exc:
        _mark_failed(job.id, 'WORKFLOW_NOT_CONFIGURED', str(exc))
        return {'job_id': str(job.id), 'status': GenerationJob.Status.FAILED}
    except Exception as exc:
        _mark_failed(job.id, 'WORKFLOW_FAILED', str(exc))
        raise
    return result


@shared_task(bind=True, name='ai.tasks.resume_generation_job')
def resume_generation_job(self, job_id, review):
    from .workflow import resume_generation_workflow

    with transaction.atomic():
        job = GenerationJob.objects.select_for_update().get(pk=job_id)
        if job.status != GenerationJob.Status.WAITING_FOR_BLUEPRINT_APPROVAL:
            return {'job_id': str(job.id), 'status': job.status, 'ignored': True}
        job.current_stage = 'resuming_blueprint_review'
        job.status_message = 'Applying curriculum blueprint review.'
        job.heartbeat_at = timezone.now()
        job.celery_task_id = self.request.id or job.celery_task_id
        job.save()
        job.add_event('BLUEPRINT_REVIEW_RECEIVED', job.status_message)
    try:
        return resume_generation_workflow(str(job.id), review)
    except Exception as exc:
        _mark_failed(job.id, 'WORKFLOW_RESUME_FAILED', str(exc))
        raise


def _mark_failed(job_id, code, message):
    with transaction.atomic():
        job = GenerationJob.objects.select_for_update().get(pk=job_id)
        if job.status in GenerationJob.TERMINAL_STATUSES:
            return
        job.status = GenerationJob.Status.FAILED
        job.failed_at = timezone.now()
        job.error_code = code
        job.error_message = message
        job.status_message = 'Generation job failed.'
        job.save()
        job.add_event('FAILED', job.status_message, {'error_code': code})


@shared_task(name='ai.tasks.recover_stalled_jobs')
def recover_stalled_jobs():
    stale_before = timezone.now() - timedelta(
        seconds=settings.GENERATION_JOB_STALE_AFTER_SECONDS
    )
    job_ids = list(
        GenerationJob.objects.filter(
            status__in=GenerationJob.ACTIVE_STATUSES,
            heartbeat_at__lt=stale_before,
            attempt_count__lt=models.F('max_attempts'),
        ).values_list('id', flat=True)
    )
    for job_id in job_ids:
        GenerationJob.objects.filter(pk=job_id).update(
            status=GenerationJob.Status.QUEUED,
            current_stage='recovery',
            status_message='Recovering a stalled generation job.',
            queued_at=timezone.now(),
        )
        start_generation_job.delay(str(job_id))
    return {'recovered': len(job_ids)}
