import hashlib
from pathlib import Path

from django.db import transaction
from rest_framework import serializers
from users.models import User

from .models import (
    ArtifactReview,
    GeneratedArtifact,
    GenerationJob,
    GenerationJobEvent,
    SourceChunk,
    SourceDocument,
)


SUPPORTED_SOURCE_EXTENSIONS = {'.pdf', '.docx', '.txt', '.md', '.html', '.htm'}
SUPPORTED_CONTENT_TYPES = {
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/html',
}


class GenerationJobEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenerationJobEvent
        fields = ('id', 'event_type', 'status', 'stage', 'message', 'metadata', 'created_at')
        read_only_fields = fields


class GenerationJobSerializer(serializers.ModelSerializer):
    events = GenerationJobEventSerializer(many=True, read_only=True)

    class Meta:
        model = GenerationJob
        fields = (
            'id', 'organization', 'tutor', 'requested_by', 'result_course',
            'celery_task_id', 'status', 'current_stage', 'progress_percent',
            'status_message', 'course_brief', 'input_config', 'graph_thread_id',
            'graph_checkpoint_id', 'attempt_count', 'max_attempts', 'heartbeat_at',
            'queued_at', 'started_at', 'waiting_since', 'completed_at', 'failed_at',
            'cancel_requested_at', 'error_code', 'error_message', 'error_details',
            'created_at', 'updated_at', 'events',
        )
        read_only_fields = (
            'id', 'result_course', 'celery_task_id', 'status', 'current_stage',
            'progress_percent', 'status_message', 'graph_thread_id',
            'graph_checkpoint_id', 'attempt_count', 'heartbeat_at', 'queued_at',
            'started_at', 'waiting_since', 'completed_at', 'failed_at',
            'cancel_requested_at', 'error_code', 'error_message', 'error_details',
            'created_at', 'updated_at', 'events',
        )

    def validate(self, attrs):
        tutor = attrs.get('tutor')
        organization = attrs.get('organization')
        if tutor and organization and tutor.org_id != organization.id:
            raise serializers.ValidationError(
                {'tutor': 'Tutor must belong to the selected organization.'}
            )
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            job = GenerationJob.objects.create(**validated_data)
            job.add_event('CREATED', 'Generation job draft created.')
        return job


class QueueGenerationJobSerializer(serializers.Serializer):
    force = serializers.BooleanField(default=False)


class SourceChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceChunk
        fields = (
            'id', 'position', 'page_number', 'heading', 'content', 'content_hash',
            'character_count', 'metadata', 'created_at',
        )
        read_only_fields = fields


class SourceDocumentSerializer(serializers.ModelSerializer):
    chunk_count = serializers.IntegerField(source='chunks.count', read_only=True)

    class Meta:
        model = SourceDocument
        fields = (
            'id', 'job', 'file', 'original_filename', 'content_type', 'file_size',
            'sha256', 'status', 'page_count', 'character_count', 'chunk_count',
            'extraction_task_id', 'error_code', 'error_message', 'processed_at',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'job', 'original_filename', 'content_type', 'file_size', 'sha256',
            'status', 'page_count', 'character_count', 'chunk_count',
            'extraction_task_id', 'error_code', 'error_message', 'processed_at',
            'created_at', 'updated_at',
        )

    def validate_file(self, uploaded_file):
        max_size = self.context['max_upload_size']
        extension = Path(uploaded_file.name).suffix.lower()
        if extension not in SUPPORTED_SOURCE_EXTENSIONS:
            raise serializers.ValidationError(
                f'Unsupported file type. Allowed: {", ".join(sorted(SUPPORTED_SOURCE_EXTENSIONS))}.'
            )
        if uploaded_file.content_type not in SUPPORTED_CONTENT_TYPES:
            raise serializers.ValidationError('The uploaded content type is not supported.')
        if uploaded_file.size <= 0:
            raise serializers.ValidationError('The uploaded file is empty.')
        if uploaded_file.size > max_size:
            raise serializers.ValidationError(
                f'The uploaded file exceeds the {max_size} byte limit.'
            )
        return uploaded_file

    def create(self, validated_data):
        uploaded_file = validated_data['file']
        digest = hashlib.sha256()
        for part in uploaded_file.chunks():
            digest.update(part)
        uploaded_file.seek(0)
        if SourceDocument.objects.filter(
            job=self.context['job'], sha256=digest.hexdigest()
        ).exists():
            raise serializers.ValidationError(
                {'file': 'This document has already been uploaded to the job.'}
            )
        return SourceDocument.objects.create(
            job=self.context['job'],
            original_filename=Path(uploaded_file.name).name,
            content_type=uploaded_file.content_type,
            file_size=uploaded_file.size,
            sha256=digest.hexdigest(),
            **validated_data,
        )


class ArtifactReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtifactReview
        fields = ('id', 'artifact', 'decided_by', 'decision', 'feedback', 'created_at')
        read_only_fields = ('id', 'artifact', 'created_at')


class GeneratedArtifactSerializer(serializers.ModelSerializer):
    reviews = ArtifactReviewSerializer(many=True, read_only=True)

    class Meta:
        model = GeneratedArtifact
        fields = (
            'id', 'job', 'type', 'version', 'status', 'content',
            'validation_errors', 'source_document_ids', 'created_at', 'updated_at',
            'reviews',
        )
        read_only_fields = fields


class BlueprintReviewSerializer(serializers.Serializer):
    decided_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    decision = serializers.ChoiceField(choices=ArtifactReview.Decision.choices)
    feedback = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if attrs['decision'] == ArtifactReview.Decision.REVISE and not attrs['feedback'].strip():
            raise serializers.ValidationError(
                {'feedback': 'Feedback is required when requesting a revision.'}
            )
        return attrs
