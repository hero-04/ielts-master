from django.contrib import admin
from .models import SpeakingTest, SpeakingQuestion


class SpeakingQuestionInline(admin.TabularInline):
    model = SpeakingQuestion
    extra = 3
    ordering = ('part', 'order_number')
    fields = ('part', 'order_number', 'question_text', 'sample_answer')


@admin.register(SpeakingTest)
class SpeakingTestAdmin(admin.ModelAdmin):
    list_display = ('book_number', 'test_number', 'created_at')
    list_filter = ('book_number', 'test_number')
    ordering = ('book_number', 'test_number')
    inlines = [SpeakingQuestionInline]
