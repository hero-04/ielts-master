from django.contrib import admin
from .models import ReadingTest, ReadingQuestion, ReadingAttempt, ReadingAnswer

class ReadingQuestionInline(admin.StackedInline):
    model = ReadingQuestion
    extra = 1

@admin.register(ReadingTest)
class ReadingTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'created_at')
    search_fields = ('title',)
    list_filter = ('difficulty',)
    inlines = [ReadingQuestionInline]

@admin.register(ReadingQuestion)
class ReadingQuestionAdmin(admin.ModelAdmin):
    list_display = ('test', 'passage', 'order_number', 'question_type')
    list_filter = ('test', 'passage', 'question_type')
    search_fields = ('question_text',)
    ordering = ('test', 'order_number')

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
