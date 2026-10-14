from django import forms
from django.contrib import admin
from django.db import models
from unfold.admin import ModelAdmin, StackedInline, TabularInline
from unfold.decorators import display
from unfold.contrib.filters.admin import RangeNumericFilter, RelatedDropdownFilter, ChoicesDropdownFilter

from .models import ReadingTest, ReadingQuestion, ReadingAttempt, ReadingAnswer


class ReadingQuestionInline(StackedInline):
    model = ReadingQuestion
    extra = 0
    ordering = ('order_number',)
    fields = (('order_number', 'passage', 'question_type'), 'question_text', 'correct_answer', 'options', 'explanation')
    formfield_overrides = {models.TextField: {'widget': forms.Textarea(attrs={'rows': 3})}}
    tab = True


@admin.register(ReadingTest)
class ReadingTestAdmin(ModelAdmin):
    list_display = ('__str__', 'title', 'question_count', 'attempt_count', 'created_at')
    list_filter = (('book_number', RangeNumericFilter), 'test_number')
    list_filter_submit = True
    search_fields = ('title', 'passage_a_title', 'passage_b_title', 'passage_c_title')
    ordering = ('book_number', 'test_number')
    inlines = [ReadingQuestionInline]
    fieldsets = (
        (None, {'fields': (('book_number', 'test_number'), 'title')}),
        ('Passage 1', {'classes': ['tab'], 'fields': ('passage_a_title', 'passage_a')}),
        ('Passage 2', {'classes': ['tab'], 'fields': ('passage_b_title', 'passage_b')}),
        ('Passage 3', {'classes': ['tab'], 'fields': ('passage_c_title', 'passage_c')}),
    )

    @display(description='Questions')
    def question_count(self, obj):
        return obj.questions.count()

    @display(description='Attempts')
    def attempt_count(self, obj):
        return obj.readingattempt_set.count()


@admin.register(ReadingQuestion)
class ReadingQuestionAdmin(ModelAdmin):
    list_display = ('test', 'passage', 'order_number', 'question_type', 'short_text', 'correct_answer')
    list_filter = (('test', RelatedDropdownFilter), 'passage', ('question_type', ChoicesDropdownFilter))
    list_filter_submit = True
    search_fields = ('question_text', 'correct_answer')
    ordering = ('test', 'order_number')
    list_select_related = ('test',)
    fields = (('test', 'passage', 'order_number'), 'question_type', 'question_text', 'correct_answer', 'options', 'explanation')

    @display(description='Question')
    def short_text(self, obj):
        return (obj.question_text[:80] + '…') if len(obj.question_text) > 80 else obj.question_text


class ReadingAnswerInline(TabularInline):
    model = ReadingAnswer
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


@admin.register(ReadingAttempt)
class ReadingAttemptAdmin(ModelAdmin):
    list_display = ('user', 'test', 'raw_score', 'band_badge', 'completed_at')
    list_filter = (('test', RelatedDropdownFilter), 'completed_at')
    list_filter_submit = True
    search_fields = ('user__email', 'user__full_name')
    date_hierarchy = 'completed_at'
    list_select_related = ('user', 'test')
    inlines = [ReadingAnswerInline]
    readonly_fields = ('user', 'test', 'started_at', 'completed_at', 'raw_score', 'band_score')

    @display(description='Band', label=True)
    def band_badge(self, obj):
        return f'Band {obj.band_score}'

    def has_add_permission(self, request):
        return False
