from rest_framework import serializers

from courses.serializers import CourseSerializer
from users.models import User
from users.serializers import UserSerializer

from .models import Answer, Attempt, Question, Quiz, QuizProgress


class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)

    class Meta:
        model = Answer
        fields = ('id', 'attempt', 'question', 'question_text', 'response', 'is_correct', 'points')
        read_only_fields = ('id', 'question_text', 'is_correct', 'points')


class QuestionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'quiz', 'quiz_title', 'text', 'correct_option', 'type', 'options', 'points', 'hint', 'categories')
        read_only_fields = ('id', 'quiz_title')


class AttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Attempt
        fields = (
            'id',
            'quiz',
            'quiz_title',
            'student',
            'student_detail',
            'score',
            'attempt_date',
            'max_points',
            'earned_points',
            'passed',
            'answers',
        )
        read_only_fields = ('id', 'quiz_title', 'student_detail', 'attempt_date', 'max_points', 'earned_points', 'passed')


class QuizProgressSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)

    class Meta:
        model = QuizProgress
        fields = (
            'id',
            'quiz',
            'quiz_title',
            'student',
            'student_detail',
            'best_score',
            'attempts_count',
            'completed',
            'completed_date',
            'last_attempted',
        )
        read_only_fields = ('id', 'quiz_title', 'student_detail', 'best_score', 'attempts_count', 'completed', 'completed_date', 'last_attempted')


class QuizSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    attempts = AttemptSerializer(many=True, read_only=True)
    progress_records = QuizProgressSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = (
            'id',
            'course',
            'course_detail',
            'title',
            'description',
            'length',
            'num_questions',
            'author',
            'passing_score',
            'status',
            'created_at',
            'updated_at',
            'questions',
            'attempts',
            'progress_records',
        )
        read_only_fields = ('id', 'course_detail')


class SubmitAttemptSerializer(serializers.Serializer):
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    answers = serializers.ListField(
        child=serializers.DictField(),
        help_text='List of {question_id, response} dicts',
    )
