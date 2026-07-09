from datetime import datetime, timedelta

import strawberry
from django.utils.dateparse import parse_duration

from dashboard.models import Tutor
from dashboard.schema import TutorType
from users.schema import StudentType

from .models import Course, Enrollment, Lesson, Module


def duration_from_string(value: str) -> timedelta:
    duration = parse_duration(value)
    if duration is None:
        raise ValueError("Duration must be a valid value like 'HH:MM:SS'.")
    return duration


@strawberry.type
class LessonType:
    id: strawberry.ID
    title: str
    content: str
    video_url: str | None
    section_name: str

    @strawberry.field
    def course(self) -> "CourseType":
        return self.course

    @strawberry.field
    def module(self) -> "ModuleType | None":
        return self.module

    @strawberry.field(name="length")
    def length_value(self) -> str:
        length = self.length
        if isinstance(length, timedelta):
            return str(length)
        return length


@strawberry.type
class ModuleType:
    id: strawberry.ID
    title: str
    description: str
    order: int

    @strawberry.field
    def course(self) -> "CourseType":
        return self.course

    @strawberry.field
    def lessons(self) -> list[LessonType]:
        return list(self.lessons.select_related("course", "module").all())


@strawberry.type
class EnrollmentType:
    id: strawberry.ID
    enrollment_date: datetime
    progress: float
    completed: bool
    completed_date: datetime | None

    @strawberry.field
    def course_id(self) -> strawberry.ID:
        return self.course_id

    @strawberry.field
    def course(self) -> "CourseType":
        return self.course

    @strawberry.field
    def student_id(self) -> strawberry.ID:
        return self.student_id

    @strawberry.field
    def student(self) -> StudentType:
        return self.student


@strawberry.type
class CourseType:
    id: strawberry.ID
    name: str
    description: str
    thumbnail: str
    image: str
    lesson_count: int
    level: str
    category: str
    prerequisites: str
    enrolled_students: int

    @strawberry.field
    def is_enrolled(self, student_id: strawberry.ID) -> bool:
        return Enrollment.objects.filter(course=self, student_id=student_id).exists()

    @strawberry.field
    def enrollment(self, student_id: strawberry.ID) -> EnrollmentType | None:
        return Enrollment.objects.filter(course=self, student_id=student_id).select_related("course", "student").first()

    @strawberry.field
    def tutor(self) -> TutorType | None:
        return self.tutor

    @strawberry.field
    def modules(self) -> list[ModuleType]:
        return list(self.modules.prefetch_related("lessons").all())

    @strawberry.field
    def lessons(self) -> list[LessonType]:
        return list(self.lessons.select_related("module").all())

    @strawberry.field
    def enrollments(self) -> list[EnrollmentType]:
        return list(self.enrollments.select_related("student").all())


@strawberry.type
class CourseQuery:
    @strawberry.field
    def courses(self) -> list[CourseType]:
        return list(
            Course.objects.select_related("tutor").prefetch_related(
                "modules__lessons",
                "lessons",
                "enrollments__student",
            ).order_by("name")
        )

    @strawberry.field
    def course(self, id: strawberry.ID) -> CourseType | None:
        return (
            Course.objects.select_related("tutor")
            .prefetch_related("modules__lessons", "lessons", "enrollments__student")
            .filter(pk=id)
            .first()
        )

    @strawberry.field
    def modules(self) -> list[ModuleType]:
        return list(
            Module.objects.select_related("course")
            .prefetch_related("lessons")
            .order_by("course__name", "order", "title")
        )

    @strawberry.field
    def lessons(self) -> list[LessonType]:
        return list(
            Lesson.objects.select_related("course", "module").order_by(
                "course__name",
                "module__order",
                "title",
            )
        )

    @strawberry.field
    def enrollments(self) -> list[EnrollmentType]:
        return list(
            Enrollment.objects.select_related("course", "student").order_by("-enrollment_date")
        )

    @strawberry.field
    def student_enrollments(self, student_id: strawberry.ID) -> list[EnrollmentType]:
        return list(
            Enrollment.objects.select_related("course", "student")
            .filter(student_id=student_id)
            .order_by("-enrollment_date")
        )


