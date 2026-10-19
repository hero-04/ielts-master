"""
Mock tests — full Listening + Reading + Writing sittings with their own content
pool. Nothing here is linked to the practice books, so a student can never meet
a mock passage they have already practised.
"""
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Mock(models.Model):
    number = models.PositiveSmallIntegerField(unique=True, validators=[MinValueValidator(1)],
                                              help_text='Shown to students as "Mock 1", "Mock 2", …')
    title = models.CharField(max_length=255, blank=True, default='',
                             help_text='Optional internal label, e.g. "IDP official demo"')
    is_active = models.BooleanField(default=True, help_text='Inactive mocks are hidden from students.')

    # Listening section (own content)
    listening_audio_url = models.URLField(max_length=500, blank=True, default='',
                                         help_text='Leave empty until the recording is ready — the Listening box is then skipped.')
    listening_transcript = models.TextField(blank=True, default='')

    # Reading section (own content)
    passage_a_title = models.CharField(max_length=255, blank=True, default='')
    passage_a = models.TextField(blank=True, default='', verbose_name='Passage 1')
    passage_b_title = models.CharField(max_length=255, blank=True, default='')
    passage_b = models.TextField(blank=True, default='', verbose_name='Passage 2')
    passage_c_title = models.CharField(max_length=255, blank=True, default='')
    passage_c = models.TextField(blank=True, default='', verbose_name='Passage 3')

    # Writing section (own content)
    task1_prompt_text = models.TextField(blank=True, default='', verbose_name='Task 1 prompt')
    task1_prompt_image = models.URLField(max_length=500, blank=True, default='', verbose_name='Task 1 image URL')
    task2_prompt_text = models.TextField(blank=True, default='', verbose_name='Task 2 prompt')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mock_tests'
        ordering = ['number']
        verbose_name = 'Mock test'
        verbose_name_plural = 'Mock tests'

    def __str__(self):
        return f'Mock {self.number}'

    # ── section availability ────────────────────────────────────────────
    @property
    def has_listening(self) -> bool:
        return bool(self.listening_audio_url) and self.questions.filter(section=MockQuestion.Section.LISTENING).exists()

    @property
    def has_reading(self) -> bool:
        return bool(self.passage_a) and self.questions.filter(section=MockQuestion.Section.READING).exists()

    @property
    def has_writing(self) -> bool:
        return bool(self.task1_prompt_text and self.task2_prompt_text)

    def section_order(self) -> list[str]:
        """Sections a student has to sit, in exam order."""
        order = []
        if self.has_listening:
            order.append('listening')
        if self.has_reading:
            order.append('reading')
        if self.has_writing:
            order.append('writing')
        return order


class MockQuestion(models.Model):
    class Section(models.TextChoices):
        LISTENING = 'listening', 'Listening'
        READING = 'reading', 'Reading'

    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        MULTIPLE_CHOICE_MULTIPLE = 'multiple_choice_multiple', 'Multiple Choice (Multiple Answers)'
        MATCHING_HEADINGS = 'matching_headings', 'Matching Headings'
        MATCHING_INFORMATION = 'matching_information', 'Matching Information'
        TFNG = 'tfng', 'True / False / Not Given'
        YNNG = 'ynng', 'Yes / No / Not Given'
        SUMMARY_COMPLETION = 'summary_completion', 'Summary Completion'
        SENTENCE_COMPLETION = 'sentence_completion', 'Sentence Completion'
        SHORT_ANSWER = 'short_answer', 'Short Answer'
        FORM_COMPLETION = 'form_completion', 'Form Completion'
        TABLE_COMPLETION = 'table_completion', 'Table Completion'
        DIAGRAM_LABELLING = 'diagram_labelling', 'Diagram Labelling'
        DRAG_DROP = 'drag_drop', 'Drag & Drop'
        SELECTION_GRID = 'selection_grid', 'Selection Grid'
        MATCHING = 'matching', 'Matching'

    mock = models.ForeignKey(Mock, on_delete=models.CASCADE, related_name='questions')
    section = models.CharField(max_length=10, choices=Section.choices)
    part = models.CharField(max_length=1, help_text='Listening: 1-4. Reading: A, B or C.')
    question_type = models.CharField(max_length=30, choices=QuestionType.choices)
    question_text = models.TextField()
    correct_answer = models.CharField(max_length=255, help_text='Comma-separated alternatives are all accepted')
    options = models.JSONField(default=list, blank=True)
    question_group = models.CharField(max_length=50, blank=True, default='')
    order_number = models.PositiveIntegerField()

    class Meta:
        db_table = 'mock_questions'
        ordering = ['mock', 'section', 'order_number']
        unique_together = [['mock', 'section', 'order_number']]

    def __str__(self):
        return f'{self.mock} | {self.section} {self.part} | Q{self.order_number}'


class MockAttempt(models.Model):
    """One sitting per student per mock (admins can delete a row to allow a retake)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mock_attempts')
    mock = models.ForeignKey(Mock, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    listening_started_at = models.DateTimeField(blank=True, null=True)
    listening_completed_at = models.DateTimeField(blank=True, null=True)
    listening_raw = models.PositiveSmallIntegerField(default=0)
    listening_band = models.DecimalField(max_digits=3, decimal_places=1, default=0)

    reading_started_at = models.DateTimeField(blank=True, null=True)
    reading_completed_at = models.DateTimeField(blank=True, null=True)
    reading_raw = models.PositiveSmallIntegerField(default=0)
    reading_band = models.DecimalField(max_digits=3, decimal_places=1, default=0)

    writing_started_at = models.DateTimeField(blank=True, null=True)
    writing_completed_at = models.DateTimeField(blank=True, null=True)
    task1_text = models.TextField(blank=True, default='')
    task2_text = models.TextField(blank=True, default='')
    task1_words = models.PositiveIntegerField(default=0)
    task2_words = models.PositiveIntegerField(default=0)
    writing_band = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True,
                                      help_text='Optional — filled in by a teacher after marking.')

    class Meta:
        db_table = 'mock_attempts'
        ordering = ['-started_at']
        unique_together = [['user', 'mock']]

    def __str__(self):
        return f'{self.user.email} — {self.mock}'

    def section_done(self, section: str) -> bool:
        return getattr(self, f'{section}_completed_at') is not None

    def section_started(self, section: str) -> bool:
        return getattr(self, f'{section}_started_at') is not None

    def next_section(self):
        for s in self.mock.section_order():
            if not self.section_done(s):
                return s
        return None

    def save(self, *args, **kwargs):
        self.task1_words = len(self.task1_text.split())
        self.task2_words = len(self.task2_text.split())
        super().save(*args, **kwargs)


class MockAnswer(models.Model):
    attempt = models.ForeignKey(MockAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(MockQuestion, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=255, blank=True)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'mock_answers'
        unique_together = [['attempt', 'question']]
