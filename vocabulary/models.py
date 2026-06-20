from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.core.validators import MinValueValidator, MaxValueValidator

class VocabularyWord(models.Model):
    class Topic(models.TextChoices):
        ENVIRONMENT = 'environment', 'Environment'
        TECHNOLOGY = 'technology', 'Technology'
        HEALTH = 'health', 'Health'
        EDUCATION = 'education', 'Education'
        SOCIETY = 'society', 'Society'
        SCIENCE = 'science', 'Science'
        BUSINESS = 'business', 'Business'
        CULTURE = 'culture', 'Culture'

    class Difficulty(models.TextChoices):
        EASY = 'easy', 'Easy'
        MEDIUM = 'medium', 'Medium'
        HARD = 'hard', 'Hard'

    word = models.CharField(max_length=100, unique=True)
    definition = models.TextField()
    example_sentence = models.TextField()
    topic = models.CharField(max_length=50, choices=Topic.choices)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    cambridge_book = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(19)], db_index=True)
    audio_url = models.URLField(max_length=500, blank=True, null=True, verbose_name='Audio Pronunciation')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vocabulary_words'
        ordering = ['word']

    def __str__(self):
        return f"{self.word} ({self.get_topic_display()})"


class UserWordProgress(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        LEARNING = 'learning', 'Learning'
        KNOWN = 'known', 'Known'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='word_progress')
    word = models.ForeignKey(VocabularyWord, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    next_review_date = models.DateField(default=timezone.now)
    review_count = models.PositiveIntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_word_progress'
        unique_together = [['user', 'word']]
        ordering = ['next_review_date']

    def __str__(self):
        return f"{self.user.email} - {self.word.word} ({self.status})"
