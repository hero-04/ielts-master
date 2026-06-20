from rest_framework import generics
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
        cambridge_book = self.request.query_params.get('cambridge_book')
        task_type = self.request.query_params.get('task_type')
        if cambridge_book:
            qs = qs.filter(cambridge_book=cambridge_book)
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
