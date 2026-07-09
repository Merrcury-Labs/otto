from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.utils import timezone

from .models import Course, Enrollment, Lesson, Module
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    EnrollStudentSerializer,
    LessonSerializer,
    ModuleSerializer,
    UnenrollStudentSerializer,
    UpdateEnrollmentProgressSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = (
        Course.objects.select_related('tutor').prefetch_related(
            'modules__lessons',
            'lessons',
            'enrollments__student',
        ).order_by('name')
    )
    serializer_class = CourseSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, pk=None):
        serializer = EnrollStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(
            course=course,
            student=serializer.validated_data['student'],
        )
        if created:
            course.enrolled_students = Enrollment.objects.filter(course=course).count()
            course.save(update_fields=['enrolled_students'])

        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(EnrollmentSerializer(enrollment).data, status=status_code)

    @action(detail=True, methods=['post'], url_path='unenroll')
    def unenroll(self, request, pk=None):
        serializer = UnenrollStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course = self.get_object()
        deleted, _ = Enrollment.objects.filter(
            course=course,
            student=serializer.validated_data['student'],
        ).delete()
        if deleted:
            course.enrolled_students = Enrollment.objects.filter(course=course).count()
            course.save(update_fields=['enrolled_students'])

        return Response({'unenrolled': bool(deleted)})


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related('course', 'module').order_by(
        'course__name',
        'module__order',
        'title',
    )
    serializer_class = LessonSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.select_related('course').prefetch_related('lessons').order_by(
        'course__name',
        'order',
        'title',
    )
    serializer_class = ModuleSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related('course', 'student').order_by('-enrollment_date')
    serializer_class = EnrollmentSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @action(detail=True, methods=['patch'], url_path='progress')
    def update_progress(self, request, pk=None):
        enrollment = self.get_object()
        serializer = UpdateEnrollmentProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        progress = serializer.validated_data['progress']
        enrollment.progress = progress

        if progress >= 100.0:
            enrollment.completed = True
            enrollment.completed_date = timezone.now()
        else:
            enrollment.completed = False
            enrollment.completed_date = None

        enrollment.save(update_fields=['progress', 'completed', 'completed_date'])
        return Response(EnrollmentSerializer(enrollment).data)
