from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import GenerationJob, GenerationJobEvent


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
