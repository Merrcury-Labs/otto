from datetime import datetime, timedelta

import strawberry
from django.db.models import Avg, Count, Q
from strawberry.scalars import JSON

from dashboard.models import Org
from courses.schema import CourseType
from users.schema import StudentType

from .models import Flashcard, FlashcardDeck, FlashcardProgress


# ── GraphQL Types ──────────────────────────────────────────────────────────


@strawberry.type
class FlashcardType:
    id: strawberry.ID
    front: str
    back: str
    position: int
    hint: str
    tags: JSON

    @strawberry.field
    def deck(self) -> "FlashcardDeckType":
        return self.deck


@strawberry.type
class FlashcardProgressType:
    id: strawberry.ID
    ease_factor: float
    interval: int
    repetitions: int
    next_review: datetime
    last_reviewed: datetime | None
    times_correct: int
    times_incorrect: int

    @strawberry.field
    def card(self) -> FlashcardType:
        return self.card

    @strawberry.field
    def student(self) -> StudentType:
        return self.student


@strawberry.type
class FlashcardDeckType:
    id: strawberry.ID
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime

    @strawberry.field
    def course(self) -> CourseType:
        return self.course

    @strawberry.field(name="courseId")
    def course_id_value(self) -> strawberry.ID:
        return self.course_id

    @strawberry.field(name="courseTitle")
    def course_title(self) -> str:
        return self.course.name

    @strawberry.field(name="cardCount")
    def card_count(self) -> int:
        return self.cards.count()

    @strawberry.field
    def cards(self) -> list[FlashcardType]:
        return list(self.cards.all())

    @strawberry.field(name="avgMastery")
    def avg_mastery(self) -> float:
        result = FlashcardProgress.objects.filter(
            card__deck=self
        ).aggregate(avg=Avg("ease_factor"))
        # Normalize ease_factor (1.3–3.0+) to 0–100 mastery scale
        raw = result["avg"]
        if raw is None:
            return 0.0
        mastery = max(0, min(100, ((raw - 1.3) / (3.0 - 1.3)) * 100))
        return round(mastery, 1)


@strawberry.type
class FlashcardDeckStatsType:
    total: int
    published: int
    total_reviews: int
    average_mastery: float


# ── Queries ────────────────────────────────────────────────────────────────


@strawberry.type
class FlashcardQuery:
    @strawberry.field
    def flashcard_decks(
        self,
        status: str | None = None,
        search: str | None = None,
        owner_user_id: str | None = None,
    ) -> list[FlashcardDeckType]:
        qs = FlashcardDeck.objects.select_related("course").prefetch_related(
            "cards", "cards__progress_records",
        )

        if owner_user_id:
            org = Org.objects.filter(owner_user_id=owner_user_id).first()
            if org:
                qs = qs.filter(course__tutor__org=org)
            else:
                return []

        if status is not None:
            qs = qs.filter(status=status)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        return list(qs.order_by("title"))

    @strawberry.field
    def flashcard_deck(self, id: strawberry.ID) -> FlashcardDeckType | None:
        return (
            FlashcardDeck.objects.select_related("course")
            .prefetch_related("cards", "cards__progress_records")
            .filter(pk=id)
            .first()
        )

    @strawberry.field
    def flashcard_progress(self, student_id: strawberry.ID) -> list[FlashcardProgressType]:
        return list(
            FlashcardProgress.objects.select_related("card", "student")
            .filter(student_id=student_id)
            .order_by("-last_reviewed")
        )

    @strawberry.field
    def deck_progress(
        self, deck_id: strawberry.ID, student_id: strawberry.ID
    ) -> list[FlashcardProgressType]:
        return list(
            FlashcardProgress.objects.select_related("card", "student")
            .filter(card__deck_id=deck_id, student_id=student_id)
        )

    @strawberry.field
    def due_cards(
        self, student_id: strawberry.ID, deck_id: strawberry.ID
    ) -> list[FlashcardType]:
        """Get cards due for review in a specific deck."""
        now = datetime.now()
        # Get cards that have progress with next_review <= now
        due_card_ids = FlashcardProgress.objects.filter(
            student_id=student_id,
            card__deck_id=deck_id,
            next_review__lte=now,
        ).values_list("card_id", flat=True)

        # Also include cards with no progress (never studied)
        studied_card_ids = FlashcardProgress.objects.filter(
            student_id=student_id,
            card__deck_id=deck_id,
        ).values_list("card_id", flat=True)

        unstudied_cards = Flashcard.objects.filter(
            deck_id=deck_id,
        ).exclude(id__in=studied_card_ids)

        due_cards = Flashcard.objects.filter(
            id__in=due_card_ids,
        ).select_related("deck")

        # Combine: unstudied first, then due
        return list(unstudied_cards) + list(due_cards)

    @strawberry.field
    def flashcard_deck_stats(self, owner_user_id: str | None = None) -> FlashcardDeckStatsType:
        qs = FlashcardDeck.objects.all()
        if owner_user_id:
            org = Org.objects.filter(owner_user_id=owner_user_id).first()
            if org:
                qs = qs.filter(course__tutor__org=org)
            else:
                return FlashcardDeckStatsType(
                    total=0, published=0, total_reviews=0, average_mastery=0.0
                )

        total = qs.count()
        published = qs.filter(status=FlashcardDeck.PUBLISHED).count()

        progress_qs = FlashcardProgress.objects.all()
        if owner_user_id:
            org = Org.objects.filter(owner_user_id=owner_user_id).first()
            if org:
                progress_qs = progress_qs.filter(card__deck__course__tutor__org=org)

        total_reviews = progress_qs.count()
        avg_result = progress_qs.aggregate(avg=Avg("ease_factor"))
        raw = avg_result["avg"]
        average_mastery = 0.0
        if raw is not None:
            average_mastery = round(max(0, min(100, ((raw - 1.3) / (3.0 - 1.3)) * 100)), 1)

        return FlashcardDeckStatsType(
            total=total,
            published=published,
            total_reviews=total_reviews,
            average_mastery=average_mastery,
        )


