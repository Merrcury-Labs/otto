from django.conf import settings
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ArtifactReview, GeneratedArtifact, GenerationJob, SourceDocument
from .serializers import (
    BlueprintReviewSerializer,
    GeneratedArtifactSerializer,
    FinalReviewSerializer,
    GenerationJobSerializer,
    QueueGenerationJobSerializer,
    SourceChunkSerializer,
    SourceDocumentSerializer,
)
from .services import queue_generation_job
from .tasks import extract_source_document, resume_generation_job, start_generation_job


class GenerationJobViewSet(viewsets.ModelViewSet):
    queryset = GenerationJob.objects.select_related(
        'organization', 'tutor', 'requested_by', 'result_course'
    ).prefetch_related('events')
    serializer_class = GenerationJobSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)
    http_method_names = ('get', 'post', 'head', 'options')

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        organization_id = self.request.query_params.get('organization')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        return queryset

    @action(detail=True, methods=('post',))
    def queue(self, request, pk=None):
        serializer = QueueGenerationJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            job = queue_generation_job(self.get_object(), start_generation_job.delay)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_409_CONFLICT)
        return Response(GenerationJobSerializer(job).data, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=('post',))
    def cancel(self, request, pk=None):
        with transaction.atomic():
            job = GenerationJob.objects.select_for_update().get(pk=self.get_object().pk)
            changed = job.request_cancellation()
        response_status = status.HTTP_202_ACCEPTED if changed else status.HTTP_409_CONFLICT
        return Response(GenerationJobSerializer(job).data, status=response_status)

    @action(
        detail=True,
        methods=('get', 'post'),
        parser_classes=(MultiPartParser, FormParser),
    )
    def documents(self, request, pk=None):
        job = self.get_object()
        if request.method == 'GET':
            documents = job.source_documents.prefetch_related('chunks').all()
            return Response(SourceDocumentSerializer(documents, many=True).data)
        if job.status != GenerationJob.Status.DRAFT:
            return Response(
                {'detail': 'Documents can only be uploaded while the job is a draft.'},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = SourceDocumentSerializer(
            data=request.data,
            context={'job': job, 'max_upload_size': settings.SOURCE_DOCUMENT_MAX_BYTES},
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            document = serializer.save()
            job.add_event(
                'DOCUMENT_UPLOADED',
                f'Uploaded source document {document.original_filename}.',
                {'document_id': str(document.id)},
            )

            def dispatch_extraction():
                try:
                    result = extract_source_document.delay(str(document.id))
                except Exception as exc:
                    SourceDocument.objects.filter(pk=document.pk).update(
                        status=SourceDocument.Status.FAILED,
                        error_code='QUEUE_DISPATCH_FAILED',
                        error_message=str(exc),
                    )
                    return
                SourceDocument.objects.filter(pk=document.pk).update(
                    extraction_task_id=result.id
                )

            transaction.on_commit(dispatch_extraction)
        return Response(SourceDocumentSerializer(document).data, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=('get',))
    def artifacts(self, request, pk=None):
        artifacts = self.get_object().artifacts.prefetch_related('reviews').all()
        return Response(GeneratedArtifactSerializer(artifacts, many=True).data)

    @action(detail=True, methods=('post',))
    def review_blueprint(self, request, pk=None):
        serializer = BlueprintReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            job = GenerationJob.objects.select_for_update().get(pk=self.get_object().pk)
            if job.status != GenerationJob.Status.WAITING_FOR_BLUEPRINT_APPROVAL:
                return Response(
                    {'detail': 'This job is not waiting for blueprint approval.'},
                    status=status.HTTP_409_CONFLICT,
                )
            decided_by = serializer.validated_data['decided_by']
            if decided_by.id != job.requested_by_id:
                return Response(
                    {'detail': 'Only the job requester can review this blueprint.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            artifact = job.artifacts.filter(
                type=GeneratedArtifact.Type.BLUEPRINT,
                status=GeneratedArtifact.Status.DRAFT,
            ).order_by('-version').first()
            if artifact is None:
                return Response(
                    {'detail': 'No draft blueprint is available for review.'},
                    status=status.HTTP_409_CONFLICT,
                )
            if artifact.reviews.exists():
                return Response(
                    {'detail': 'A review has already been submitted for this blueprint version.'},
                    status=status.HTTP_409_CONFLICT,
                )
            review = ArtifactReview.objects.create(
                artifact=artifact,
                decided_by=decided_by,
                decision=serializer.validated_data['decision'],
                feedback=serializer.validated_data['feedback'],
            )
            review_payload = {
                'decision': review.decision,
                'feedback': review.feedback,
                'review_id': str(review.id),
            }

            def dispatch_resume():
                result = resume_generation_job.delay(str(job.id), review_payload)
                GenerationJob.objects.filter(pk=job.pk).update(celery_task_id=result.id)

            transaction.on_commit(dispatch_resume)
        return Response(
            GeneratedArtifactSerializer(artifact).data,
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=('post',))
    def review_final(self, request, pk=None):
        serializer = FinalReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            job = GenerationJob.objects.select_for_update().get(pk=self.get_object().pk)
            if job.status != GenerationJob.Status.WAITING_FOR_FINAL_APPROVAL:
                return Response(
                    {'detail': 'This job is not waiting for final approval.'},
                    status=status.HTTP_409_CONFLICT,
                )
            decided_by = serializer.validated_data['decided_by']
            if decided_by.id != job.requested_by_id:
                return Response(
                    {'detail': 'Only the job requester can review this course package.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            artifact = job.artifacts.filter(
                type=GeneratedArtifact.Type.COURSE_PACKAGE,
                status=GeneratedArtifact.Status.DRAFT,
            ).order_by('-version').first()
            if artifact is None:
                return Response(
                    {'detail': 'No draft course package is available for review.'},
                    status=status.HTTP_409_CONFLICT,
                )
            if artifact.reviews.exists():
                return Response(
                    {'detail': 'A review has already been submitted for this package version.'},
                    status=status.HTTP_409_CONFLICT,
                )
            review = ArtifactReview.objects.create(
                artifact=artifact,
                decided_by=decided_by,
                decision=serializer.validated_data['decision'],
                feedback=serializer.validated_data['feedback'],
            )
            review_payload = {
                'decision': review.decision,
                'feedback': review.feedback,
                'review_id': str(review.id),
            }

            def dispatch_resume():
                result = resume_generation_job.delay(str(job.id), review_payload)
                GenerationJob.objects.filter(pk=job.pk).update(celery_task_id=result.id)

            transaction.on_commit(dispatch_resume)
        return Response(
            GeneratedArtifactSerializer(artifact).data,
            status=status.HTTP_202_ACCEPTED,
        )


class SourceDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SourceDocument.objects.select_related('job').prefetch_related('chunks')
    serializer_class = SourceDocumentSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @action(detail=True, methods=('get',))
    def chunks(self, request, pk=None):
        return Response(SourceChunkSerializer(self.get_object().chunks.all(), many=True).data)

    @action(detail=True, methods=('post',))
    def retry(self, request, pk=None):
        document = self.get_object()
        if document.status != SourceDocument.Status.FAILED:
            return Response(
                {'detail': 'Only failed documents can be retried.'},
                status=status.HTTP_409_CONFLICT,
            )
        document.status = SourceDocument.Status.UPLOADED
        document.error_code = ''
        document.error_message = ''
        document.save()
        result = extract_source_document.delay(str(document.id))
        document.extraction_task_id = result.id
        document.save(update_fields=('extraction_task_id', 'updated_at'))
        return Response(SourceDocumentSerializer(document).data, status=status.HTTP_202_ACCEPTED)
