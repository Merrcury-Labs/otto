import uuid

from django.db import models
from django.utils import timezone


class FlashcardDeck(models.Model):
    DRAFT = 'DRAFT'
    PUBLISHED = 'PUBLISHED'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (PUBLISHED, 'Published'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('courses.Course', related_name='flashcard_decks', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Flashcard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deck = models.ForeignKey(FlashcardDeck, related_name='cards', on_delete=models.CASCADE)
    front = models.TextField()
    back = models.TextField()
    position = models.PositiveIntegerField(default=0)
    hint = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['position', 'id']

    def __str__(self):
        return self.front[:80]


class FlashcardProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    card = models.ForeignKey(Flashcard, related_name='progress_records', on_delete=models.CASCADE)
    student = models.ForeignKey('users.User', related_name='flashcard_progress', on_delete=models.CASCADE)
    ease_factor = models.FloatField(default=2.5)
    interval = models.PositiveIntegerField(default=0)
    repetitions = models.PositiveIntegerField(default=0)
    next_review = models.DateTimeField(default=timezone.now)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    times_correct = models.PositiveIntegerField(default=0)
    times_incorrect = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('card', 'student')

    def __str__(self):
        return f"{self.student.name} - {self.card.front[:30]}: ease={self.ease_factor}"
