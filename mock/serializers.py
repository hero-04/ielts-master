from rest_framework import serializers

from .models import Mock, MockAttempt, MockAnswer, MockQuestion


class MockQuestionSerializer(serializers.ModelSerializer):
    """Question as shown during the exam — no correct answer leaves the server."""
    class Meta:
        model = MockQuestion
        fields = ['id', 'part', 'question_type', 'question_text', 'options', 'question_group', 'order_number']


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
    in_progress = next((s for s in order if attempt.section_started(s) and not attempt.section_done(s)), None)
    return {
        'started': True,
        'completed': attempt.completed_at is not None,
        'sections': order,
        'done': done,
        'in_progress': in_progress,
        'next': attempt.next_section(),
    }


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
    answers = MockAnswerResultSerializer(many=True, read_only=True)
    sections = serializers.SerializerMethodField()
    overall_estimate = serializers.SerializerMethodField()

    class Meta:
        model = MockAttempt
        fields = [
            'id', 'mock_number', 'started_at', 'completed_at', 'sections',
            'listening_raw', 'listening_band', 'reading_raw', 'reading_band',
            'task1_text', 'task2_text', 'task1_words', 'task2_words', 'writing_band',
            'overall_estimate', 'answers',
        ]

    def get_sections(self, obj):
        return obj.mock.section_order()

    def get_overall_estimate(self, obj):
        """Average of the objective bands (plus writing if a teacher marked it), rounded to the nearest 0.5."""
        bands = []
        if obj.mock.has_listening:
            bands.append(float(obj.listening_band))
        if obj.mock.has_reading:
            bands.append(float(obj.reading_band))
        if obj.writing_band is not None:
            bands.append(float(obj.writing_band))
        if not bands:
            return None
        avg = sum(bands) / len(bands)
        return round(avg * 2) / 2
