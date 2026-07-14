from rest_framework import serializers

from courses.serializers import CourseSerializer
from users.serializers import UserSerializer

from .models import Flashcard, FlashcardDeck, FlashcardProgress


class FlashcardSerializer(serializers.ModelSerializer):
    deck_title = serializers.CharField(source='deck.title', read_only=True)

    class Meta:
        model = Flashcard
        fields = ('id', 'deck', 'deck_title', 'front', 'back', 'position', 'hint', 'tags')
        read_only_fields = ('id', 'deck_title')


class FlashcardProgressSerializer(serializers.ModelSerializer):
    card_front = serializers.CharField(source='card.front', read_only=True)
    card_back = serializers.CharField(source='card.back', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)

    class Meta:
        model = FlashcardProgress
        fields = (
            'id',
            'card',
            'card_front',
            'card_back',
            'student',
            'student_detail',
            'ease_factor',
            'interval',
            'repetitions',
            'next_review',
            'last_reviewed',
            'times_correct',
            'times_incorrect',
        )
        read_only_fields = (
            'id',
            'card_front',
            'card_back',
            'student_detail',
            'ease_factor',
            'interval',
            'repetitions',
            'next_review',
            'last_reviewed',
            'times_correct',
            'times_incorrect',
        )


class FlashcardDeckSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)
    cards = FlashcardSerializer(many=True, read_only=True)
    card_count = serializers.SerializerMethodField()

    class Meta:
        model = FlashcardDeck
        fields = (
            'id',
            'course',
            'course_detail',
            'title',
            'description',
            'status',
            'created_at',
            'updated_at',
            'cards',
            'card_count',
        )
        read_only_fields = ('id', 'course_detail', 'card_count')

    def get_card_count(self, obj) -> int:
        return obj.cards.count()


class ReviewFlashcardSerializer(serializers.Serializer):
    quality = serializers.IntegerField(min_value=0, max_value=5)
