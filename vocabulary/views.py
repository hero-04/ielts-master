from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import VocabularyWord, UserWordProgress
from .serializers import VocabularyWordSerializer, UserWordProgressSerializer, ReviewWordSerializer

def calculate_next_review(status: str, review_count: int) -> timezone.datetime.date:
    """
    Spaced repetition logic calculating the next review date.
    Intervals: 1, 3, 7, 14, 30 days based on how many times it was reviewed.
    """
    if status == UserWordProgress.Status.LEARNING:
        # If still learning, review again tomorrow.
        return timezone.now().date() + timedelta(days=1)
    
    # If known, increase interval based on review_count
    intervals = [1, 3, 7, 14, 30]
    # Bound the index to the maximum interval available
    idx = min(review_count, len(intervals) - 1)
    days_to_add = intervals[idx]
    
    return timezone.now().date() + timedelta(days=days_to_add)

class VocabularyWordListView(generics.ListAPIView):
    """
    GET /api/vocabulary/words/
    Publicly accessible. Can be filtered by topic.
    """
    queryset = VocabularyWord.objects.all()
    serializer_class = VocabularyWordSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['topic', 'difficulty']

class DailyReviewWordsView(generics.ListAPIView):
    """
    GET /api/vocabulary/daily/
    Auth required. Returns words the user needs to review today.
    """
    serializer_class = UserWordProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        today = timezone.now().date()
        # Get all words due for review today or earlier
        return UserWordProgress.objects.filter(
            user=self.request.user,
            next_review_date__lte=today
        ).select_related('word')

class ReviewWordSubmitView(APIView):
    """
    POST /api/vocabulary/review/
    Auth required. Mark a word as 'known' or 'learning'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ReviewWordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        word_id = serializer.validated_data['word_id']
        action = serializer.validated_data['action']
        
        word = get_object_or_404(VocabularyWord, id=word_id)
        
        # Get or create progress tracking for this word and user
        progress, created = UserWordProgress.objects.get_or_create(
            user=request.user,
            word=word,
            defaults={'status': UserWordProgress.Status.NEW}
        )
        
        # Update logic based on spaced repetition
        if action == 'known':
            progress.status = UserWordProgress.Status.KNOWN
            progress.next_review_date = calculate_next_review(progress.status, progress.review_count)
            progress.review_count += 1
        elif action == 'learning':
            progress.status = UserWordProgress.Status.LEARNING
            # Reset review count if they forgot it, or just keep it low
            progress.review_count = max(0, progress.review_count - 1) 
            progress.next_review_date = calculate_next_review(progress.status, progress.review_count)
            
        progress.save()
        
        return Response({
            'detail': f'Word marked as {action}',
            'next_review_date': progress.next_review_date,
            'review_count': progress.review_count
        }, status=status.HTTP_200_OK)
