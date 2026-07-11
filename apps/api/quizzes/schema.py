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


def _resolve_mcq_correct_text(question: Question) -> str | None:
    """Resolve the correct option for an MCQ question to its display text.

    correct_option can be stored in multiple formats depending on how the quiz
    was created:
      - Integer index (e.g. 0)  — dashboard quiz creation
      - String index (e.g. "0") — some creation flows
      - Letter key (e.g. "B")   — {"choices": ["A) var", "B) let", ...]}
      - Option text (e.g. "Mean") — direct text match

    Returns the resolved text, or None if unresolvable.
    """
    correct = question.correct_option
    if correct is None:
        return None

    options = question.options or {}

    # If correct is already a text answer (non-numeric, non-single-letter),
    # and it's not a key in an object-style options dict, return as-is.
    if isinstance(correct, str) and not correct.isdigit() and len(correct) > 1:
        # Could be text like "Mean" or a key like "A" in {"A": "Option A"}
        if isinstance(options, dict):
            # Check if it's a key in the options dict
            if correct in options and not isinstance(options[correct], list):
                return str(options[correct])
            # Check choices array
            if "choices" in options and isinstance(options["choices"], list):
                # Not a letter key, so treat as direct text
                return correct
        # For array options, direct text match
        return correct

    # Resolve from options list using index
    choices: list | None = None
    if isinstance(options, list):
        choices = options
    elif isinstance(options, dict):
        if "choices" in options and isinstance(options["choices"], list):
            choices = options["choices"]
        elif correct in options and not isinstance(options[correct], list):
            # Object-style like {"A": "Option A", "B": "Option B"}
            return str(options[correct])

    if choices is not None:
        idx: int | None = None
        if isinstance(correct, int):
            idx = correct
        elif isinstance(correct, str) and correct.isdigit():
            idx = int(correct)
        elif isinstance(correct, str) and len(correct) == 1 and correct.isalpha():
            # Letter key like "A", "B", "C" -> index 0, 1, 2
            idx = ord(correct.upper()) - ord("A")

        if idx is not None and 0 <= idx < len(choices):
            return str(choices[idx])

    # Fallback: return as string
    return str(correct)


def _resolve_reorder_correct(question: Question) -> list | None:
    """Resolve REORDER correct_option to a list of option texts.

    correct_option may be stored as:
      - List of integer indices (e.g. [0, 1, 2])
      - List of option texts (e.g. ["Mean", "Median", "Mode"])
    """
    correct = question.correct_option
    if not isinstance(correct, list) or len(correct) == 0:
        return None

    # If the first element is a string that exists in options, it's already text
    options = question.options or {}
    choices: list | None = None
    if isinstance(options, list):
        choices = options
    elif isinstance(options, dict):
        if "items" in options and isinstance(options["items"], list):
            choices = options["items"]
        elif "choices" in options and isinstance(options["choices"], list):
            choices = options["choices"]

    if choices is None:
        return correct

    # Check if values are indices (int or numeric string)
    first = correct[0]
    if isinstance(first, int) or (isinstance(first, str) and first.isdigit()):
        resolved = []
        for idx in correct:
            i = int(idx)
            if 0 <= i < len(choices):
                resolved.append(str(choices[i]))
            else:
                return correct  # Can't resolve, return as-is
        return resolved

    # Already text values
    return correct


def _resolve_categorize_correct(question: Question) -> dict | None:
    """Normalize CATEGORIZE correct_option to a canonical item→category mapping.

    correct_option may be stored as:
      - Item→category mapping: {"Mean": "Center", "Range": "Spread"}
      - Category→items mapping: {"Number": ["42", "3.14"], "String": ["hello"]}
      - Integer-keyed mapping (e.g. {0: 0, 1: 0}) — rare, from dashboard creation

    Always returns an item→category mapping like {"Mean": "Center"}.
    """
    correct = question.correct_option
    if not isinstance(correct, dict) or len(correct) == 0:
        return None

    options = question.options or {}

    # Check if any value is a list — that means it's a category→items format
    first_val = next(iter(correct.values()))
    if isinstance(first_val, list):
        # Convert {"Number": ["42", "3.14"]} → {"42": "Number", "3.14": "Number"}
        item_to_category = {}
        for category, items in correct.items():
            if isinstance(items, list):
                for item in items:
                    item_to_category[str(item)] = str(category)
        return item_to_category

    # Check if keys/values look like indices
    first_key = next(iter(correct))
    keys_are_indices = isinstance(first_key, int) or (isinstance(first_key, str) and str(first_key).isdigit())
    vals_are_indices = isinstance(first_val, int) or (isinstance(first_val, str) and str(first_val).isdigit())

    if keys_are_indices:
        # Resolve item indices to text
        items: list = []
        category_names: list = []

        if isinstance(options, dict):
            if "items" in options and isinstance(options["items"], list):
                items = options["items"]
            elif "buckets" in options and isinstance(options["buckets"], dict):
                category_names = list(options["buckets"].keys())

            if not category_names:
                categories = question.categories or {}
                if isinstance(categories, dict):
                    category_names = list(categories.keys())

        if items:
            resolved = {}
            for k, v in correct.items():
                item_idx = int(k)
                item_text = str(items[item_idx]) if 0 <= item_idx < len(items) else str(k)
                if vals_are_indices and category_names:
                    cat_idx = int(v)
                    cat_text = category_names[cat_idx] if 0 <= cat_idx < len(category_names) else str(v)
                else:
                    cat_text = str(v)
                resolved[item_text] = cat_text
            return resolved

    # Already text-keyed item→category mapping
    return {str(k): str(v) for k, v in correct.items()}


def evaluate_answer(question: Question, response) -> tuple[bool, int]:
    """Evaluate a student's response. Returns (is_correct, points_awarded)."""
    if question.type == Question.MCQ:
        correct_text = _resolve_mcq_correct_text(question)
        # Compare as strings to handle type mismatches
        is_correct = str(response).strip() == str(correct_text).strip() if correct_text is not None else False
    elif question.type == Question.TF:
        correct = question.correct_option
        # correct may be 0/1 (integer), "true"/"false", or "0"/"1"
        # Normalize both sides to true/false strings
        def normalize_tf(val) -> str:
            s = str(val).lower().strip()
            if s in ("true", "1"):
                return "true"
            return "false"
        is_correct = normalize_tf(response) == normalize_tf(correct)
    elif question.type == Question.REORDER:
        correct_order = _resolve_reorder_correct(question)
        if correct_order is not None and isinstance(response, list):
            # Compare as string lists
            resp_strs = [str(r) for r in response]
            corr_strs = [str(c) for c in correct_order]
            is_correct = resp_strs == corr_strs
        else:
            is_correct = response == question.correct_option
    elif question.type == Question.CATEGORIZE:
        correct_mapping = _resolve_categorize_correct(question)
        if correct_mapping is not None and isinstance(response, dict):
            # Compare as string-keyed/string-valued dicts
            resp_norm = {str(k): str(v) for k, v in response.items()}
            is_correct = resp_norm == correct_mapping
        else:
            is_correct = response == question.correct_option
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
