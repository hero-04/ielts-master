from django.urls import path
from . import views

app_name = 'speaking'

urlpatterns = [
    path('tests/', views.SpeakingTestListView.as_view(), name='test-list'),
    path('tests/<int:pk>/', views.SpeakingTestDetailView.as_view(), name='test-detail'),
]
