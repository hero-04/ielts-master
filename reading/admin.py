from django import forms
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
    fields = ('cambridge_book', 'test_number', 'passage_a_title', 'passage_a', 'passage_b_title', 'passage_b', 'passage_c_title', 'passage_c')
    inlines = [ReadingQuestionInline]

@admin.register(ReadingQuestion)
class ReadingQuestionAdmin(admin.ModelAdmin):
    list_display = ('test', 'passage', 'order_number', 'question_type')
    list_filter = ('test', 'passage', 'question_type')
    search_fields = ('question_text',)
    ordering = ('test', 'order_number')

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'explanation':
            kwargs['widget'] = forms.Textarea(attrs={'rows': 3})
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def get_fields(self, request, obj=None):
        fields = ['test', 'passage', 'question_type', 'question_text', 'correct_answer', 'explanation', 'order_number']
        if obj is None or obj.question_type == 'multiple_choice':
            fields.append('options')
        return fields

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
