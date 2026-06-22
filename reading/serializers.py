from rest_framework import serializers
from .models import ReadingTest, ReadingQuestion, ReadingAttempt, ReadingAnswer

class ReadingQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingQuestion
        fields = ['id', 'passage', 'question_type', 'question_text', 'order_number', 'options']
        # Note: We omit correct_answer and explanation here so users don't cheat

class ReadingTestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingTest
        fields = ['id', 'title', 'cambridge_book', 'test_number', 'created_at']

class ReadingTestDetailSerializer(serializers.ModelSerializer):
    questions = ReadingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = ReadingTest
        fields = ['id', 'title', 'cambridge_book', 'test_number', 'passage_a', 'passage_b', 'passage_c', 'questions', 'created_at']

class ReadingAnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    user_answer = serializers.CharField(allow_blank=True, max_length=255)

class ReadingAttemptSubmitSerializer(serializers.Serializer):
    answers = ReadingAnswerSubmissionSerializer(many=True)

class ReadingAnswerResultSerializer(serializers.ModelSerializer):
    correct_answer = serializers.CharField(source='question.correct_answer')
    explanation = serializers.CharField(source='question.explanation')
    question_order = serializers.IntegerField(source='question.order_number')
    passage = serializers.CharField(source='question.passage')

    class Meta:
        model = ReadingAnswer
        fields = ['question_id', 'question_order', 'passage', 'user_answer', 'is_correct', 'correct_answer', 'explanation']

class ReadingAttemptResultSerializer(serializers.ModelSerializer):
    answers = ReadingAnswerResultSerializer(many=True, read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)
    total_questions = serializers.SerializerMethodField()

    def get_total_questions(self, obj):
        return obj.answers.count()

    class Meta:
        model = ReadingAttempt
        fields = ['id', 'test_id', 'test_title', 'started_at', 'completed_at', 'raw_score', 'band_score', 'total_questions', 'answers']

class ReadingAttemptListSerializer(serializers.ModelSerializer):
    cambridge_book = serializers.IntegerField(source='test.cambridge_book', read_only=True)
    test_number = serializers.IntegerField(source='test.test_number', read_only=True)

    class Meta:
        model = ReadingAttempt
        fields = ['id', 'cambridge_book', 'test_number', 'band_score', 'raw_score', 'started_at', 'completed_at']
