from rest_framework import serializers
from .models import WritingPrompt, WritingSubmission


class WritingPromptListSerializer(serializers.ModelSerializer):
    class Meta:
        model = WritingPrompt
        fields = ['id', 'cambridge_book', 'test_number', 'task_type']


class WritingPromptDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = WritingPrompt
        fields = ['id', 'cambridge_book', 'test_number', 'task_type', 'prompt_text', 'prompt_image', 'sample_answer']


class WritingSubmissionSerializer(serializers.ModelSerializer):
    prompt_cambridge_book = serializers.IntegerField(source='prompt.cambridge_book', read_only=True)
    prompt_test_number = serializers.IntegerField(source='prompt.test_number', read_only=True)
    prompt_task_type = serializers.CharField(source='prompt.task_type', read_only=True)

    class Meta:
        model = WritingSubmission
        fields = ['id', 'prompt', 'submission_text', 'word_count', 'created_at',
                  'prompt_cambridge_book', 'prompt_test_number', 'prompt_task_type']
        read_only_fields = ['word_count', 'created_at']
