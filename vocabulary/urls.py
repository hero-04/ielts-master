from django.urls import path
from .views import VocabularyWordListView, DailyReviewWordsView, ReviewWordSubmitView

app_name = 'vocabulary'

urlpatterns = [
    path('words/', VocabularyWordListView.as_view(), name='word-list'),
    path('daily/', DailyReviewWordsView.as_view(), name='daily-review'),
    path('review/', ReviewWordSubmitView.as_view(), name='review-submit'),
]
