from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from unfold.contrib.filters.admin import RangeNumericFilter, ChoicesDropdownFilter

from .models import VocabularyWord, UserWordProgress


@admin.register(VocabularyWord)
class VocabularyWordAdmin(ModelAdmin):
    list_display = ('word', 'topic_badge', 'difficulty', 'book_number', 'short_definition', 'created_at')
    list_filter = (('topic', ChoicesDropdownFilter), 'difficulty', ('book_number', RangeNumericFilter))
    list_filter_submit = True
    search_fields = ('word', 'definition', 'example_sentence')
    ordering = ('word',)
    list_per_page = 50
    fields = (('word', 'book_number'), ('topic', 'difficulty'), 'definition', 'example_sentence', 'audio_url')

    @display(description='Topic', label=True)
    def topic_badge(self, obj):
        return obj.get_topic_display()

    @display(description='Definition')
    def short_definition(self, obj):
        return (obj.definition[:80] + '…') if len(obj.definition) > 80 else obj.definition


@admin.register(UserWordProgress)
class UserWordProgressAdmin(ModelAdmin):
    list_display = ('user', 'word', 'status_badge', 'next_review_date', 'review_count', 'updated_at')
    list_filter = ('status', 'next_review_date')
    list_filter_submit = True
    search_fields = ('user__email', 'word__word')
    list_select_related = ('user', 'word')
    readonly_fields = ('updated_at',)

    @display(description='Status', label={'new': 'default', 'learning': 'warning', 'known': 'success'})
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()
