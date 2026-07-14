from django.contrib import admin

from .models import Course, Enrollment, Lesson, Module


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ('module', 'title', 'section_name', 'length', 'video_url')


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0
    fields = ('title', 'description', 'order')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'tutor',
        'category',
        'level',
        'lesson_count',
        'enrolled_students',
    )
    list_filter = ('category', 'level')
    search_fields = ('name', 'description', 'tutor', 'category')
    inlines = (ModuleInline, LessonInline)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'description', 'course__name')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'module', 'section_name', 'length')
    list_filter = ('course', 'module', 'section_name')
    search_fields = ('title', 'content', 'course__name', 'module__title', 'section_name')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrollment_date')
    list_filter = ('course', 'enrollment_date')
    search_fields = ('student__name', 'student__email', 'course__name')
    readonly_fields = ('enrollment_date',)
