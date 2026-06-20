from rest_framework import serializers
from .models import SpeakingTest, SpeakingQuestion


class SpeakingQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpeakingQuestion
        fields = ['id', 'part', 'question_text', 'sample_answer', 'order_number']


class SpeakingTestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpeakingTest
        fields = ['id', 'cambridge_book', 'test_number']


class SpeakingTestDetailSerializer(serializers.ModelSerializer):
    questions = SpeakingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = SpeakingTest
        fields = ['id', 'cambridge_book', 'test_number', 'questions']
