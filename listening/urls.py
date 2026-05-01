from django.urls import path
from .views import (
    ListeningTestListView,
    ListeningTestDetailView,
    ListeningTestSubmitView,
    ListeningAttemptResultView
)

app_name = 'listening'

urlpatterns = [
    path('tests/', ListeningTestListView.as_view(), name='test-list'),
    path('tests/<int:pk>/', ListeningTestDetailView.as_view(), name='test-detail'),
    path('tests/<int:pk>/submit/', ListeningTestSubmitView.as_view(), name='test-submit'),
    path('attempts/<int:pk>/', ListeningAttemptResultView.as_view(), name='attempt-detail'),
]
