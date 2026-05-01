from rest_framework import serializers
from .models import VocabularyWord, UserWordProgress

class VocabularyWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyWord
        fields = ['id', 'word', 'definition', 'example_sentence', 'topic', 'difficulty', 'audio_url']

class UserWordProgressSerializer(serializers.ModelSerializer):
    word_details = VocabularyWordSerializer(source='word', read_only=True)

    class Meta:
        model = UserWordProgress
        fields = ['id', 'word', 'word_details', 'status', 'next_review_date', 'review_count']

class ReviewWordSerializer(serializers.Serializer):
    word_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['known', 'learning'])
