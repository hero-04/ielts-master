from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display
from unfold.contrib.filters.admin import RangeNumericFilter, RelatedDropdownFilter

from .models import WritingPrompt, WritingSubmission


@admin.register(WritingPrompt)
class WritingPromptAdmin(ModelAdmin):
    list_display = ('__str__', 'task_badge', 'short_prompt', 'has_image', 'submission_count', 'created_at')
    list_filter = (('book_number', RangeNumericFilter), 'test_number', 'task_type')
    list_filter_submit = True
    search_fields = ('prompt_text',)
    ordering = ('book_number', 'test_number', 'task_type')
    fieldsets = (
        (None, {'fields': (('book_number', 'test_number', 'task_type'),)}),
        ('Prompt', {'fields': ('prompt_text', 'prompt_image', 'image_preview')}),
        ('Sample answer', {'classes': ['tab'], 'fields': ('sample_answer',)}),
    )
    readonly_fields = ('image_preview',)

    @display(description='Task', label={'task_1': 'warning', 'task_2': 'info'})
    def task_badge(self, obj):
        return obj.task_type, obj.get_task_type_display()

    @display(description='Prompt')
    def short_prompt(self, obj):
        return (obj.prompt_text[:90] + '…') if len(obj.prompt_text) > 90 else obj.prompt_text

    @display(description='Image', boolean=True)
    def has_image(self, obj):
        return bool(obj.prompt_image)

    @display(description='Submissions')
    def submission_count(self, obj):
        return obj.submissions.count()

    @display(description='Preview')
    def image_preview(self, obj):
        if obj and obj.prompt_image:
            return format_html('<img src="{}" style="max-height:260px;border-radius:8px" alt="prompt image">', obj.prompt_image)
        return '—'


@admin.register(WritingSubmission)
class WritingSubmissionAdmin(ModelAdmin):
    list_display = ('user', 'prompt', 'word_count', 'created_at')
    list_filter = (('prompt', RelatedDropdownFilter), 'created_at')
    list_filter_submit = True
    search_fields = ('user__email', 'user__full_name', 'submission_text')
    date_hierarchy = 'created_at'
    list_select_related = ('user', 'prompt')
    readonly_fields = ('user', 'prompt', 'word_count', 'created_at', 'submission_text')
    fields = (('user', 'prompt'), ('word_count', 'created_at'), 'submission_text')

    def has_add_permission(self, request):
        return False
