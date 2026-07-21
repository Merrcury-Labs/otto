from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.utils.module_loading import import_string

from .models import GenerationJob


class WorkflowNotConfigured(RuntimeError):
    pass


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
def resume_generation_job(self, job_id):
    return start_generation_job.run(job_id)


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
