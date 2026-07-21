from django.contrib import admin

from .models import GenerationJob, GenerationJobEvent


class GenerationJobEventInline(admin.TabularInline):
    model = GenerationJobEvent
    extra = 0
    readonly_fields = ('event_type', 'status', 'stage', 'message', 'metadata', 'created_at')


@admin.register(GenerationJob)
class GenerationJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'organization', 'tutor', 'status', 'progress_percent', 'updated_at')
    list_filter = ('status', 'organization')
    search_fields = ('id', 'tutor__name', 'status_message', 'error_message')
    readonly_fields = ('created_at', 'updated_at')
    inlines = (GenerationJobEventInline,)


@admin.register(GenerationJobEvent)
class GenerationJobEventAdmin(admin.ModelAdmin):
    list_display = ('job', 'event_type', 'status', 'stage', 'created_at')
    list_filter = ('event_type', 'status')
