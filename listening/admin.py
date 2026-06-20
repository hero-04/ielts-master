from django.contrib import admin
from .models import ListeningTest, ListeningQuestion, ListeningAttempt, ListeningAnswer

class ListeningQuestionInline(admin.StackedInline):
    model = ListeningQuestion
    extra = 1

@admin.register(ListeningTest)
class ListeningTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'cambridge_book', 'test_number', 'created_at')
    search_fields = ('title',)
    list_filter = ('cambridge_book', 'test_number')
    inlines = [ListeningQuestionInline]

@admin.register(ListeningQuestion)
class ListeningQuestionAdmin(admin.ModelAdmin):
    list_display = ('test', 'section', 'order_number', 'question_type')
    list_filter = ('test', 'section', 'question_type')
    search_fields = ('question_text',)
    ordering = ('test', 'order_number')

class ListeningAnswerInline(admin.TabularInline):
    model = ListeningAnswer
    extra = 0
    readonly_fields = ('question', 'user_answer', 'is_correct')
    can_delete = False

@admin.register(ListeningAttempt)
class ListeningAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'raw_score', 'band_score', 'started_at', 'completed_at')
    list_filter = ('test',)
    search_fields = ('user__email',)
    inlines = [ListeningAnswerInline]
    readonly_fields = ('user', 'test', 'started_at', 'completed_at', 'raw_score', 'band_score')
