"""
Mock tests — full Listening + Reading + Writing sittings with their own content
pool. Nothing here is linked to the practice books, so a student can never meet
a mock passage they have already practised.
"""
import re

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

GAP_RE = re.compile(r'\[\[(\d+)\]\]')


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
    group = models.ForeignKey('MockQuestionGroup', on_delete=models.CASCADE, null=True, blank=True,
                              related_name='questions', help_text='Set automatically for questions that belong to a question block.')
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


class MockQuestionGroup(models.Model):
    """
    A block of questions written as HTML, exactly as it looks on the paper —
    a form, table, notes, flow-chart, map… Every gap is written as [[N]] where
    N is the question number. The answer key is one line per gap:

        11 = sun
        12 = oil / olive oil        (alternatives separated by "/")

    If a word bank is given (one option per line, e.g. "A  sunlight"), the gaps
    become drop boxes and the answers are the letters.
    Saving the block creates / updates the question rows used for scoring.
    """
    mock = models.ForeignKey(Mock, on_delete=models.CASCADE, related_name='groups')
    section = models.CharField(max_length=10, choices=[('listening', 'Listening'), ('reading', 'Reading')])
    part = models.CharField(max_length=1, help_text='Listening: 1-4. Reading: A, B or C.')
    order = models.PositiveSmallIntegerField(default=1, help_text='Position among other questions of the part (use the first question number).')
    title = models.CharField(max_length=120, blank=True, default='', help_text='e.g. "Questions 11–15"')
    instructions = models.TextField(blank=True, default='', help_text='e.g. "Complete the flow-chart below. Write ONE WORD ONLY for each answer."')
    content = models.TextField(help_text='HTML with gaps written as [[11]], [[12]] … See content/BLOCKS.md for ready-made layouts.')
    word_bank = models.TextField(blank=True, default='', help_text='Optional. One option per line, starting with its letter: "A  sunlight". Gaps then become drag-and-drop boxes.')
    answer_key = models.TextField(help_text='One line per gap: "11 = sun" (alternatives: "12 = oil / olive oil").')

    class Meta:
        db_table = 'mock_question_groups'
        ordering = ['mock', 'section', 'part', 'order']
        verbose_name = 'Question block'
        verbose_name_plural = 'Question blocks'

    def __str__(self):
        nums = self.gap_numbers()
        rng = f'Q{nums[0]}–{nums[-1]}' if nums else 'no gaps'
        return f'{self.mock} · {self.section} {self.part} · {rng}'

    # ── parsing ─────────────────────────────────────────────────────────
    def gap_numbers(self) -> list[int]:
        return sorted({int(n) for n in GAP_RE.findall(self.content or '')})

    def bank_options(self) -> list[str]:
        return [l.strip() for l in (self.word_bank or '').splitlines() if l.strip()]

    def parsed_answers(self) -> dict[int, str]:
        out = {}
        for line in (self.answer_key or '').splitlines():
            if not line.strip():
                continue
            m = re.match(r'^\s*(\d+)\s*[=:.)\-]\s*(.+?)\s*$', line)
            if not m:
                raise ValidationError({'answer_key': f'Cannot read this line: "{line.strip()}". Use "11 = answer".'})
            alts = [a.strip() for a in re.split(r'\s*/\s*', m.group(2)) if a.strip()]
            out[int(m.group(1))] = ','.join(alts)
        return out

    def clean(self):
        gaps = self.gap_numbers()
        if not gaps:
            raise ValidationError({'content': 'No gaps found. Write each gap as [[N]], e.g. [[11]].'})
        answers = self.parsed_answers()
        missing = [n for n in gaps if n not in answers]
        extra = [n for n in answers if n not in gaps]
        if missing:
            raise ValidationError({'answer_key': f'No answer for question(s) {missing}.'})
        if extra:
            raise ValidationError({'answer_key': f'Answers given for {extra}, but there is no [[N]] gap for them in the content.'})
        if self.bank_options():
            letters = {o.split()[0].strip('.)').upper() for o in self.bank_options()}
            bad = [n for n, a in answers.items() if not set(x.upper() for x in a.split(',')) & letters]
            if bad:
                raise ValidationError({'answer_key': f'With a word bank the answers must be bank letters — check question(s) {bad}.'})

    def sync_questions(self):
        """Create/update one scoring row per gap; remove rows for gaps that no longer exist."""
        answers = self.parsed_answers()
        qtype = MockQuestion.QuestionType.DRAG_DROP if self.bank_options() else MockQuestion.QuestionType.FORM_COMPLETION
        keep = []
        for n in self.gap_numbers():
            q, _ = MockQuestion.objects.update_or_create(
                mock=self.mock, section=self.section, order_number=n,
                defaults=dict(group=self, part=self.part, question_type=qtype,
                              question_text=f'Question {n}', correct_answer=answers.get(n, ''),
                              options=self.bank_options(), question_group=''),
            )
            keep.append(q.id)
        self.questions.exclude(id__in=keep).delete()


class MockAttempt(models.Model):
    """One sitting per student per mock. POST /api/mock/<id>/retake/ deletes it to start over."""
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
