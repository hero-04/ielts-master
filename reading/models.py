from django.db import models
from django.conf import settings

class ReadingTest(models.Model):
    class Difficulty(models.TextChoices):
        EASY = 'easy', 'Easy'
        MEDIUM = 'medium', 'Medium'
        HARD = 'hard', 'Hard'

    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    passage_a = models.TextField(verbose_name='Passage 1')
    passage_b = models.TextField(verbose_name='Passage 2')
    passage_c = models.TextField(verbose_name='Passage 3')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reading_tests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_difficulty_display()})"


class ReadingQuestion(models.Model):
    class Passage(models.TextChoices):
        PASSAGE_A = 'A', 'Passage 1'
        PASSAGE_B = 'B', 'Passage 2'
        PASSAGE_C = 'C', 'Passage 3'

    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        MATCHING_HEADINGS = 'matching_headings', 'Matching Headings'
        MATCHING_INFORMATION = 'matching_information', 'Matching Information'
        TFNG = 'tfng', 'True / False / Not Given'
        YNNG = 'ynng', 'Yes / No / Not Given'
        SUMMARY_COMPLETION = 'summary_completion', 'Summary Completion'
        SENTENCE_COMPLETION = 'sentence_completion', 'Sentence Completion'
        SHORT_ANSWER = 'short_answer', 'Short Answer'

    test = models.ForeignKey(ReadingTest, on_delete=models.CASCADE, related_name='questions')
    passage = models.CharField(max_length=1, choices=Passage.choices)
    question_type = models.CharField(max_length=30, choices=QuestionType.choices)
    question_text = models.TextField()
    correct_answer = models.CharField(max_length=255, help_text="Can be multiple comma-separated answers if needed")
    explanation = models.TextField(blank=True, null=True)
    order_number = models.PositiveIntegerField()

    class Meta:
        db_table = 'reading_questions'
        ordering = ['test', 'passage', 'order_number']
        unique_together = [['test', 'order_number']]

    def __str__(self):
        return f"Test: {self.test.id} | Passage {self.passage} | Q{self.order_number}"


class ReadingAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reading_attempts')
    test = models.ForeignKey(ReadingTest, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    raw_score = models.PositiveIntegerField(default=0)
    band_score = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)

    class Meta:
        db_table = 'reading_attempts'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.email} - {self.test.title} (Band: {self.band_score})"


class ReadingAnswer(models.Model):
    attempt = models.ForeignKey(ReadingAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(ReadingQuestion, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=255, blank=True)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'reading_answers'
        unique_together = [['attempt', 'question']]
