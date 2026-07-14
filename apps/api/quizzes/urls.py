from django.urls import path

from .views import AnswerViewSet, AttemptViewSet, QuestionViewSet, QuizProgressViewSet, QuizViewSet

app_name = 'quizzes'

quiz_list = QuizViewSet.as_view({'get': 'list', 'post': 'create'})
quiz_detail = QuizViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})
quiz_attempt = QuizViewSet.as_view({'post': 'submit_attempt'})

question_list = QuestionViewSet.as_view({'get': 'list', 'post': 'create'})
question_detail = QuestionViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

attempt_list = AttemptViewSet.as_view({'get': 'list', 'post': 'create'})
attempt_detail = AttemptViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

answer_list = AnswerViewSet.as_view({'get': 'list'})
answer_detail = AnswerViewSet.as_view({'get': 'retrieve'})

progress_list = QuizProgressViewSet.as_view({'get': 'list'})
progress_detail = QuizProgressViewSet.as_view({'get': 'retrieve'})
progress_by_student = QuizProgressViewSet.as_view({'get': 'by_student'})
progress_by_quiz_student = QuizProgressViewSet.as_view({'get': 'by_quiz_student'})

urlpatterns = [
    path('', quiz_list, name='quiz-list'),
    path('<uuid:pk>/', quiz_detail, name='quiz-detail'),
    path('<uuid:pk>/attempts/', quiz_attempt, name='quiz-attempt'),
    path('questions/', question_list, name='question-list'),
    path('questions/<uuid:pk>/', question_detail, name='question-detail'),
    path('attempts/', attempt_list, name='attempt-list'),
    path('attempts/<uuid:pk>/', attempt_detail, name='attempt-detail'),
    path('answers/', answer_list, name='answer-list'),
    path('answers/<uuid:pk>/', answer_detail, name='answer-detail'),
    path('progress/', progress_list, name='progress-list'),
    path('progress/<uuid:pk>/', progress_detail, name='progress-detail'),
    path('progress/student/<uuid:student_id>/', progress_by_student, name='progress-by-student'),
    path('progress/quiz/<uuid:quiz_id>/<uuid:student_id>/', progress_by_quiz_student, name='progress-by-quiz-student'),
]
