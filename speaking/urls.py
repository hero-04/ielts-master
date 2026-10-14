from django.urls import path
from . import views

app_name = 'speaking'

urlpatterns = [
    path('books/', views.SpeakingBookListView.as_view(), name='book-list'),
    path('tests/', views.SpeakingTestListView.as_view(), name='test-list'),
    path('tests/<int:pk>/', views.SpeakingTestDetailView.as_view(), name='test-detail'),
]
