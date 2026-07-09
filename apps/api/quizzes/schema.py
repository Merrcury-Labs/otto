from datetime import datetime, timedelta
from enum import Enum

import strawberry
from django.db.models import Avg, Count, Q
from django.utils.dateparse import parse_duration
from strawberry.scalars import JSON

from courses.schema import CourseType
from users.schema import StudentType

from .models import Answer, Attempt, Question, Quiz, QuizProgress


def duration_from_string(value: str) -> timedelta:
    duration = parse_duration(value)
    if duration is None:
        raise ValueError("Duration must be a valid value like 'HH:MM:SS'.")
    return duration


def evaluate_answer(question: Question, response) -> tuple[bool, int]:
    """Evaluate a student's response. Returns (is_correct, points_awarded)."""
    correct = question.correct_option

    if question.type == Question.MCQ:
        is_correct = response == correct
    elif question.type == Question.TF:
        is_correct = str(response).lower() == str(correct).lower()
    elif question.type == Question.REORDER:
        is_correct = response == correct
    elif question.type == Question.CATEGORIZE:
        is_correct = response == correct
    else:
        is_correct = False

    return is_correct, question.points if is_correct else 0


# ── Enums ──────────────────────────────────────────────────────────────────


@strawberry.enum
class ContentStatus(Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"


# ── GraphQL Types ──────────────────────────────────────────────────────────


@strawberry.type
class AnswerType:
    id: strawberry.ID
    response: JSON
    is_correct: bool
    points: int

    @strawberry.field
    def question(self) -> "QuestionType":
        return self.question

    @strawberry.field
    def attempt(self) -> "AttemptType":
        return self.attempt


@strawberry.type
class QuizProgressType:
    id: strawberry.ID
    best_score: float
    attempts_count: int
    completed: bool
    completed_date: datetime | None
    last_attempted: datetime | None

    @strawberry.field
    def quiz(self) -> "QuizType":
        return self.quiz

    @strawberry.field
    def student(self) -> StudentType:
        return self.student


@strawberry.type
class QuestionType:
    id: strawberry.ID
    type: str
    points: int
    options: JSON

    @strawberry.field(name="question")
    def question_text(self) -> str:
        return self.text

    @strawberry.field(name="correctAnswer")
    def correct_answer(self) -> JSON:
        return self.correct_option

    @strawberry.field
    def categories(self) -> JSON:
        return self.categories

    @strawberry.field
    def hint(self) -> str:
        return self.hint

    @strawberry.field
    def quiz(self) -> "QuizType":
        return self.quiz

    @strawberry.field
    def answers(self) -> list[AnswerType]:
        return list(self.answers.select_related("attempt", "question").all())


@strawberry.type
class AttemptType:
    id: strawberry.ID
    score: float
    attempt_date: datetime
    max_points: int
    earned_points: int
    passed: bool

    @strawberry.field
    def quiz(self) -> "QuizType":
        return self.quiz

    @strawberry.field
    def student(self) -> StudentType:
        return self.student

    @strawberry.field
    def answers(self) -> list[AnswerType]:
        return list(self.answers.select_related("question").all())


@strawberry.type
class QuizType:
    id: strawberry.ID
    title: str
    description: str
    num_questions: int
    author: str
    passing_score: float
    status: str
    created_at: datetime
    updated_at: datetime

    @strawberry.field
    def course(self) -> CourseType:
        return self.course

    @strawberry.field(name="duration")
    def duration_value(self) -> str:
        length = self.length
        if isinstance(length, timedelta):
            return str(length)
        return length

    @strawberry.field(name="courseId")
    def course_id_value(self) -> strawberry.ID:
        return self.course_id

    @strawberry.field(name="courseTitle")
    def course_title(self) -> str:
        return self.course.name

    @strawberry.field(name="attempts")
    def attempts_count(self) -> int:
        return self.attempts.count()

    @strawberry.field(name="avgScore")
    def avg_score(self) -> float:
        result = self.attempts.aggregate(avg=Avg("score"))
        return round(result["avg"], 2) if result["avg"] is not None else 0.0

    @strawberry.field
    def questions(self) -> list[QuestionType]:
        return list(self.questions.all())

    @strawberry.field
    def attempt_list(self) -> list[AttemptType]:
        return list(self.attempts.select_related("student").prefetch_related("answers").all())

    @strawberry.field
    def progress_records(self) -> list[QuizProgressType]:
        return list(self.progress_records.select_related("student").all())


@strawberry.type
class QuizStatsType:
    total: int
    published: int
    attempts: int
    average_score: float


# ── Queries ────────────────────────────────────────────────────────────────


@strawberry.type
class QuizQuery:
    @strawberry.field
    def quizzes(
        self,
        status: ContentStatus | None = None,
        search: str | None = None,
    ) -> list[QuizType]:
        qs = Quiz.objects.select_related("course").prefetch_related(
            "questions", "attempts__student", "progress_records__student",
        ).order_by("title")

        if status is not None:
            qs = qs.filter(status=status.value)
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(author__icontains=search)
            )
        return list(qs)

    @strawberry.field
    def quiz(self, id: strawberry.ID) -> QuizType | None:
        return (
            Quiz.objects.select_related("course")
            .prefetch_related("questions", "attempts__student", "attempts__answers", "progress_records__student")
            .filter(pk=id)
            .first()
        )

    @strawberry.field
    def quiz_stats(self) -> QuizStatsType:
        total = Quiz.objects.count()
        published = Quiz.objects.filter(status=Quiz.PUBLISHED).count()
        attempt_count = Attempt.objects.count()
        avg_result = Attempt.objects.aggregate(avg=Avg("score"))
        average_score = round(avg_result["avg"], 2) if avg_result["avg"] is not None else 0.0
        return QuizStatsType(
            total=total,
            published=published,
            attempts=attempt_count,
            average_score=average_score,
        )

    @strawberry.field
    def questions(self) -> list[QuestionType]:
        return list(Question.objects.select_related("quiz").order_by("quiz__title", "id"))

    @strawberry.field
    def attempts(self) -> list[AttemptType]:
        return list(
            Attempt.objects.select_related("quiz", "student").prefetch_related("answers").order_by("-attempt_date")
        )

    @strawberry.field
    def student_attempts(self, student_id: strawberry.ID) -> list[AttemptType]:
        return list(
            Attempt.objects.select_related("quiz", "student")
            .prefetch_related("answers")
            .filter(student_id=student_id)
            .order_by("-attempt_date")
        )

    @strawberry.field
    def answers(self, attempt_id: strawberry.ID) -> list[AnswerType]:
        return list(
            Answer.objects.select_related("attempt", "question")
            .filter(attempt_id=attempt_id)
        )

    @strawberry.field
    def quiz_progress(self, quiz_id: strawberry.ID, student_id: strawberry.ID) -> QuizProgressType | None:
        return (
            QuizProgress.objects.select_related("quiz", "student")
            .filter(quiz_id=quiz_id, student_id=student_id)
            .first()
        )

    @strawberry.field
    def student_quiz_progress(self, student_id: strawberry.ID) -> list[QuizProgressType]:
        return list(
            QuizProgress.objects.select_related("quiz", "student")
            .filter(student_id=student_id)
            .order_by("-last_attempted")
        )


