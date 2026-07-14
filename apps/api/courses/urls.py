from django.urls import path

from .views import CourseViewSet, EnrollmentViewSet, LessonViewSet, ModuleViewSet

app_name = 'courses'

course_list = CourseViewSet.as_view({'get': 'list', 'post': 'create'})
course_detail = CourseViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})
course_enroll = CourseViewSet.as_view({'post': 'enroll'})
course_unenroll = CourseViewSet.as_view({'post': 'unenroll'})

lesson_list = LessonViewSet.as_view({'get': 'list', 'post': 'create'})
lesson_detail = LessonViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

module_list = ModuleViewSet.as_view({'get': 'list', 'post': 'create'})
module_detail = ModuleViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

enrollment_list = EnrollmentViewSet.as_view({'get': 'list', 'post': 'create'})
enrollment_detail = EnrollmentViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})
enrollment_update_progress = EnrollmentViewSet.as_view({'patch': 'update_progress'})

urlpatterns = [
    path('', course_list, name='course-list'),
    path('<uuid:pk>/', course_detail, name='course-detail'),
    path('<uuid:pk>/enroll/', course_enroll, name='course-enroll'),
    path('<uuid:pk>/unenroll/', course_unenroll, name='course-unenroll'),
    path('modules/', module_list, name='module-list'),
    path('modules/<uuid:pk>/', module_detail, name='module-detail'),
    path('lessons/', lesson_list, name='lesson-list'),
    path('lessons/<uuid:pk>/', lesson_detail, name='lesson-detail'),
    path('enrollments/', enrollment_list, name='enrollment-list'),
    path('enrollments/<uuid:pk>/', enrollment_detail, name='enrollment-detail'),
    path('enrollments/<uuid:pk>/progress/', enrollment_update_progress, name='enrollment-progress'),
]
