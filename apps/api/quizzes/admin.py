from django.contrib import admin

from .models import Answer, Attempt, Question, Quiz, QuizProgress


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ('text', 'type', 'correct_option', 'options', 'points', 'hint', 'categories')


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    fields = ('question', 'response', 'is_correct', 'points')
    readonly_fields = ('question', 'response', 'is_correct', 'points')


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'author', 'length', 'num_questions', 'passing_score', 'status')
    list_filter = ('course', 'author', 'status')
    search_fields = ('title', 'description', 'author', 'course__name')
    inlines = (QuestionInline,)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('short_text', 'quiz', 'type', 'points', 'hint')
    list_filter = ('quiz', 'type')
    search_fields = ('text', 'quiz__title')

    @admin.display(description='Question')
    def short_text(self, obj):
        return obj.text[:75]


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'earned_points', 'max_points', 'passed', 'attempt_date')
    list_filter = ('quiz', 'passed', 'attempt_date')
    search_fields = ('student__name', 'student__email', 'quiz__title')
    readonly_fields = ('attempt_date',)
    inlines = (AnswerInline,)


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'short_question_text', 'is_correct', 'points')
    list_filter = ('is_correct',)
    search_fields = ('question__text', 'attempt__student__name')
    readonly_fields = ('attempt', 'question', 'response', 'is_correct', 'points')

    @admin.display(description='Question')
    def short_question_text(self, obj):
        return obj.question.text[:75]


@admin.register(QuizProgress)
class QuizProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'best_score', 'attempts_count', 'completed', 'last_attempted')
    list_filter = ('completed', 'quiz')
    search_fields = ('student__name', 'student__email', 'quiz__title')
