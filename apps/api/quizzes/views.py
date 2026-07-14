from datetime import datetime

from django.db.models import F
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Answer, Attempt, Question, Quiz, QuizProgress
from .schema import evaluate_answer
from .serializers import (
    AnswerSerializer,
    AttemptSerializer,
    QuestionSerializer,
    QuizProgressSerializer,
    QuizSerializer,
    SubmitAttemptSerializer,
)


class QuizViewSet(viewsets.ModelViewSet):
    queryset = (
        Quiz.objects.select_related('course')
        .prefetch_related('questions', 'attempts__student', 'attempts__answers', 'progress_records__student')
        .order_by('title')
    )
    serializer_class = QuizSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @action(detail=True, methods=['post'], url_path='attempts')
    def submit_attempt(self, request, pk=None):
        quiz = self.get_object()
        serializer = SubmitAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = serializer.validated_data['student']
        answers_data = serializer.validated_data['answers']

        # Build a lookup of quiz questions for validation
        quiz_questions = {str(q.id): q for q in quiz.questions.all()}

        # Calculate max possible points
        max_points = sum(q.points for q in quiz_questions.values())

        # Evaluate each answer
        earned_points = 0
        answer_objects = []
        for answer_data in answers_data:
            question_id = str(answer_data.get('question_id', ''))
            response = answer_data.get('response')

            question = quiz_questions.get(question_id)
            if question is None:
                continue

            is_correct, points_awarded = evaluate_answer(question, response)
            earned_points += points_awarded
            answer_objects.append(
                Answer(
                    question=question,
                    response=response,
                    is_correct=is_correct,
                    points=points_awarded,
                )
            )

        # Calculate score as percentage
        score = (earned_points / max_points * 100) if max_points > 0 else 0.0
        passed = score >= quiz.passing_score

        # Create the attempt
        attempt = Attempt.objects.create(
            quiz=quiz,
            student=student,
            score=round(score, 2),
            max_points=max_points,
            earned_points=earned_points,
            passed=passed,
        )

        # Bulk-create answers linked to the attempt
        for answer_obj in answer_objects:
            answer_obj.attempt = attempt
        Answer.objects.bulk_create(answer_objects)

        # Update quiz progress
        progress, _ = QuizProgress.objects.get_or_create(quiz=quiz, student=student)
        progress.attempts_count += 1
        progress.last_attempted = datetime.now()
        if score > progress.best_score:
            progress.best_score = round(score, 2)
        if passed and not progress.completed:
            progress.completed = True
            progress.completed_date = datetime.now()
        progress.save()

        return Response(AttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.select_related('quiz').order_by('quiz__title', 'id')
    serializer_class = QuestionSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.select_related('quiz', 'student').prefetch_related('answers').order_by('-attempt_date')
    serializer_class = AttemptSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class AnswerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Answer.objects.select_related('attempt', 'question').order_by('attempt', 'question')
    serializer_class = AnswerSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class QuizProgressViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuizProgress.objects.select_related('quiz', 'student').order_by('student__name', 'quiz__title')
    serializer_class = QuizProgressSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def by_student(self, request, student_id=None):
        progress = QuizProgress.objects.filter(
            student_id=student_id,
        ).select_related('quiz', 'student')
        serializer = QuizProgressSerializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='quiz/(?P<quiz_id>[^/.]+)/(?P<student_id>[^/.]+)')
    def by_quiz_student(self, request, quiz_id=None, student_id=None):
        progress = QuizProgress.objects.filter(
            quiz_id=quiz_id,
            student_id=student_id,
        ).select_related('quiz', 'student').first()
        if progress is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = QuizProgressSerializer(progress)
        return Response(serializer.data)
