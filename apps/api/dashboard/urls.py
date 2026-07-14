from django.urls import path

from .views import OrgViewSet, TutorViewSet

app_name = 'dashboard'

org_list = OrgViewSet.as_view({'get': 'list', 'post': 'create'})
org_detail = OrgViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

tutor_list = TutorViewSet.as_view({'get': 'list', 'post': 'create'})
tutor_detail = TutorViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path('orgs/', org_list, name='org-list'),
    path('orgs/<uuid:pk>/', org_detail, name='org-detail'),
    path('tutors/', tutor_list, name='tutor-list'),
    path('tutors/<uuid:pk>/', tutor_detail, name='tutor-detail'),
]
