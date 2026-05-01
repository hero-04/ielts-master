from django.contrib import admin
from .models import VocabularyWord, UserWordProgress

@admin.register(VocabularyWord)
class VocabularyWordAdmin(admin.ModelAdmin):
    list_display = ('word', 'topic', 'difficulty', 'created_at')
    list_filter = ('topic', 'difficulty')
    search_fields = ('word', 'definition')
    ordering = ('word',)

@admin.register(UserWordProgress)
class UserWordProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'word', 'status', 'next_review_date', 'review_count')
    list_filter = ('status', 'next_review_date')
    search_fields = ('user__email', 'word__word')
    readonly_fields = ('updated_at',)
