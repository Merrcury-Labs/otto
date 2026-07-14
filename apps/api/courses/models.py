import uuid

from django.db import models

class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    tutor = models.ForeignKey('dashboard.Tutor', related_name='courses', on_delete=models.SET_NULL, null=True)
    thumbnail = models.TextField(blank=True)
    image = models.TextField(blank=True)
    lesson_count = models.IntegerField()
    level = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    prerequisites = models.TextField(blank=True)
    enrolled_students = models.IntegerField(default=0)
    

    def __str__(self):
        return self.name


class Module(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('order', 'title')
        constraints = [
            models.UniqueConstraint(
                fields=('course', 'title'),
                name='unique_course_module_title',
            ),
        ]

    def __str__(self):
        return f"{self.course.name} - {self.title}"


class Lesson(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    module = models.ForeignKey(
        Module,
        related_name='lessons',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=100)
    content = models.TextField()
    video_url = models.URLField(blank=True, null=True)
    length = models.DurationField()
    position = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    section_name = models.CharField(max_length=100)


    def __str__(self):
        return self.title
    

class Enrollment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    student = models.ForeignKey('users.User', related_name='enrollments', on_delete=models.CASCADE)
    enrollment_date = models.DateTimeField(auto_now_add=True)
    progress = models.FloatField(default=0.0)
    completed = models.BooleanField(default=False)
    completed_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=('course', 'student'),
                name='unique_course_student_enrollment',
            ),
        ]

    def __str__(self):
        return f"{self.student.name} enrolled in {self.course.name}"
