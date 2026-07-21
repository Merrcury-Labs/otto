import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class GenerationJob(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        QUEUED = 'QUEUED', 'Queued'
        STARTING = 'STARTING', 'Starting'
        INGESTING_DOCUMENTS = 'INGESTING_DOCUMENTS', 'Ingesting documents'
        RESEARCHING = 'RESEARCHING', 'Researching'
        DESIGNING_CURRICULUM = 'DESIGNING_CURRICULUM', 'Designing curriculum'
        WAITING_FOR_BLUEPRINT_APPROVAL = (
            'WAITING_FOR_BLUEPRINT_APPROVAL',
            'Waiting for blueprint approval',
        )
        GENERATING_LESSONS = 'GENERATING_LESSONS', 'Generating lessons'
        GENERATING_ASSESSMENTS = 'GENERATING_ASSESSMENTS', 'Generating assessments'
        GENERATING_FLASHCARDS = 'GENERATING_FLASHCARDS', 'Generating flashcards'
        REVIEWING = 'REVIEWING', 'Reviewing'
        REVISION_REQUIRED = 'REVISION_REQUIRED', 'Revision required'
        WAITING_FOR_FINAL_APPROVAL = (
            'WAITING_FOR_FINAL_APPROVAL',
            'Waiting for final approval',
        )
        PERSISTING = 'PERSISTING', 'Persisting'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        CANCEL_REQUESTED = 'CANCEL_REQUESTED', 'Cancellation requested'
        CANCELLED = 'CANCELLED', 'Cancelled'

    TERMINAL_STATUSES = {Status.COMPLETED, Status.FAILED, Status.CANCELLED}
    WAITING_STATUSES = {
        Status.WAITING_FOR_BLUEPRINT_APPROVAL,
        Status.WAITING_FOR_FINAL_APPROVAL,
        Status.REVISION_REQUIRED,
    }
    ACTIVE_STATUSES = {
        Status.QUEUED,
        Status.STARTING,
        Status.INGESTING_DOCUMENTS,
        Status.RESEARCHING,
        Status.DESIGNING_CURRICULUM,
        Status.GENERATING_LESSONS,
        Status.GENERATING_ASSESSMENTS,
        Status.GENERATING_FLASHCARDS,
        Status.REVIEWING,
        Status.PERSISTING,
        Status.CANCEL_REQUESTED,
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'dashboard.Org', related_name='generation_jobs', on_delete=models.CASCADE
    )
    tutor = models.ForeignKey(
        'dashboard.Tutor', related_name='generation_jobs', on_delete=models.PROTECT
    )
    requested_by = models.ForeignKey(
        'users.User', related_name='generation_jobs', on_delete=models.PROTECT
    )
    result_course = models.ForeignKey(
        'courses.Course',
        related_name='generation_jobs',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    celery_task_id = models.CharField(max_length=255, blank=True, db_index=True)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.DRAFT, db_index=True)
    current_stage = models.CharField(max_length=100, blank=True)
    progress_percent = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    status_message = models.TextField(blank=True)
    course_brief = models.JSONField(default=dict)
    input_config = models.JSONField(default=dict, blank=True)
    graph_thread_id = models.CharField(max_length=255, blank=True)
    graph_checkpoint_id = models.CharField(max_length=255, blank=True)
    attempt_count = models.PositiveIntegerField(default=0)
    max_attempts = models.PositiveIntegerField(default=3)
    heartbeat_at = models.DateTimeField(null=True, blank=True, db_index=True)
    queued_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    waiting_since = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    cancel_requested_at = models.DateTimeField(null=True, blank=True)
    error_code = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    error_details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)
        indexes = [models.Index(fields=('organization', 'status', '-created_at'))]

    def __str__(self):
        return f'{self.id} ({self.status})'

    def add_event(self, event_type, message='', metadata=None):
        return self.events.create(
            event_type=event_type,
            status=self.status,
            stage=self.current_stage,
            message=message,
            metadata=metadata or {},
        )

    def request_cancellation(self):
        if self.status in self.TERMINAL_STATUSES:
            return False
        self.status = self.Status.CANCEL_REQUESTED
        self.cancel_requested_at = timezone.now()
        self.status_message = 'Cancellation requested.'
        self.save(
            update_fields=(
                'status', 'cancel_requested_at', 'status_message', 'updated_at'
            )
        )
        self.add_event('CANCEL_REQUESTED', self.status_message)
        return True


class GenerationJobEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(GenerationJob, related_name='events', on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100)
    status = models.CharField(max_length=50, choices=GenerationJob.Status.choices)
    stage = models.CharField(max_length=100, blank=True)
    message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)
        indexes = [models.Index(fields=('job', 'created_at'))]

    def __str__(self):
        return f'{self.job_id}: {self.event_type}'
