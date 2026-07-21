from django.urls import path

from .views import GenerationJobViewSet


app_name = 'ai'

job_list = GenerationJobViewSet.as_view({'get': 'list', 'post': 'create'})
job_detail = GenerationJobViewSet.as_view({'get': 'retrieve'})
job_queue = GenerationJobViewSet.as_view({'post': 'queue'})
job_cancel = GenerationJobViewSet.as_view({'post': 'cancel'})

urlpatterns = [
    path('generation-jobs/', job_list, name='generation-job-list'),
    path('generation-jobs/<uuid:pk>/', job_detail, name='generation-job-detail'),
    path('generation-jobs/<uuid:pk>/queue/', job_queue, name='generation-job-queue'),
    path('generation-jobs/<uuid:pk>/cancel/', job_cancel, name='generation-job-cancel'),
]
