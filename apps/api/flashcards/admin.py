from django.contrib import admin

from .models import Flashcard, FlashcardDeck, FlashcardProgress


@admin.register(FlashcardDeck)
class FlashcardDeckAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'status', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('title', 'description')


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ('front', 'deck', 'position')
    list_filter = ('deck',)
    search_fields = ('front', 'back')


@admin.register(FlashcardProgress)
class FlashcardProgressAdmin(admin.ModelAdmin):
    list_display = ('card', 'student', 'ease_factor', 'interval', 'repetitions', 'next_review')
    list_filter = ('student',)
