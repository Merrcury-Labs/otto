from django.db import transaction
from django.utils import timezone

from .models import GenerationJob


def queue_generation_job(job, task_dispatcher):
    """Queue after commit and retain the Celery id as operational metadata."""
    with transaction.atomic():
        job = GenerationJob.objects.select_for_update().get(pk=job.pk)
        if job.status not in {GenerationJob.Status.DRAFT, GenerationJob.Status.FAILED}:
            raise ValueError(f'Job cannot be queued from status {job.status}.')
        if job.attempt_count >= job.max_attempts:
            raise ValueError('Job has reached its maximum number of attempts.')
        incomplete_documents = job.source_documents.exclude(
            status='READY'
        ).exists()
        if incomplete_documents:
            raise ValueError('All source documents must finish processing before queueing.')

        job.status = GenerationJob.Status.QUEUED
        job.current_stage = 'queued'
        job.status_message = 'Waiting for a generation worker.'
        job.queued_at = timezone.now()
        job.failed_at = None
        job.error_code = ''
        job.error_message = ''
        job.error_details = {}
        job.save()
        job.add_event('QUEUED', job.status_message)

        def dispatch():
            try:
                result = task_dispatcher(str(job.id))
            except Exception as exc:
                GenerationJob.objects.filter(pk=job.pk).update(
                    status=GenerationJob.Status.FAILED,
                    failed_at=timezone.now(),
                    error_code='QUEUE_DISPATCH_FAILED',
                    error_message=str(exc),
                    status_message='The background job could not be queued.',
                )
                failed_job = GenerationJob.objects.get(pk=job.pk)
                failed_job.add_event('QUEUE_DISPATCH_FAILED', failed_job.status_message)
                return
            GenerationJob.objects.filter(pk=job.pk).update(celery_task_id=result.id)

        transaction.on_commit(dispatch)
    return job
