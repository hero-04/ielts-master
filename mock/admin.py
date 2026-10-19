from django import forms
from django.contrib import admin, messages
from django.db import models
from unfold.admin import ModelAdmin, StackedInline, TabularInline
from unfold.decorators import action, display
from unfold.contrib.filters.admin import RelatedDropdownFilter, ChoicesDropdownFilter

from .models import Mock, MockQuestion, MockAttempt, MockAnswer


class MockQuestionInline(StackedInline):
    model = MockQuestion
    extra = 0
    ordering = ('section', 'order_number')
    fields = (('section', 'part', 'order_number', 'question_type'), 'question_text', 'correct_answer', 'options', 'question_group')
    formfield_overrides = {models.TextField: {'widget': forms.Textarea(attrs={'rows': 3})}}
    tab = True


@admin.register(Mock)
class MockAdmin(ModelAdmin):
    list_display = ('__str__', 'title', 'is_active', 'sections_badge', 'question_count', 'attempt_count', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title',)
    ordering = ('number',)
    inlines = [MockQuestionInline]
    fieldsets = (
        (None, {'fields': (('number', 'is_active'), 'title')}),
        ('Listening', {'classes': ['tab'], 'fields': ('listening_audio_url', 'listening_transcript')}),
        ('Reading — Passage 1', {'classes': ['tab'], 'fields': ('passage_a_title', 'passage_a')}),
        ('Reading — Passage 2', {'classes': ['tab'], 'fields': ('passage_b_title', 'passage_b')}),
        ('Reading — Passage 3', {'classes': ['tab'], 'fields': ('passage_c_title', 'passage_c')}),
        ('Writing', {'classes': ['tab'], 'fields': ('task1_prompt_text', 'task1_prompt_image', 'task2_prompt_text')}),
    )

    @display(description='Sections')
    def sections_badge(self, obj):
        return ' · '.join(s.capitalize() for s in obj.section_order()) or '—'

    @display(description='Questions')
    def question_count(self, obj):
        return obj.questions.count()

    @display(description='Attempts')
    def attempt_count(self, obj):
        return obj.attempts.count()


@admin.register(MockQuestion)
class MockQuestionAdmin(ModelAdmin):
    list_display = ('mock', 'section', 'part', 'order_number', 'question_type', 'short_text', 'correct_answer')
    list_filter = (('mock', RelatedDropdownFilter), 'section', ('question_type', ChoicesDropdownFilter))
    list_filter_submit = True
    search_fields = ('question_text', 'correct_answer')
    ordering = ('mock', 'section', 'order_number')
    list_select_related = ('mock',)
    fields = (('mock', 'section', 'part', 'order_number'), 'question_type', 'question_text', 'correct_answer', 'options', 'question_group')

    @display(description='Question')
    def short_text(self, obj):
        return (obj.question_text[:80] + '…') if len(obj.question_text) > 80 else obj.question_text


class MockAnswerInline(TabularInline):
    model = MockAnswer
    extra = 0
    fields = ('question', 'user_answer', 'correct', 'is_correct')
    readonly_fields = ('question', 'user_answer', 'correct', 'is_correct')
    can_delete = False
    ordering = ('question__section', 'question__order_number')

    @display(description='Correct answer')
    def correct(self, obj):
        return obj.question.correct_answer

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(MockAttempt)
class MockAttemptAdmin(ModelAdmin):
    list_display = ('user', 'mock', 'progress', 'listening_badge', 'reading_badge', 'words', 'writing_band', 'completed_at')
    list_filter = (('mock', RelatedDropdownFilter), 'completed_at')
    list_filter_submit = True
    search_fields = ('user__email', 'user__full_name')
    date_hierarchy = 'started_at'
    list_select_related = ('user', 'mock')
    inlines = [MockAnswerInline]
    actions = ['reset_attempt']
    readonly_fields = (
        'user', 'mock', 'started_at', 'completed_at',
        'listening_started_at', 'listening_completed_at', 'listening_raw', 'listening_band',
        'reading_started_at', 'reading_completed_at', 'reading_raw', 'reading_band',
        'writing_started_at', 'writing_completed_at', 'task1_words', 'task2_words',
    )
    fieldsets = (
        (None, {'fields': (('user', 'mock'), ('started_at', 'completed_at'))}),
        ('Listening', {'classes': ['tab'], 'fields': (('listening_started_at', 'listening_completed_at'), ('listening_raw', 'listening_band'))}),
        ('Reading', {'classes': ['tab'], 'fields': (('reading_started_at', 'reading_completed_at'), ('reading_raw', 'reading_band'))}),
        ('Writing', {'classes': ['tab'], 'fields': (('writing_started_at', 'writing_completed_at'), 'writing_band',
                                                    'task1_words', 'task1_text', 'task2_words', 'task2_text')}),
    )

    @display(description='Progress')
    def progress(self, obj):
        order = obj.mock.section_order()
        done = [s[0].upper() for s in order if obj.section_done(s)]
        return f'{len(done)}/{len(order)} ' + ''.join(done)

    @display(description='Listening', label=True)
    def listening_badge(self, obj):
        return f'{obj.listening_raw}/40 · {obj.listening_band}' if obj.listening_completed_at else '—'

    @display(description='Reading', label=True)
    def reading_badge(self, obj):
        return f'{obj.reading_raw}/40 · {obj.reading_band}' if obj.reading_completed_at else '—'

    @display(description='Words T1 / T2')
    def words(self, obj):
        return f'{obj.task1_words} / {obj.task2_words}' if obj.writing_completed_at else '—'

    @action(description='Reset — delete selected attempts so the student can retake')
    def reset_attempt(self, request, queryset):
        n, _ = queryset.delete()
        messages.success(request, f'{n} record(s) removed. Those students can sit the mock again.')

    def has_add_permission(self, request):
        return False
