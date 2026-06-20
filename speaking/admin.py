from django.contrib import admin
from .models import SpeakingTest, SpeakingQuestion


class SpeakingQuestionInline(admin.TabularInline):
    model = SpeakingQuestion
    extra = 3
    ordering = ('part', 'order_number')
    fields = ('part', 'order_number', 'question_text', 'sample_answer')


@admin.register(SpeakingTest)
class SpeakingTestAdmin(admin.ModelAdmin):
    list_display = ('cambridge_book', 'test_number', 'created_at')
    list_filter = ('cambridge_book', 'test_number')
    ordering = ('cambridge_book', 'test_number')
    inlines = [SpeakingQuestionInline]