# ── SM-2 Algorithm ─────────────────────────────────────────────────────────


def _sm2_update(progress: FlashcardProgress, quality: int) -> FlashcardProgress:
    """Update progress using SM-2 spaced repetition algorithm.

    quality: 0-5 scale
      0 = complete blackout
      1 = wrong, but recognized upon seeing the answer
      2 = wrong, but the answer seemed easy to recall
      3 = correct with serious difficulty
      4 = correct with some hesitation
      5 = perfect response
    """
    if quality >= 3:
        # Correct response
        if progress.repetitions == 0:
            progress.interval = 1
        elif progress.repetitions == 1:
            progress.interval = 6
        else:
            progress.interval = round(progress.interval * progress.ease_factor)
        progress.repetitions += 1
        progress.times_correct += 1
    else:
        # Incorrect response — reset
        progress.repetitions = 0
        progress.interval = 1
        progress.times_incorrect += 1

    # Update ease factor
    progress.ease_factor = max(1.3, progress.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

    # Set next review date
    progress.next_review = datetime.now() + timedelta(days=progress.interval)
    progress.last_reviewed = datetime.now()
    progress.save()

    return progress


# ── Mutations ──────────────────────────────────────────────────────────────


@strawberry.type
class FlashcardMutation:
    @strawberry.mutation
    def create_flashcard_deck(
        self,
        course_id: strawberry.ID,
        title: str,
        description: str = "",
        status: str = FlashcardDeck.DRAFT,
    ) -> FlashcardDeckType:
        return FlashcardDeck.objects.create(
            course_id=course_id,
            title=title,
            description=description,
            status=status,
        )

    @strawberry.mutation
    def update_flashcard_deck(
        self,
        id: strawberry.ID,
        title: str | None = None,
        description: str | None = None,
        status: str | None = None,
    ) -> FlashcardDeckType:
        deck = FlashcardDeck.objects.get(pk=id)
        if title is not None:
            deck.title = title
        if description is not None:
            deck.description = description
        if status is not None:
            deck.status = status
        deck.save()
        return deck

    @strawberry.mutation
    def delete_flashcard_deck(self, id: strawberry.ID) -> bool:
        deleted, _ = FlashcardDeck.objects.filter(pk=id).delete()
        return deleted > 0

    @strawberry.mutation
    def create_flashcard(
        self,
        deck_id: strawberry.ID,
        front: str,
        back: str,
        position: int = 0,
        hint: str = "",
        tags: JSON | None = None,
    ) -> FlashcardType:
        return Flashcard.objects.create(
            deck_id=deck_id,
            front=front,
            back=back,
            position=position,
            hint=hint,
            tags=tags or [],
        )

    @strawberry.mutation
    def update_flashcard(
        self,
        id: strawberry.ID,
        front: str | None = None,
        back: str | None = None,
        position: int | None = None,
        hint: str | None = None,
        tags: JSON | None = None,
    ) -> FlashcardType:
        card = Flashcard.objects.get(pk=id)
        if front is not None:
            card.front = front
        if back is not None:
            card.back = back
        if position is not None:
            card.position = position
        if hint is not None:
            card.hint = hint
        if tags is not None:
            card.tags = tags
        card.save()
        return card

    @strawberry.mutation
    def delete_flashcard(self, id: strawberry.ID) -> bool:
        deleted, _ = Flashcard.objects.filter(pk=id).delete()
        return deleted > 0

    @strawberry.mutation
    def review_flashcard(
        self,
        card_id: strawberry.ID,
        student_id: strawberry.ID,
        quality: int,
    ) -> FlashcardProgressType:
        """Submit a review for a flashcard. Quality is 0-5 (SM-2 scale)."""
        progress, _ = FlashcardProgress.objects.get_or_create(
            card_id=card_id,
            student_id=student_id,
        )
        return _sm2_update(progress, quality)
