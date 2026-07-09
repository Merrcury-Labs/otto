from django.contrib import admin

from .models import Org, Tutor


class TutorInline(admin.TabularInline):
    model = Tutor
    extra = 0
    fields = ('name', 'email')


@admin.register(Org)
class OrgAdmin(admin.ModelAdmin):
    list_display = ('name', 'website')
    search_fields = ('name', 'description', 'website')
    inlines = (TutorInline,)


@admin.register(Tutor)
class TutorAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'org')
    list_filter = ('org',)
    search_fields = ('name', 'email', 'bio', 'org__name')
