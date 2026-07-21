from django.urls import path

from .views import GenerationJobViewSet, SourceDocumentViewSet


app_name = 'ai'

job_list = GenerationJobViewSet.as_view({'get': 'list', 'post': 'create'})
job_detail = GenerationJobViewSet.as_view({'get': 'retrieve'})
job_queue = GenerationJobViewSet.as_view({'post': 'queue'})
job_cancel = GenerationJobViewSet.as_view({'post': 'cancel'})
job_documents = GenerationJobViewSet.as_view({'get': 'documents', 'post': 'documents'})
job_artifacts = GenerationJobViewSet.as_view({'get': 'artifacts'})
job_review_blueprint = GenerationJobViewSet.as_view({'post': 'review_blueprint'})
document_detail = SourceDocumentViewSet.as_view({'get': 'retrieve'})
document_chunks = SourceDocumentViewSet.as_view({'get': 'chunks'})
document_retry = SourceDocumentViewSet.as_view({'post': 'retry'})

urlpatterns = [
    path('generation-jobs/', job_list, name='generation-job-list'),
    path('generation-jobs/<uuid:pk>/', job_detail, name='generation-job-detail'),
    path('generation-jobs/<uuid:pk>/queue/', job_queue, name='generation-job-queue'),
    path('generation-jobs/<uuid:pk>/cancel/', job_cancel, name='generation-job-cancel'),
    path('generation-jobs/<uuid:pk>/documents/', job_documents, name='generation-job-documents'),
    path('generation-jobs/<uuid:pk>/artifacts/', job_artifacts, name='generation-job-artifacts'),
    path('generation-jobs/<uuid:pk>/review-blueprint/', job_review_blueprint, name='generation-job-review-blueprint'),
    path('source-documents/<uuid:pk>/', document_detail, name='source-document-detail'),
    path('source-documents/<uuid:pk>/chunks/', document_chunks, name='source-document-chunks'),
    path('source-documents/<uuid:pk>/retry/', document_retry, name='source-document-retry'),
]
