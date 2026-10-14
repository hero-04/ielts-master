from django.db.models import Count
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import WritingPrompt, WritingSubmission
from .serializers import (
    WritingPromptListSerializer,
    WritingPromptDetailSerializer,
    WritingSubmissionSerializer,
)


class WritingPromptListView(generics.ListAPIView):
    serializer_class = WritingPromptListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = WritingPrompt.objects.all()
        book_number = self.request.query_params.get('book_number')
        task_type = self.request.query_params.get('task_type')
        if book_number:
            qs = qs.filter(book_number=book_number)
        if task_type:
            qs = qs.filter(task_type=task_type)
        return qs


class WritingPromptDetailView(generics.RetrieveAPIView):
    queryset = WritingPrompt.objects.all()
    serializer_class = WritingPromptDetailSerializer
    permission_classes = [AllowAny]


class WritingSubmissionListCreateView(generics.ListCreateAPIView):
    serializer_class = WritingSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WritingSubmission.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WritingSubmissionDetailView(generics.RetrieveAPIView):
    serializer_class = WritingSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WritingSubmission.objects.filter(user=self.request.user)


class WritingBookListView(APIView):
    """
    GET /api/writing/books/?task_type=task_1
    Public. Distinct book numbers that have content, with counts — drives the module menu.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        qs = WritingPrompt.objects.all()
        task_type = request.query_params.get('task_type')
        if task_type:
            qs = qs.filter(task_type=task_type)
        rows = (
            qs.values('book_number')
            .annotate(count=Count('id'))
            .order_by('book_number')
        )
        return Response([{'book_number': r['book_number'], 'count': r['count']} for r in rows])
