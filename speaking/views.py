from rest_framework import generics
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
