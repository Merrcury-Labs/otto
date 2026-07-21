from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from courses.models import Course, Lesson, Module
from flashcards.models import Flashcard, FlashcardDeck
from quizzes.models import Question, Quiz

from .models import GeneratedArtifact, GenerationJob
from .packages import GeneratedCoursePackage


@transaction.atomic
def persist_approved_course(job_id, artifact_id):
    """Create the complete course once; any error rolls the hierarchy back."""
    job = GenerationJob.objects.select_for_update().select_related('tutor').get(pk=job_id)
    if job.result_course_id:
        return job.result_course

    artifact = GeneratedArtifact.objects.select_for_update().get(
        pk=artifact_id,
        job=job,
        type=GeneratedArtifact.Type.COURSE_PACKAGE,
    )
    if artifact.status != GeneratedArtifact.Status.APPROVED:
        raise ValueError('Only an approved course package can be persisted.')

    package = GeneratedCoursePackage.model_validate(artifact.content)
    lesson_count = sum(len(module.lessons) for module in package.modules)
    course = Course.objects.create(
        name=package.title,
        description=package.description,
        tutor=job.tutor,
        lesson_count=lesson_count,
        level=package.level,
        category=package.category,
        prerequisites='\n'.join(package.prerequisites),
    )

    for module_position, module_data in enumerate(package.modules):
        module = Module.objects.create(
            course=course,
            title=module_data.title,
            description=module_data.description,
            order=module_position,
        )
        for lesson_position, lesson_data in enumerate(module_data.lessons):
            citation_note = ''
            if lesson_data.source_chunk_ids:
                citation_note = '\nSource chunks: ' + ', '.join(lesson_data.source_chunk_ids)
            Lesson.objects.create(
                course=course,
                module=module,
                title=lesson_data.title,
                content=lesson_data.content,
                length=timedelta(minutes=lesson_data.estimated_minutes),
                position=lesson_position,
                notes=lesson_data.notes + citation_note,
                section_name=module_data.title,
            )

    quiz_ids = []
    for quiz_data in package.quizzes:
        quiz = Quiz.objects.create(
            course=course,
            title=quiz_data.title,
            description=quiz_data.description,
            length=timedelta(minutes=max(5, len(quiz_data.questions))),
            num_questions=len(quiz_data.questions),
            author=job.tutor.name,
            passing_score=quiz_data.passing_score,
            status=Quiz.DRAFT,
        )
        quiz_ids.append(str(quiz.id))
        Question.objects.bulk_create(
            [
                Question(
                    quiz=quiz,
                    text=question.text,
                    correct_option=question.correct_option,
                    type=question.type,
                    options=question.options,
                    points=question.points,
                    hint=question.hint,
                    categories=question.categories,
                )
                for question in quiz_data.questions
            ]
        )

    deck_ids = []
    for deck_data in package.flashcard_decks:
        deck = FlashcardDeck.objects.create(
            course=course,
            title=deck_data.title,
            description=deck_data.description,
            status=FlashcardDeck.DRAFT,
        )
        deck_ids.append(str(deck.id))
        Flashcard.objects.bulk_create(
            [
                Flashcard(
                    deck=deck,
                    front=card.front,
                    back=card.back,
                    position=position,
                    hint=card.hint,
                    tags=card.tags,
                )
                for position, card in enumerate(deck_data.cards)
            ]
        )

    job.result_course = course
    job.status = GenerationJob.Status.COMPLETED
    job.current_stage = 'completed'
    job.progress_percent = 100
    job.status_message = 'Approved course package saved as draft content.'
    job.completed_at = timezone.now()
    job.heartbeat_at = timezone.now()
    job.save()
    job.add_event(
        'COURSE_PERSISTED',
        job.status_message,
        {
            'course_id': str(course.id),
            'quiz_ids': quiz_ids,
            'flashcard_deck_ids': deck_ids,
        },
    )
    return course
