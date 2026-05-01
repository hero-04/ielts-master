from rest_framework import serializers
from .models import ListeningTest, ListeningQuestion, ListeningAttempt, ListeningAnswer

class ListeningQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListeningQuestion
        fields = ['id', 'section', 'question_type', 'question_text', 'order_number']

class ListeningTestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListeningTest
        fields = ['id', 'title', 'difficulty', 'created_at']

class ListeningTestDetailSerializer(serializers.ModelSerializer):
    questions = ListeningQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = ListeningTest
        fields = ['id', 'title', 'difficulty', 'audio_url', 'transcript', 'questions', 'created_at']

class ListeningAnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    user_answer = serializers.CharField(allow_blank=True, max_length=255)

class ListeningAttemptSubmitSerializer(serializers.Serializer):
    answers = ListeningAnswerSubmissionSerializer(many=True)

class ListeningAnswerResultSerializer(serializers.ModelSerializer):
    correct_answer = serializers.CharField(source='question.correct_answer')
    question_order = serializers.IntegerField(source='question.order_number')
    section = serializers.IntegerField(source='question.section')

    class Meta:
        model = ListeningAnswer
        fields = ['question_id', 'question_order', 'section', 'user_answer', 'is_correct', 'correct_answer']

class ListeningAttemptResultSerializer(serializers.ModelSerializer):
    answers = ListeningAnswerResultSerializer(many=True, read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)

    class Meta:
        model = ListeningAttempt
        fields = ['id', 'test_id', 'test_title', 'started_at', 'completed_at', 'raw_score', 'band_score', 'answers']