# ── Mutations ──────────────────────────────────────────────────────────────


@strawberry.type
class QuizMutation:
    @strawberry.mutation
    def create_quiz(
        self,
        course_id: strawberry.ID,
        title: str,
        length: str,
        num_questions: int,
        author: str,
        description: str = "",
        passing_score: float = 50.0,
        status: str = Quiz.DRAFT,
    ) -> QuizType:
        return Quiz.objects.create(
            course_id=course_id,
            title=title,
            description=description,
            length=duration_from_string(length),
            num_questions=num_questions,
            author=author,
            passing_score=passing_score,
            status=status,
        )

    @strawberry.mutation
    def update_quiz(
        self,
        id: strawberry.ID,
        course_id: strawberry.ID | None = None,
        title: str | None = None,
        description: str | None = None,
        length: str | None = None,
        num_questions: int | None = None,
        author: str | None = None,
        passing_score: float | None = None,
        status: str | None = None,
    ) -> QuizType:
        quiz = Quiz.objects.get(pk=id)
        if course_id is not None:
            quiz.course_id = course_id
        if title is not None:
            quiz.title = title
        if description is not None:
            quiz.description = description
        if length is not None:
            quiz.length = duration_from_string(length)
        if num_questions is not None:
            quiz.num_questions = num_questions
        if author is not None:
            quiz.author = author
        if passing_score is not None:
            quiz.passing_score = passing_score
        if status is not None:
            quiz.status = status
        quiz.save()
        return quiz

    @strawberry.mutation
    def delete_quiz(self, id: strawberry.ID) -> bool:
        deleted, _ = Quiz.objects.filter(pk=id).delete()
        return deleted > 0

    @strawberry.mutation
    def create_question(
        self,
        quiz_id: strawberry.ID,
        text: str,
        correct_option: JSON,
        type: str,
        options: JSON | None = None,
        points: int = 1,
        hint: str = "",
        categories: JSON | None = None,
    ) -> QuestionType:
        question = Question.objects.create(
            quiz_id=quiz_id,
            text=text,
            correct_option=correct_option,
            type=type,
            options=options or {},
            points=points,
            hint=hint,
            categories=categories or {},
        )
        Quiz.objects.filter(pk=quiz_id).update(
            num_questions=Question.objects.filter(quiz_id=quiz_id).count()
        )
        return question

    @strawberry.mutation
    def update_question(
        self,
        id: strawberry.ID,
        quiz_id: strawberry.ID | None = None,
        text: str | None = None,
        correct_option: JSON | None = None,
        type: str | None = None,
        options: JSON | None = None,
        points: int | None = None,
        hint: str | None = None,
        categories: JSON | None = None,
    ) -> QuestionType:
        question = Question.objects.get(pk=id)
        original_quiz_id = question.quiz_id
        if quiz_id is not None:
            question.quiz_id = quiz_id
        if text is not None:
            question.text = text
        if correct_option is not None:
            question.correct_option = correct_option
        if type is not None:
            question.type = type
        if options is not None:
            question.options = options
        if points is not None:
            question.points = points
        if hint is not None:
            question.hint = hint
        if categories is not None:
            question.categories = categories
        question.save()

        quiz_ids = {original_quiz_id, question.quiz_id}
        for related_quiz_id in quiz_ids:
            Quiz.objects.filter(pk=related_quiz_id).update(
                num_questions=Question.objects.filter(quiz_id=related_quiz_id).count()
            )
        return question

    @strawberry.mutation
    def delete_question(self, id: strawberry.ID) -> bool:
        question = Question.objects.filter(pk=id).first()
        if question is None:
            return False
        quiz_id = question.quiz_id
        question.delete()
        Quiz.objects.filter(pk=quiz_id).update(
            num_questions=Question.objects.filter(quiz_id=quiz_id).count()
        )
        return True

    @strawberry.mutation
    def submit_quiz_attempt(
        self,
        student_id: strawberry.ID,
        quiz_id: strawberry.ID,
        answers: JSON,
    ) -> AttemptType:
        """Submit a quiz attempt with per-question answers.

        `answers` should be a list of {"question_id": "...", "response": <value>}.
        The server evaluates each answer, computes the score, and updates QuizProgress.
        """
        quiz = Quiz.objects.get(pk=quiz_id)
        quiz_questions = {str(q.id): q for q in quiz.questions.all()}

        max_points = sum(q.points for q in quiz_questions.values())
        earned_points = 0
        answer_objects = []

        for answer_data in answers:
            question_id = str(answer_data.get("question_id", ""))
            response = answer_data.get("response")

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

        score = (earned_points / max_points * 100) if max_points > 0 else 0.0
        passed = score >= quiz.passing_score

        attempt = Attempt.objects.create(
            quiz=quiz,
            student_id=student_id,
            score=round(score, 2),
            max_points=max_points,
            earned_points=earned_points,
            passed=passed,
        )

        for answer_obj in answer_objects:
            answer_obj.attempt = attempt
        Answer.objects.bulk_create(answer_objects)

        # Update quiz progress
        progress, _ = QuizProgress.objects.get_or_create(quiz=quiz, student_id=student_id)
        progress.attempts_count += 1
        progress.last_attempted = datetime.now()
        if score > progress.best_score:
            progress.best_score = round(score, 2)
        if passed and not progress.completed:
            progress.completed = True
            progress.completed_date = datetime.now()
        progress.save()

        return attempt
