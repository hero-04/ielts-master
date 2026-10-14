from django.db.models import Count
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import SpeakingTest
from .serializers import SpeakingTestListSerializer, SpeakingTestDetailSerializer


class SpeakingTestListView(generics.ListAPIView):
    queryset = SpeakingTest.objects.all()
    serializer_class = SpeakingTestListSerializer
    permission_classes = [AllowAny]


class SpeakingTestDetailView(generics.RetrieveAPIView):
    queryset = SpeakingTest.objects.prefetch_related('questions')
    serializer_class = SpeakingTestDetailSerializer
    permission_classes = [AllowAny]


class SpeakingBookListView(APIView):
    """
    GET /api/speaking/books/
    Public. Distinct book numbers that have content, with counts — drives the module menu.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        qs = SpeakingTest.objects.all()
        rows = (
            qs.values('book_number')
            .annotate(count=Count('id'))
            .order_by('book_number')
        )
        return Response([{'book_number': r['book_number'], 'count': r['count']} for r in rows])
