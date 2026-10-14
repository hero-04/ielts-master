from django.urls import path
from .views import VocabularyWordListView, DailyReviewWordsView, ReviewWordSubmitView, VocabularyBookListView

app_name = 'vocabulary'

urlpatterns = [
    path('books/', VocabularyBookListView.as_view(), name='book-list'),
    path('words/', VocabularyWordListView.as_view(), name='word-list'),
    path('daily/', DailyReviewWordsView.as_view(), name='daily-review'),
    path('review/', ReviewWordSubmitView.as_view(), name='review-submit'),
]
