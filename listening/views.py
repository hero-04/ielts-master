from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import ListeningTest, ListeningQuestion, ListeningAttempt, ListeningAnswer
from .serializers import (
    ListeningTestListSerializer,
    ListeningTestDetailSerializer,
    ListeningAttemptSubmitSerializer,
    ListeningAttemptResultSerializer
)

def calculate_listening_band(raw_score: int) -> float:
    """
    Calculates IELTS Listening band score from raw score (0-40).
    Slightly different from Academic Reading.
    """
    if raw_score >= 39: return 9.0
    if raw_score >= 37: return 8.5
    if raw_score >= 35: return 8.0
    if raw_score >= 32: return 7.5
    if raw_score >= 30: return 7.0
    if raw_score >= 26: return 6.5
    if raw_score >= 23: return 6.0
    if raw_score >= 18: return 5.5
    if raw_score >= 16: return 5.0
    if raw_score >= 13: return 4.5
    if raw_score >= 11: return 4.0
    if raw_score >= 8: return 3.5
    if raw_score >= 6: return 3.0
    if raw_score >= 4: return 2.5
    if raw_score >= 2: return 2.0
    if raw_score == 1: return 1.0
    return 0.0

class ListeningTestListView(generics.ListAPIView):
    """
    GET /api/listening/tests/
    Public access.
    """
    queryset = ListeningTest.objects.all()
    serializer_class = ListeningTestListSerializer
    permission_classes = [permissions.AllowAny]

class ListeningTestDetailView(generics.RetrieveAPIView):
    """
    GET /api/listening/tests/<id>/
    Public access.
    """
    queryset = ListeningTest.objects.all()
    serializer_class = ListeningTestDetailSerializer
    permission_classes = [permissions.AllowAny]

class ListeningTestSubmitView(APIView):
    """
    POST /api/listening/tests/<id>/submit/
    Auth required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        test = get_object_or_404(ListeningTest, pk=pk)
        
        serializer = ListeningAttemptSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        submitted_answers = serializer.validated_data['answers']
        
        attempt = ListeningAttempt.objects.create(
            user=request.user,
            test=test,
            completed_at=timezone.now()
        )
        
        raw_score = 0
        answer_objects = []
        
        questions_dict = {q.id: q for q in test.questions.all()}
        
        for ans in submitted_answers:
            q_id = ans['question_id']
            if q_id in questions_dict:
                question = questions_dict[q_id]
                user_ans = ans['user_answer'].strip().lower()
                correct_ans_list = [c.strip().lower() for c in question.correct_answer.split(',')]
                
                is_correct = user_ans in correct_ans_list
                if is_correct:
                    raw_score += 1
                    
                answer_objects.append(
                    ListeningAnswer(
                        attempt=attempt,
                        question=question,
                        user_answer=ans['user_answer'],
                        is_correct=is_correct
                    )
                )
        
        ListeningAnswer.objects.bulk_create(answer_objects)
        
        attempt.raw_score = raw_score
        attempt.band_score = calculate_listening_band(raw_score)
        attempt.save()
        
        return Response({
            'detail': 'Answers submitted successfully.',
            'attempt_id': attempt.id,
            'band_score': attempt.band_score,
            'raw_score': attempt.raw_score
        }, status=status.HTTP_201_CREATED)

class ListeningAttemptResultView(generics.RetrieveAPIView):
    """
    GET /api/listening/attempts/<id>/
    Auth required, returns results for the current user.
    """
    queryset = ListeningAttempt.objects.all()
    serializer_class = ListeningAttemptResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
