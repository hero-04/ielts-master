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
    class Meta:
        model = WritingSubmission
        fields = ['id', 'prompt', 'submission_text', 'word_count', 'created_at']
        read_only_fields = ['word_count', 'created_at']
