from rest_framework import serializers

import re

from .models import Mock, MockAttempt, MockAnswer, MockQuestion, MockQuestionGroup


class MockQuestionSerializer(serializers.ModelSerializer):
    """Question as shown during the exam — no correct answer leaves the server.
    Also exposes `passage` (reading: "A"/"B"/"C") and `section` (listening: 1-4) so the
    shared practice exam components can group questions exactly as they do for book tests."""
    passage = serializers.SerializerMethodField()
    section = serializers.SerializerMethodField()

    class Meta:
        model = MockQuestion
        fields = ['id', 'group', 'part', 'passage', 'section', 'question_type', 'question_text', 'options', 'question_group', 'order_number']

    def get_passage(self, obj):
        return obj.part if obj.section == MockQuestion.Section.READING else None

    def get_section(self, obj):
        return int(obj.part) if obj.section == MockQuestion.Section.LISTENING and obj.part.isdigit() else None


_SCRIPT_RE = re.compile(r'<\s*(script|iframe|object|embed)[^>]*>.*?<\s*/\s*\1\s*>', re.I | re.S)
_ON_ATTR_RE = re.compile(r"""\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)""", re.I)


def safe_html(html: str) -> str:
    """Blocks are written by admins, but strip anything executable anyway."""
    html = _SCRIPT_RE.sub('', html or '')
    html = _ON_ATTR_RE.sub('', html)
    return re.sub(r'javascript:', '', html, flags=re.I)


class MockGroupSerializer(serializers.ModelSerializer):
    """A question block as shown in the exam — the answer key never leaves the server."""
    content = serializers.SerializerMethodField()
    word_bank = serializers.SerializerMethodField()
    passage = serializers.SerializerMethodField()
    section_number = serializers.SerializerMethodField()

    class Meta:
        model = MockQuestionGroup
        fields = ['id', 'part', 'passage', 'section_number', 'order', 'title', 'instructions', 'content', 'word_bank']

    def get_content(self, obj):
        return safe_html(obj.content)

    def get_word_bank(self, obj):
        return obj.bank_options()

    def get_passage(self, obj):
        return obj.part if obj.section == 'reading' else None

    def get_section_number(self, obj):
        return int(obj.part) if obj.section == 'listening' and obj.part.isdigit() else None


class AnswerInSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    user_answer = serializers.CharField(allow_blank=True, trim_whitespace=False)


class ObjectiveSubmitSerializer(serializers.Serializer):
    answers = AnswerInSerializer(many=True)


class WritingSubmitSerializer(serializers.Serializer):
    task1 = serializers.CharField(allow_blank=True, trim_whitespace=False)
    task2 = serializers.CharField(allow_blank=True, trim_whitespace=False)


def attempt_status(attempt: MockAttempt | None, mock: Mock) -> dict:
    order = mock.section_order()
    if attempt is None:
        return {
            'started': False, 'completed': False, 'sections': order,
            'done': [], 'in_progress': None, 'next': order[0] if order else None,
        }
    done = [s for s in order if attempt.section_done(s)]
    completed = attempt.completed_at is not None
    in_progress = next((s for s in order if attempt.section_started(s) and not attempt.section_done(s)), None)
    return {
        'started': True,
        'completed': attempt.completed_at is not None,
        'sections': order,
        'done': done,
        'in_progress': in_progress,
        'next': attempt.next_section(),
        'scores': ({
            'listening': float(attempt.listening_band) if 'listening' in order else None,
            'reading': float(attempt.reading_band) if 'reading' in order else None,
            'writing': float(attempt.writing_band) if attempt.writing_band is not None else None,
            'overall': overall_estimate(attempt),
        } if completed else None),
    }


def overall_estimate(attempt: MockAttempt):
    """Average of the objective bands (plus writing if a teacher marked it), rounded to the nearest 0.5."""
    bands = []
    if attempt.mock.has_listening:
        bands.append(float(attempt.listening_band))
    if attempt.mock.has_reading:
        bands.append(float(attempt.reading_band))
    if attempt.writing_band is not None:
        bands.append(float(attempt.writing_band))
    if not bands:
        return None
    return round(sum(bands) / len(bands) * 2) / 2


class MockListSerializer(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()
    my_status = serializers.SerializerMethodField()

    class Meta:
        model = Mock
        fields = ['id', 'number', 'title', 'sections', 'my_status']

    def get_sections(self, obj):
        return obj.section_order()

    def get_my_status(self, obj):
        attempts = self.context.get('attempts', {})
        return attempt_status(attempts.get(obj.id), obj)


class MockAnswerResultSerializer(serializers.ModelSerializer):
    order_number = serializers.IntegerField(source='question.order_number')
    part = serializers.CharField(source='question.part')
    section = serializers.CharField(source='question.section')
    correct_answer = serializers.CharField(source='question.correct_answer')

    class Meta:
        model = MockAnswer
        fields = ['section', 'part', 'order_number', 'user_answer', 'correct_answer', 'is_correct']


class MockResultSerializer(serializers.ModelSerializer):
    mock_number = serializers.IntegerField(source='mock.number')
    answers = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    overall_estimate = serializers.SerializerMethodField()
    listening_transcript = serializers.CharField(source='mock.listening_transcript', read_only=True)

    class Meta:
        model = MockAttempt
        fields = [
            'id', 'mock_number', 'started_at', 'completed_at', 'sections',
            'listening_raw', 'listening_band', 'reading_raw', 'reading_band',
            'task1_text', 'task2_text', 'task1_words', 'task2_words', 'writing_band',
            'overall_estimate', 'listening_transcript', 'answers',
        ]

    def get_sections(self, obj):
        return obj.mock.section_order()

    def get_answers(self, obj):
        """Every question of every submitted section — unanswered ones included as blank."""
        given = {a.question_id: a for a in obj.answers.all()}
        rows = []
        for q in obj.mock.questions.all().order_by('section', 'order_number'):
            if not obj.section_done(q.section):
                continue
            a = given.get(q.id)
            rows.append({
                'section': q.section, 'part': q.part, 'order_number': q.order_number,
                'user_answer': a.user_answer if a else '',
                'correct_answer': q.correct_answer,
                'is_correct': bool(a and a.is_correct),
            })
        return rows

    def get_overall_estimate(self, obj):
        return overall_estimate(obj)
