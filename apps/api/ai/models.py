import uuid
from pathlib import Path

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


def source_document_upload_path(instance, filename):
    suffix = Path(filename).suffix.lower()
    return f'generation-jobs/{instance.job_id}/sources/{instance.id}{suffix}'


class GenerationJob(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        QUEUED = 'QUEUED', 'Queued'
        STARTING = 'STARTING', 'Starting'
        INGESTING_DOCUMENTS = 'INGESTING_DOCUMENTS', 'Ingesting documents'
        RESEARCHING = 'RESEARCHING', 'Researching'
        DESIGNING_CURRICULUM = 'DESIGNING_CURRICULUM', 'Designing curriculum'
        BLUEPRINT_APPROVED = 'BLUEPRINT_APPROVED', 'Blueprint approved'
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
    max_ai_tokens = models.PositiveIntegerField(default=250000)
    max_ai_cost_usd = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
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


class SourceDocument(models.Model):
    class Status(models.TextChoices):
        UPLOADED = 'UPLOADED', 'Uploaded'
        PROCESSING = 'PROCESSING', 'Processing'
        READY = 'READY', 'Ready'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        GenerationJob, related_name='source_documents', on_delete=models.CASCADE
    )
    file = models.FileField(upload_to=source_document_upload_path, max_length=500)
    original_filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    file_size = models.PositiveBigIntegerField()
    sha256 = models.CharField(max_length=64, db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.UPLOADED, db_index=True
    )
    page_count = models.PositiveIntegerField(default=0)
    character_count = models.PositiveBigIntegerField(default=0)
    extraction_task_id = models.CharField(max_length=255, blank=True)
    error_code = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('created_at',)
        constraints = [
            models.UniqueConstraint(
                fields=('job', 'sha256'), name='unique_source_document_per_job'
            )
        ]

    def __str__(self):
        return self.original_filename


class SourceChunk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        SourceDocument, related_name='chunks', on_delete=models.CASCADE
    )
    position = models.PositiveIntegerField()
    page_number = models.PositiveIntegerField(null=True, blank=True)
    heading = models.CharField(max_length=500, blank=True)
    content = models.TextField()
    content_hash = models.CharField(max_length=64)
    character_count = models.PositiveIntegerField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('position',)
        constraints = [
            models.UniqueConstraint(
                fields=('document', 'position'), name='unique_source_chunk_position'
            )
        ]
        indexes = [models.Index(fields=('document', 'page_number'))]

    def __str__(self):
        return f'{self.document_id}:{self.position}'


class GeneratedArtifact(models.Model):
    class Type(models.TextChoices):
        BLUEPRINT = 'BLUEPRINT', 'Curriculum blueprint'
        COURSE_PACKAGE = 'COURSE_PACKAGE', 'Generated course package'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        APPROVED = 'APPROVED', 'Approved'
        REVISION_REQUESTED = 'REVISION_REQUESTED', 'Revision requested'
        SUPERSEDED = 'SUPERSEDED', 'Superseded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        GenerationJob, related_name='artifacts', on_delete=models.CASCADE
    )
    type = models.CharField(max_length=30, choices=Type.choices)
    version = models.PositiveIntegerField()
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.DRAFT, db_index=True
    )
    content = models.JSONField(default=dict)
    validation_errors = models.JSONField(default=list, blank=True)
    source_document_ids = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('type', '-version')
        constraints = [
            models.UniqueConstraint(
                fields=('job', 'type', 'version'), name='unique_generated_artifact_version'
            )
        ]

    def __str__(self):
        return f'{self.job_id}:{self.type}:v{self.version}'


class ArtifactReview(models.Model):
    class Decision(models.TextChoices):
        APPROVE = 'APPROVE', 'Approve'
        REVISE = 'REVISE', 'Request revision'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artifact = models.ForeignKey(
        GeneratedArtifact, related_name='reviews', on_delete=models.CASCADE
    )
    decided_by = models.ForeignKey(
        'users.User', related_name='artifact_reviews', on_delete=models.PROTECT
    )
    decision = models.CharField(max_length=20, choices=Decision.choices)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)
        constraints = [
            models.UniqueConstraint(
                fields=('artifact',), name='one_review_per_artifact_version'
            )
        ]

    def __str__(self):
        return f'{self.artifact_id}:{self.decision}'


class ResearchQuestion(models.Model):
    class Status(models.TextChoices):
        PLANNED = 'PLANNED', 'Planned'
        COMPLETED = 'COMPLETED', 'Completed'
        NO_RESULTS = 'NO_RESULTS', 'No results'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        GenerationJob, related_name='research_questions', on_delete=models.CASCADE
    )
    query = models.TextField()
    rationale = models.TextField(blank=True)
    priority = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PLANNED, db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('priority', 'created_at')
        constraints = [
            models.UniqueConstraint(
                fields=('job', 'query'), name='unique_research_question_per_job'
            )
        ]

    def __str__(self):
        return self.query


class ResearchSource(models.Model):
    class Type(models.TextChoices):
        DOCUMENT = 'DOCUMENT', 'Uploaded document'
        WEB = 'WEB', 'Web source'
        DATABASE = 'DATABASE', 'Database source'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        GenerationJob, related_name='research_sources', on_delete=models.CASCADE
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    canonical_uri = models.CharField(max_length=1000)
    url = models.URLField(max_length=1000, blank=True)
    title = models.CharField(max_length=500)
    publisher = models.CharField(max_length=255, blank=True)
    authors = models.JSONField(default=list, blank=True)
    published_at = models.DateField(null=True, blank=True)
    retrieved_at = models.DateTimeField(default=timezone.now)
    reliability_score = models.FloatField(
        default=0.5, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-reliability_score', 'title')
        constraints = [
            models.UniqueConstraint(
                fields=('job', 'canonical_uri'), name='unique_research_source_per_job'
            )
        ]

    def __str__(self):
        return self.title


class ResearchFinding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        ResearchQuestion, related_name='findings', on_delete=models.CASCADE
    )
    source = models.ForeignKey(
        ResearchSource, related_name='findings', on_delete=models.CASCADE
    )
    claim = models.TextField()
    evidence = models.TextField()
    confidence = models.FloatField(
        default=0.5, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    source_locator = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('question__priority', '-confidence', 'created_at')

    def __str__(self):
        return self.claim[:100]


class AIUsageRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        GenerationJob, related_name='ai_usage_records', on_delete=models.CASCADE
    )
    operation = models.CharField(max_length=100, db_index=True)
    provider = models.CharField(max_length=100)
    model = models.CharField(max_length=255)
    request_id = models.CharField(max_length=255, blank=True, db_index=True)
    input_tokens = models.PositiveIntegerField(default=0)
    output_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    estimated_cost_usd = models.DecimalField(max_digits=12, decimal_places=6, default=0)
    latency_ms = models.PositiveIntegerField(default=0)
    success = models.BooleanField(default=True, db_index=True)
    error_code = models.CharField(max_length=100, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)
        indexes = [models.Index(fields=('job', 'operation', 'created_at'))]

    def __str__(self):
        return f'{self.job_id}:{self.operation}:{self.total_tokens}'
