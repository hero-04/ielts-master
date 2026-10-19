"""
Mock test flow:

  GET  /api/mock/                        list active mocks + my status
  GET  /api/mock/<id>/                   lobby data
  POST /api/mock/<id>/start/             create my (single) attempt
  GET  /api/mock/<id>/section/<name>/    section content; starts its clock
  POST /api/mock/<id>/section/<name>/submit/
  POST /api/mock/<id>/finish/            close the attempt (all sections done)
  GET  /api/mock/<id>/result/            my result

Sections unlock strictly in order: listening → reading → writing. A section that
has no content yet (e.g. no listening recording) is simply skipped.
"""
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from listening.views import calculate_listening_band
from reading.views import calculate_reading_band
from .models import Mock, MockAttempt, MockAnswer, MockQuestion
from .serializers import (
    MockListSerializer, MockQuestionSerializer, MockResultSerializer,
    ObjectiveSubmitSerializer, WritingSubmitSerializer, attempt_status,
)

# Hard server-side caps (seconds). Listening: 30-min recording + 2-min review,
# with a little slack for buffering. Reading/Writing: 60 min, no extra time.
TIME_LIMITS = {'listening': 40 * 60, 'reading': 60 * 60, 'writing': 60 * 60}
GRACE = 90  # seconds of leniency for network delay on auto-submit
REVIEW_SECONDS = 2 * 60


def _my_attempt(request, mock):
    return MockAttempt.objects.filter(user=request.user, mock=mock).first()


def _lobby_payload(mock, attempt):
    return {
        'id': mock.id,
        'number': mock.number,
        'title': mock.title,
        'sections': mock.section_order(),
        'my_status': attempt_status(attempt, mock),
    }


class MockListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        mocks = Mock.objects.filter(is_active=True)
        attempts = {a.mock_id: a for a in MockAttempt.objects.filter(user=request.user, mock__in=mocks)}
        data = MockListSerializer(mocks, many=True, context={'attempts': attempts}).data
        return Response(data)


class MockDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        mock = get_object_or_404(Mock, pk=pk, is_active=True)
        return Response(_lobby_payload(mock, _my_attempt(request, mock)))


class MockStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        mock = get_object_or_404(Mock, pk=pk, is_active=True)
        if not mock.section_order():
            return Response({'detail': 'This mock has no content yet.'}, status=status.HTTP_409_CONFLICT)
        attempt, _ = MockAttempt.objects.get_or_create(user=request.user, mock=mock)
        return Response(_lobby_payload(mock, attempt))


def _guard_section(request, pk, section):
    """Returns (mock, attempt, error_response)."""
    mock = get_object_or_404(Mock, pk=pk, is_active=True)
    order = mock.section_order()
    if section not in order:
        return mock, None, Response({'detail': 'Section not available in this mock.'}, status=404)
    attempt = _my_attempt(request, mock)
    if attempt is None:
        return mock, None, Response({'detail': 'Start the mock first.'}, status=status.HTTP_409_CONFLICT)
    if attempt.completed_at:
        return mock, attempt, Response({'detail': 'You have already completed this mock.'}, status=status.HTTP_409_CONFLICT)
    if attempt.section_done(section):
        return mock, attempt, Response({'detail': 'This section is already submitted.'}, status=status.HTTP_409_CONFLICT)
    if attempt.next_section() != section:
        return mock, attempt, Response({'detail': f'Finish the {attempt.next_section()} section first.'},
                                       status=status.HTTP_409_CONFLICT)
    return mock, attempt, None


class MockSectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, section):
        mock, attempt, err = _guard_section(request, pk, section)
        if err:
            return err
        now = timezone.now()
        if not attempt.section_started(section):
            setattr(attempt, f'{section}_started_at', now)
            attempt.save(update_fields=[f'{section}_started_at'])
        started = getattr(attempt, f'{section}_started_at')
        elapsed = int((now - started).total_seconds())
        seconds_left = max(TIME_LIMITS[section] - elapsed, 0)

        payload = {
            'mock_id': mock.id,
            'mock_number': mock.number,
            'section': section,
            'started_at': started,
            'time_limit': TIME_LIMITS[section],
            'seconds_left': seconds_left,
            'review_seconds': REVIEW_SECONDS if section == 'listening' else 0,
        }
        if section == 'listening':
            qs = mock.questions.filter(section=MockQuestion.Section.LISTENING)
            payload.update({
                'audio_url': mock.listening_audio_url,
                'questions': MockQuestionSerializer(qs, many=True).data,
            })
        elif section == 'reading':
            qs = mock.questions.filter(section=MockQuestion.Section.READING)
            payload.update({
                'passage_a_title': mock.passage_a_title, 'passage_a': mock.passage_a,
                'passage_b_title': mock.passage_b_title, 'passage_b': mock.passage_b,
                'passage_c_title': mock.passage_c_title, 'passage_c': mock.passage_c,
                'questions': MockQuestionSerializer(qs, many=True).data,
            })
        else:
            payload.update({
                'task1_prompt_text': mock.task1_prompt_text,
                'task1_prompt_image': mock.task1_prompt_image,
                'task2_prompt_text': mock.task2_prompt_text,
                'task1_text': attempt.task1_text,
                'task2_text': attempt.task2_text,
            })
        return Response(payload)


class MockSectionSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk, section):
        mock, attempt, err = _guard_section(request, pk, section)
        if err:
            return err
        if not attempt.section_started(section):
            return Response({'detail': 'Open the section before submitting it.'}, status=status.HTTP_409_CONFLICT)
        now = timezone.now()
        elapsed = (now - getattr(attempt, f'{section}_started_at')).total_seconds()
        if elapsed > TIME_LIMITS[section] + GRACE:
            # Time is over: whatever was saved counts; late answers are ignored.
            request_data = {'answers': []} if section != 'writing' else {'task1': attempt.task1_text, 'task2': attempt.task2_text}
        else:
            request_data = request.data

        if section == 'writing':
            ser = WritingSubmitSerializer(data=request_data)
            ser.is_valid(raise_exception=True)
            attempt.task1_text = ser.validated_data['task1']
            attempt.task2_text = ser.validated_data['task2']
            attempt.writing_completed_at = now
            attempt.save()
        else:
            ser = ObjectiveSubmitSerializer(data=request_data)
            ser.is_valid(raise_exception=True)
            questions = {q.id: q for q in mock.questions.filter(section=section)}
            raw = 0
            rows = []
            for ans in ser.validated_data['answers']:
                q = questions.get(ans['question_id'])
                if not q:
                    continue
                user_ans = ans['user_answer'].strip().lower()
                accepted = [c.strip().lower() for c in q.correct_answer.split(',')]
                if q.question_type == 'multiple_choice_multiple':
                    # "B,D" — order-independent comparison
                    ok = sorted(a.strip() for a in user_ans.split(',') if a.strip()) == sorted(accepted)
                else:
                    ok = bool(user_ans) and user_ans in accepted
                raw += int(ok)
                rows.append(MockAnswer(attempt=attempt, question=q, user_answer=ans['user_answer'][:255], is_correct=ok))
            MockAnswer.objects.filter(attempt=attempt, question__section=section).delete()
            MockAnswer.objects.bulk_create(rows)
            band = calculate_listening_band(raw) if section == 'listening' else calculate_reading_band(raw)
            setattr(attempt, f'{section}_raw', raw)
            setattr(attempt, f'{section}_band', band)
            setattr(attempt, f'{section}_completed_at', now)
            attempt.save()

        # Auto-close when the last section is in.
        if attempt.next_section() is None and attempt.completed_at is None:
            attempt.completed_at = now
            attempt.save(update_fields=['completed_at'])
        return Response(_lobby_payload(mock, attempt))


class MockAutosaveView(APIView):
    """POST /api/mock/<id>/section/writing/autosave/ — keep essay drafts on the server
    so a browser crash does not lose them."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        mock, attempt, err = _guard_section(request, pk, 'writing')
        if err:
            return err
        ser = WritingSubmitSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        attempt.task1_text = ser.validated_data['task1']
        attempt.task2_text = ser.validated_data['task2']
        attempt.save()
        return Response({'saved': True, 'task1_words': attempt.task1_words, 'task2_words': attempt.task2_words})


class MockFinishView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        mock = get_object_or_404(Mock, pk=pk, is_active=True)
        attempt = _my_attempt(request, mock)
        if attempt is None:
            return Response({'detail': 'Start the mock first.'}, status=status.HTTP_409_CONFLICT)
        if attempt.next_section() is not None:
            return Response({'detail': f'The {attempt.next_section()} section is not finished yet.'},
                            status=status.HTTP_409_CONFLICT)
        if attempt.completed_at is None:
            attempt.completed_at = timezone.now()
            attempt.save(update_fields=['completed_at'])
        return Response(_lobby_payload(mock, attempt))


class MockResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        mock = get_object_or_404(Mock, pk=pk)
        attempt = _my_attempt(request, mock)
        if attempt is None or attempt.completed_at is None:
            return Response({'detail': 'No completed attempt for this mock.'}, status=404)
        return Response(MockResultSerializer(attempt).data)
