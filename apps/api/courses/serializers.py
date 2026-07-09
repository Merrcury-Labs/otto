from rest_framework import serializers

from dashboard.models import Tutor
from users.models import User
from users.serializers import UserSerializer

from .models import Course, Enrollment, Lesson, Module


class TutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutor
        fields = ('id', 'name', 'bio', 'profile_picture', 'email', 'org')
        read_only_fields = ('id',)


class LessonSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = Lesson
        fields = (
            'id',
            'course',
            'course_name',
            'module',
            'module_title',
            'title',
            'content',
            'video_url',
            'length',
            'section_name',
        )
        read_only_fields = ('id', 'course_name', 'module_title')
        extra_kwargs = {
            'course': {'required': False},
            'section_name': {'required': False},
        }

    def validate(self, attrs):
        module = attrs.get('module') or getattr(self.instance, 'module', None)
        course = attrs.get('course') or getattr(self.instance, 'course', None)
        section_name = attrs.get('section_name') or getattr(self.instance, 'section_name', None)
        if module and course is None:
            attrs['course'] = module.course
            course = module.course
        if module and not section_name:
            attrs['section_name'] = module.title
        if course is None:
            raise serializers.ValidationError('Either course or module is required.')
        if not attrs.get('section_name') and self.instance is None:
            raise serializers.ValidationError('section_name is required when no module is provided.')
        if module and course and module.course_id != course.id:
            raise serializers.ValidationError('Module must belong to the selected course.')
        return attrs


class ModuleSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = (
            'id',
            'course',
            'course_name',
            'title',
            'description',
            'order',
            'lessons',
        )
        read_only_fields = ('id', 'course_name')


class EnrollmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)

    class Meta:
        model = Enrollment
        fields = (
            'id',
            'course',
            'course_name',
            'student',
            'student_detail',
            'enrollment_date',
            'progress',
            'completed',
            'completed_date',
        )
        read_only_fields = ('id', 'course_name', 'student_detail', 'enrollment_date', 'completed', 'completed_date')


class UnenrollStudentSerializer(serializers.Serializer):
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())


class UpdateEnrollmentProgressSerializer(serializers.Serializer):
    progress = serializers.FloatField(min_value=0.0, max_value=100.0)


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    enrollments = EnrollmentSerializer(many=True, read_only=True)
    tutor_detail = TutorSerializer(source='tutor', read_only=True)

    class Meta:
        model = Course
        fields = (
            'id',
            'name',
            'description',
            'tutor',
            'tutor_detail',
            'thumbnail',
            'image',
            'lesson_count',
            'level',
            'category',
            'prerequisites',
            'enrolled_students',
            'modules',
            'lessons',
            'enrollments',
        )
        read_only_fields = ('id', 'enrolled_students', 'tutor_detail')


class EnrollStudentSerializer(serializers.Serializer):
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
