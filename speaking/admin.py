from django import forms
from django.contrib import admin
from django.db import models
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from unfold.contrib.filters.admin import RangeNumericFilter

from .models import SpeakingTest, SpeakingQuestion


class SpeakingQuestionInline(TabularInline):
    model = SpeakingQuestion
    extra = 0
    ordering = ('part', 'order_number')
    fields = ('part', 'order_number', 'question_text', 'sample_answer')
    formfield_overrides = {models.TextField: {'widget': forms.Textarea(attrs={'rows': 2})}}


@admin.register(SpeakingTest)
class SpeakingTestAdmin(ModelAdmin):
    list_display = ('__str__', 'part1_count', 'part2_count', 'part3_count', 'created_at')
    list_filter = (('book_number', RangeNumericFilter), 'test_number')
    list_filter_submit = True
    ordering = ('book_number', 'test_number')
    inlines = [SpeakingQuestionInline]
    fields = (('book_number', 'test_number'),)

    @display(description='Part 1')
    def part1_count(self, obj):
        return obj.questions.filter(part=1).count()

    @display(description='Part 2')
    def part2_count(self, obj):
        return obj.questions.filter(part=2).count()

    @display(description='Part 3')
    def part3_count(self, obj):
        return obj.questions.filter(part=3).count()


@admin.register(SpeakingQuestion)
class SpeakingQuestionAdmin(ModelAdmin):
    list_display = ('test', 'part', 'order_number', 'short_text')
    list_filter = ('test', 'part')
    search_fields = ('question_text', 'sample_answer')
    ordering = ('test', 'part', 'order_number')
    list_select_related = ('test',)

    @display(description='Question')
    def short_text(self, obj):
        return (obj.question_text[:90] + '…') if len(obj.question_text) > 90 else obj.question_text
