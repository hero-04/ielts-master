from django.contrib import admin
from .models import WritingPrompt, WritingSubmission


@admin.register(WritingPrompt)
class WritingPromptAdmin(admin.ModelAdmin):
    list_display = ('cambridge_book', 'test_number', 'task_type', 'created_at')
    list_filter = ('cambridge_book', 'test_number', 'task_type')
    search_fields = ('prompt_text',)
    ordering = ('cambridge_book', 'test_number', 'task_type')


@admin.register(WritingSubmission)
class WritingSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'prompt', 'word_count', 'created_at')
    list_filter = ('prompt',)
    search_fields = ('user__email',)
    readonly_fields = ('word_count', 'created_at')
