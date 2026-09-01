from django.core.exceptions import ObjectDoesNotExist
from django.test import TestCase

from courses.models import Course
from dashboard.models import Org, Tutor
from users.models import User

from .models import FlashcardDeck
from .schema import FlashcardMutation, FlashcardQuery


class StudentFlashcardPrivacyTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        org = Org.objects.create(name="Test Org", owner_user_id="org-user")
        tutor = Tutor.objects.create(
            name="Tutor",
            email="tutor@example.com",
            org=org,
        )
        cls.course = Course.objects.create(
            name="Test Course",
            description="Course description",
            tutor=tutor,
            lesson_count=0,
            level="Beginner",
            category="Test",
        )
        cls.owner = User.objects.create(
            name="Owner",
            email="owner@example.com",
            userID="better-auth-owner",
        )
        cls.other_student = User.objects.create(
            name="Other",
            email="other@example.com",
            userID="better-auth-other",
        )
        cls.public_deck = FlashcardDeck.objects.create(
            course=cls.course,
            title="Public deck",
            status=FlashcardDeck.PUBLISHED,
        )
        cls.private_deck = FlashcardDeck.objects.create(
            course=cls.course,
            owner=cls.owner,
            title="Private deck",
            status=FlashcardDeck.PUBLISHED,
        )

    def test_student_sees_public_and_own_decks(self):
        decks = FlashcardQuery().flashcard_decks(
            status=FlashcardDeck.PUBLISHED,
            viewer_user_id=self.owner.userID,
        )

        self.assertEqual(
            {deck.id for deck in decks},
            {self.public_deck.id, self.private_deck.id},
        )

    def test_student_cannot_read_another_students_private_deck(self):
        deck = FlashcardQuery().flashcard_deck(
            id=self.private_deck.id,
            viewer_user_id=self.other_student.userID,
        )

        self.assertIsNone(deck)

    def test_student_cannot_update_another_students_private_deck(self):
        with self.assertRaises(ObjectDoesNotExist):
            FlashcardMutation().update_flashcard_deck(
                id=self.private_deck.id,
                title="Changed",
                viewer_user_id=self.other_student.userID,
            )

        self.private_deck.refresh_from_db()
        self.assertEqual(self.private_deck.title, "Private deck")
