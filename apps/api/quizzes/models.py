import uuid

from django.db import models
from django.utils import timezone


class Quiz(models.Model):
    DRAFT = 'DRAFT'
    PUBLISHED = 'PUBLISHED'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (PUBLISHED, 'Published'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('courses.Course', related_name='quizzes', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    length = models.DurationField()
    num_questions = models.IntegerField()
    author = models.CharField(max_length=100)
    passing_score = models.FloatField(default=50.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    MCQ = 'MCQ'
    TF = 'TF'
    REORDER = 'REORDER'
    CATEGORIZE = 'CATEGORIZE'

    QUESTION_TYPE_CHOICES = [
        (MCQ, 'Multiple Choice'),
        (TF, 'True/False'),
        (REORDER, 'Drag & Drop Reorder'),
        (CATEGORIZE, 'Drag & Drop Categorize'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    correct_option = models.JSONField()
    type = models.CharField(max_length=50, choices=QUESTION_TYPE_CHOICES)
    options = models.JSONField(default=dict, blank=True)
    points = models.PositiveIntegerField(default=1)
    hint = models.TextField(blank=True)
    categories = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.text


class Attempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, related_name='attempts', on_delete=models.CASCADE)
    student = models.ForeignKey('users.User', related_name='quiz_attempts', on_delete=models.CASCADE)
    score = models.FloatField()
    attempt_date = models.DateTimeField(auto_now_add=True)
    max_points = models.PositiveIntegerField(default=0)
    earned_points = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.name} attempted {self.quiz.title}"


class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(Attempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    response = models.JSONField()
    is_correct = models.BooleanField(default=False)
    points = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Answer to {self.question.text[:50]}"


class QuizProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, related_name='progress_records', on_delete=models.CASCADE)
    student = models.ForeignKey('users.User', related_name='quiz_progress', on_delete=models.CASCADE)
    best_score = models.FloatField(default=0.0)
    attempts_count = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    completed_date = models.DateTimeField(null=True, blank=True)
    last_attempted = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('quiz', 'student')

    def __str__(self):
        return f"{self.student.name} - {self.quiz.title}: {self.best_score}%"
