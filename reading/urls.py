from django.urls import path
from .views import (
    ReadingTestListView,
    ReadingTestDetailView,
    ReadingTestSubmitView,
    ReadingAttemptResultView
)

app_name = 'reading'

urlpatterns = [
    path('tests/', ReadingTestListView.as_view(), name='test-list'),
    path('tests/<int:pk>/', ReadingTestDetailView.as_view(), name='test-detail'),
    path('tests/<int:pk>/submit/', ReadingTestSubmitView.as_view(), name='test-submit'),
    path('attempts/<int:pk>/', ReadingAttemptResultView.as_view(), name='attempt-detail'),
]
