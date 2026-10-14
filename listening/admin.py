from django import forms
from django.contrib import admin
from django.db import models
from unfold.admin import ModelAdmin, StackedInline, TabularInline
from unfold.decorators import display
from unfold.contrib.filters.admin import RangeNumericFilter, RelatedDropdownFilter, ChoicesDropdownFilter

from .models import ListeningTest, ListeningQuestion, ListeningAttempt, ListeningAnswer


class ListeningQuestionInline(StackedInline):
    model = ListeningQuestion
    extra = 0
    ordering = ('order_number',)
    fields = (('order_number', 'section', 'question_type'), 'question_text', ('correct_answer', 'question_group'), 'options')
    formfield_overrides = {models.TextField: {'widget': forms.Textarea(attrs={'rows': 3})}}
    tab = True


@admin.register(ListeningTest)
class ListeningTestAdmin(ModelAdmin):
    list_display = ('__str__', 'title', 'question_count', 'attempt_count', 'has_transcript', 'created_at')
    list_filter = (('book_number', RangeNumericFilter), 'test_number')
    list_filter_submit = True
    search_fields = ('title',)
    ordering = ('book_number', 'test_number')
    inlines = [ListeningQuestionInline]
    fieldsets = (
        (None, {'fields': (('book_number', 'test_number'), 'title', 'audio_url')}),
        ('Transcript', {'classes': ['tab'], 'fields': ('transcript',)}),
    )

    @display(description='Questions')
    def question_count(self, obj):
        return obj.questions.count()

    @display(description='Attempts')
    def attempt_count(self, obj):
        return obj.listeningattempt_set.count()

    @display(description='Transcript', boolean=True)
    def has_transcript(self, obj):
        return bool(obj.transcript)


@admin.register(ListeningQuestion)
class ListeningQuestionAdmin(ModelAdmin):
    list_display = ('test', 'section', 'order_number', 'question_type', 'short_text', 'correct_answer')
    list_filter = (('test', RelatedDropdownFilter), 'section', ('question_type', ChoicesDropdownFilter))
    list_filter_submit = True
    search_fields = ('question_text', 'correct_answer')
    ordering = ('test', 'order_number')
    list_select_related = ('test',)
    fields = (('test', 'section', 'order_number'), 'question_type', 'question_text', ('correct_answer', 'question_group'), 'options')

    @display(description='Question')
    def short_text(self, obj):
        return (obj.question_text[:80] + '…') if len(obj.question_text) > 80 else obj.question_text


class ListeningAnswerInline(TabularInline):
    model = ListeningAnswer
    extra = 0
    fields = ('question', 'user_answer', 'correct', 'is_correct')
    readonly_fields = ('question', 'user_answer', 'correct', 'is_correct')
    can_delete = False
    ordering = ('question__order_number',)

    @display(description='Correct answer')
    def correct(self, obj):
        return obj.question.correct_answer

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ListeningAttempt)
class ListeningAttemptAdmin(ModelAdmin):
    list_display = ('user', 'test', 'raw_score', 'band_badge', 'completed_at')
    list_filter = (('test', RelatedDropdownFilter), 'completed_at')
    list_filter_submit = True
    search_fields = ('user__email', 'user__full_name')
    date_hierarchy = 'completed_at'
    list_select_related = ('user', 'test')
    inlines = [ListeningAnswerInline]
    readonly_fields = ('user', 'test', 'started_at', 'completed_at', 'raw_score', 'band_score')

    @display(description='Band', label=True)
    def band_badge(self, obj):
        return f'Band {obj.band_score}'

    def has_add_permission(self, request):
        return False
