from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import GenerationJob
from .serializers import GenerationJobSerializer, QueueGenerationJobSerializer
from .services import queue_generation_job
from .tasks import start_generation_job


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
