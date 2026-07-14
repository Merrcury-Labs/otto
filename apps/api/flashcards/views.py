from datetime import datetime, timedelta

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Flashcard, FlashcardDeck, FlashcardProgress
from .serializers import (
    FlashcardDeckSerializer,
    FlashcardProgressSerializer,
    FlashcardSerializer,
    ReviewFlashcardSerializer,
)


def _sm2_update(progress: FlashcardProgress, quality: int) -> FlashcardProgress:
    """Update progress using SM-2 spaced repetition algorithm."""
    if quality >= 3:
        if progress.repetitions == 0:
            progress.interval = 1
        elif progress.repetitions == 1:
            progress.interval = 6
        else:
            progress.interval = round(progress.interval * progress.ease_factor)
        progress.repetitions += 1
        progress.times_correct += 1
    else:
        progress.repetitions = 0
        progress.interval = 1
        progress.times_incorrect += 1

    progress.ease_factor = max(1.3, progress.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    progress.next_review = datetime.now() + timedelta(days=progress.interval)
    progress.last_reviewed = datetime.now()
    progress.save()

    return progress


class FlashcardDeckViewSet(viewsets.ModelViewSet):
    queryset = (
        FlashcardDeck.objects.select_related('course')
        .prefetch_related('cards')
        .order_by('title')
    )
    serializer_class = FlashcardDeckSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.select_related('deck').order_by('deck__title', 'position', 'id')
    serializer_class = FlashcardSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class FlashcardProgressViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FlashcardProgress.objects.select_related('card', 'student').order_by('student__name', 'card__front')
    serializer_class = FlashcardProgressSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def by_student(self, request, student_id=None):
        progress = FlashcardProgress.objects.filter(
            student_id=student_id,
        ).select_related('card', 'student')
        serializer = FlashcardProgressSerializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='deck/(?P<deck_id>[^/.]+)/(?P<student_id>[^/.]+)')
    def by_deck_student(self, request, deck_id=None, student_id=None):
        progress = FlashcardProgress.objects.filter(
            card__deck_id=deck_id,
            student_id=student_id,
        ).select_related('card', 'student')
        serializer = FlashcardProgressSerializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None):
        """Submit a review for a flashcard progress record. Body: {"quality": 0-5}."""
        progress = self.get_object()
        serializer = ReviewFlashcardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quality = serializer.validated_data['quality']
        progress = _sm2_update(progress, quality)

        return Response(FlashcardProgressSerializer(progress).data)