@strawberry.type
class CourseMutation:
    @strawberry.mutation
    def create_course(
        self,
        name: str,
        description: str,
        tutor_id: strawberry.ID,
        lesson_count: int,
        level: str,
        category: str,
        thumbnail: str = "",
        image: str = "",
        prerequisites: str = "",
    ) -> CourseType:
        tutor = Tutor.objects.get(pk=tutor_id)
        return Course.objects.create(
            name=name,
            description=description,
            tutor=tutor,
            thumbnail=thumbnail,
            image=image,
            lesson_count=lesson_count,
            level=level,
            category=category,
            prerequisites=prerequisites,
        )

    @strawberry.mutation
    def update_course(
        self,
        id: strawberry.ID,
        name: str | None = None,
        description: str | None = None,
        tutor_id: strawberry.ID | None = None,
        thumbnail: str | None = None,
        image: str | None = None,
        lesson_count: int | None = None,
        level: str | None = None,
        category: str | None = None,
        prerequisites: str | None = None,
    ) -> CourseType:
        course = Course.objects.get(pk=id)
        if name is not None:
            course.name = name
        if description is not None:
            course.description = description
        if tutor_id is not None:
            tutor = Tutor.objects.get(pk=tutor_id)
            course.tutor = tutor
        if thumbnail is not None:
            course.thumbnail = thumbnail
        if image is not None:
            course.image = image
        if lesson_count is not None:
            course.lesson_count = lesson_count
        if level is not None:
            course.level = level
        if category is not None:
            course.category = category
        if prerequisites is not None:
            course.prerequisites = prerequisites
        course.save()
        return course

    @strawberry.mutation
    def delete_course(self, id: strawberry.ID) -> bool:
        deleted, _ = Course.objects.filter(pk=id).delete()
        return deleted > 0

    @strawberry.mutation
    def create_module(
        self,
        course_id: strawberry.ID,
        title: str,
        description: str = "",
        order: int = 0,
    ) -> ModuleType:
        return Module.objects.create(
            course_id=course_id,
            title=title,
            description=description,
            order=order,
        )

    @strawberry.mutation
    def update_module(
        self,
        id: strawberry.ID,
        course_id: strawberry.ID | None = None,
        title: str | None = None,
        description: str | None = None,
        order: int | None = None,
    ) -> ModuleType:
        module = Module.objects.get(pk=id)
        if course_id is not None:
            module.course_id = course_id
        if title is not None:
            module.title = title
        if description is not None:
            module.description = description
        if order is not None:
            module.order = order
        module.save()

        if course_id is not None:
            module.lessons.update(course_id=course_id)
        return module

    @strawberry.mutation
    def delete_module(self, id: strawberry.ID) -> bool:
        deleted, _ = Module.objects.filter(pk=id).delete()
        return deleted > 0

    @strawberry.mutation
    def create_lesson(
        self,
        title: str,
        content: str,
        length: str,
        section_name: str | None = None,
        course_id: strawberry.ID | None = None,
        module_id: strawberry.ID | None = None,
        video_url: str | None = None,
    ) -> LessonType:
        if module_id is not None:
            module = Module.objects.get(pk=module_id)
            if course_id is None:
                course_id = module.course_id
            if str(module.course_id) != str(course_id):
                raise ValueError("Module must belong to the selected course.")
        else:
            module = None
        if course_id is None:
            raise ValueError("Either course_id or module_id is required.")
        if section_name is None:
            if module is None:
                raise ValueError("section_name is required when no module_id is provided.")
            section_name = module.title

        lesson = Lesson.objects.create(
            course_id=course_id,
            module=module,
            title=title,
            content=content,
            video_url=video_url,
            length=duration_from_string(length),
            section_name=section_name,
        )
        Course.objects.filter(pk=course_id).update(
            lesson_count=Lesson.objects.filter(course_id=course_id).count()
        )
        return lesson

    @strawberry.mutation
    def update_lesson(
        self,
        id: strawberry.ID,
        course_id: strawberry.ID | None = None,
        module_id: strawberry.ID | None = None,
        title: str | None = None,
        content: str | None = None,
        video_url: str | None = None,
        length: str | None = None,
        section_name: str | None = None,
    ) -> LessonType:
        lesson = Lesson.objects.get(pk=id)
        original_course_id = lesson.course_id
        if course_id is not None:
            lesson.course_id = course_id
        if module_id is not None:
            module = Module.objects.get(pk=module_id)
            if str(module.course_id) != str(lesson.course_id):
                raise ValueError("Module must belong to the selected course.")
            lesson.module = module
        if title is not None:
            lesson.title = title
        if content is not None:
            lesson.content = content
        if video_url is not None:
            lesson.video_url = video_url
        if length is not None:
            lesson.length = duration_from_string(length)
        if section_name is not None:
            lesson.section_name = section_name
        lesson.save()

        course_ids = {original_course_id, lesson.course_id}
        for related_course_id in course_ids:
            Course.objects.filter(pk=related_course_id).update(
                lesson_count=Lesson.objects.filter(course_id=related_course_id).count()
            )
        return lesson

    @strawberry.mutation
    def delete_lesson(self, id: strawberry.ID) -> bool:
        lesson = Lesson.objects.filter(pk=id).first()
        if lesson is None:
            return False
        course_id = lesson.course_id
        lesson.delete()
        Course.objects.filter(pk=course_id).update(
            lesson_count=Lesson.objects.filter(course_id=course_id).count()
        )
        return True

    @strawberry.mutation
    def enroll_student(self, student_id: strawberry.ID, course_id: strawberry.ID) -> EnrollmentType:
        course = Course.objects.get(pk=course_id)
        enrollment, created = Enrollment.objects.get_or_create(
            student_id=student_id,
            course=course,
        )
        if created:
            course.enrolled_students = Enrollment.objects.filter(course=course).count()
            course.save(update_fields=["enrolled_students"])
        return enrollment

    @strawberry.mutation
    def unenroll_student(self, student_id: strawberry.ID, course_id: strawberry.ID) -> bool:
        deleted, _ = Enrollment.objects.filter(
            student_id=student_id,
            course_id=course_id,
        ).delete()
        if deleted:
            Course.objects.filter(pk=course_id).update(
                enrolled_students=Enrollment.objects.filter(course_id=course_id).count()
            )
        return bool(deleted)

    @strawberry.mutation
    def update_enrollment_progress(
        self, enrollment_id: strawberry.ID, progress: float
    ) -> EnrollmentType:
        enrollment = Enrollment.objects.get(pk=enrollment_id)
        enrollment.progress = progress
        if progress >= 100.0:
            enrollment.completed = True
            enrollment.completed_date = datetime.now()
        else:
            enrollment.completed = False
            enrollment.completed_date = None
        enrollment.save(update_fields=["progress", "completed", "completed_date"])
        return enrollment
