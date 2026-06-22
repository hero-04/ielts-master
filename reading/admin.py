from django.contrib import admin
from .models import ReadingTest, ReadingQuestion, ReadingAttempt, ReadingAnswer

class ReadingQuestionInline(admin.StackedInline):
    model = ReadingQuestion
    extra = 1

@admin.register(ReadingTest)
class ReadingTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'cambridge_book', 'test_number', 'created_at')
    search_fields = ('title',)
    list_filter = ('cambridge_book', 'test_number')
    inlines = [ReadingQuestionInline]

@admin.register(ReadingQuestion)
class ReadingQuestionAdmin(admin.ModelAdmin):
    list_display = ('test', 'passage', 'order_number', 'question_type')
    list_filter = ('test', 'passage', 'question_type')
    search_fields = ('question_text',)
    ordering = ('test', 'order_number')
    fields = ('test', 'passage', 'question_type', 'question_text', 'correct_answer', 'explanation', 'order_number', 'options')

class ReadingAnswerInline(admin.TabularInline):
    model = ReadingAnswer
    extra = 0
    readonly_fields = ('question', 'user_answer', 'is_correct')
    can_delete = False

@admin.register(ReadingAttempt)
class ReadingAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'raw_score', 'band_score', 'started_at', 'completed_at')
    list_filter = ('test',)
    search_fields = ('user__email',)
    inlines = [ReadingAnswerInline]
    readonly_fields = ('user', 'test', 'started_at', 'completed_at', 'raw_score', 'band_score')
