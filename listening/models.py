from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class ListeningTest(models.Model):
    title = models.CharField(max_length=255)
    cambridge_book = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(19)])
    test_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(4)])
    audio_url = models.URLField(max_length=500, verbose_name='Audio URL')
    transcript = models.TextField(blank=True, null=True, verbose_name='Transcript')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'listening_tests'
        ordering = ['-created_at']
        unique_together = [['cambridge_book', 'test_number']]

    def __str__(self):
        return f"Cambridge {self.cambridge_book} - Test {self.test_number}"


class ListeningQuestion(models.Model):
    class Section(models.IntegerChoices):
        SECTION_1 = 1, 'Section 1'
        SECTION_2 = 2, 'Section 2'
        SECTION_3 = 3, 'Section 3'
        SECTION_4 = 4, 'Section 4'

    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        MATCHING_HEADINGS = 'matching_headings', 'Matching Headings'
        MATCHING_INFORMATION = 'matching_information', 'Matching Information'
        TFNG = 'tfng', 'True / False / Not Given'
        YNNG = 'ynng', 'Yes / No / Not Given'
        SUMMARY_COMPLETION = 'summary_completion', 'Summary Completion'
        SENTENCE_COMPLETION = 'sentence_completion', 'Sentence Completion'
        SHORT_ANSWER = 'short_answer', 'Short Answer'
        # Listening specific
        FORM_COMPLETION = 'form_completion', 'Form Completion'
        TABLE_COMPLETION = 'table_completion', 'Table Completion'
        DIAGRAM_LABELLING = 'diagram_labelling', 'Diagram Labelling'

    test = models.ForeignKey(ListeningTest, on_delete=models.CASCADE, related_name='questions')
    section = models.IntegerField(choices=Section.choices)
    question_type = models.CharField(max_length=30, choices=QuestionType.choices)
    question_text = models.TextField()
    correct_answer = models.CharField(max_length=255, help_text="Can be multiple comma-separated answers if needed")
    order_number = models.PositiveIntegerField()

    class Meta:
        db_table = 'listening_questions'
        ordering = ['test', 'section', 'order_number']
        unique_together = [['test', 'order_number']]

    def __str__(self):
        return f"Test: {self.test.id} | Section {self.section} | Q{self.order_number}"


class ListeningAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listening_attempts')
    test = models.ForeignKey(ListeningTest, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    raw_score = models.PositiveIntegerField(default=0)
    band_score = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)

    class Meta:
        db_table = 'listening_attempts'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.email} - {self.test.title} (Band: {self.band_score})"


class ListeningAnswer(models.Model):
    attempt = models.ForeignKey(ListeningAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(ListeningQuestion, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=255, blank=True)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'listening_answers'
        unique_together = [['attempt', 'question']]
