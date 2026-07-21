from django.contrib import admin

from .models import GenerationJob, GenerationJobEvent, SourceChunk, SourceDocument


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


class SourceChunkInline(admin.TabularInline):
    model = SourceChunk
    extra = 0
    readonly_fields = (
        'position', 'page_number', 'heading', 'content_hash', 'character_count', 'created_at'
    )


@admin.register(SourceDocument)
class SourceDocumentAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'job', 'status', 'file_size', 'created_at')
    list_filter = ('status', 'content_type')
    search_fields = ('original_filename', 'sha256', 'job__id')
    readonly_fields = ('sha256', 'file_size', 'created_at', 'updated_at')
    inlines = (SourceChunkInline,)


@admin.register(SourceChunk)
class SourceChunkAdmin(admin.ModelAdmin):
    list_display = ('document', 'position', 'page_number', 'character_count')
    search_fields = ('document__original_filename', 'content')
