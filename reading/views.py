from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import ReadingTest, ReadingQuestion, ReadingAttempt, ReadingAnswer
from .serializers import (
    ReadingTestListSerializer,
    ReadingTestDetailSerializer,
    ReadingAttemptSubmitSerializer,
    ReadingAttemptResultSerializer
)

def calculate_reading_band(raw_score: int) -> float:
    """
    Calculates IELTS Academic Reading band score from raw score (0-40).
    Based on standard IELTS scoring tables.
    """
    if raw_score >= 39: return 9.0
    if raw_score >= 37: return 8.5
    if raw_score >= 35: return 8.0
    if raw_score >= 33: return 7.5
    if raw_score >= 30: return 7.0
    if raw_score >= 27: return 6.5
    if raw_score >= 23: return 6.0
    if raw_score >= 19: return 5.5
    if raw_score >= 15: return 5.0
    if raw_score >= 13: return 4.5
    if raw_score >= 10: return 4.0
    if raw_score >= 8: return 3.5
    if raw_score >= 6: return 3.0
    if raw_score >= 4: return 2.5
    if raw_score >= 2: return 2.0
    if raw_score == 1: return 1.0
    return 0.0

class ReadingTestListView(generics.ListAPIView):
    """
    GET /api/reading/tests/
    List all available reading tests.
    """
    queryset = ReadingTest.objects.all()
    serializer_class = ReadingTestListSerializer
    permission_classes = [permissions.AllowAny]

class ReadingTestDetailView(generics.RetrieveAPIView):
    """
    GET /api/reading/tests/<id>/
    Get a specific reading test with all passages and questions.
    Also creates a ReadingAttempt to track when the user started.
    """
    queryset = ReadingTest.objects.all()
    serializer_class = ReadingTestDetailSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Optionally, create an attempt here to track start time if it doesn't exist
        # We'll just return the test data, and let submission handle completion.
        return Response(serializer.data)

class ReadingTestSubmitView(APIView):
    """
    POST /api/reading/tests/<id>/submit/
    Submit answers for a reading test and calculate the score.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        test = get_object_or_404(ReadingTest, pk=pk)
        
        serializer = ReadingAttemptSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        submitted_answers = serializer.validated_data['answers']
        
        # Create the attempt
        attempt = ReadingAttempt.objects.create(
            user=request.user,
            test=test,
            completed_at=timezone.now()
        )
        
        raw_score = 0
        answer_objects = []
        
        # Get all questions for this test to verify answers
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
                    ReadingAnswer(
                        attempt=attempt,
                        question=question,
                        user_answer=ans['user_answer'],
                        is_correct=is_correct
                    )
                )
        
        # Bulk create answers
        ReadingAnswer.objects.bulk_create(answer_objects)
        
        # Update attempt scores
        attempt.raw_score = raw_score
        attempt.band_score = calculate_reading_band(raw_score)
        attempt.save()
        
        return Response({
            'detail': 'Answers submitted successfully.',
            'attempt_id': attempt.id
        }, status=status.HTTP_201_CREATED)

class ReadingAttemptResultView(generics.RetrieveAPIView):
    """
    GET /api/reading/attempts/<id>/
    Get the detailed results of a specific reading attempt.
    """
    queryset = ReadingAttempt.objects.all()
    serializer_class = ReadingAttemptResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own results
        return self.queryset.filter(user=self.request.user)
