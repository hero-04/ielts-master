from django.urls import path
from . import views

app_name = 'writing'

urlpatterns = [
    path('prompts/', views.WritingPromptListView.as_view(), name='prompt-list'),
    path('prompts/<int:pk>/', views.WritingPromptDetailView.as_view(), name='prompt-detail'),
    path('submissions/', views.WritingSubmissionListCreateView.as_view(), name='submission-list-create'),
    path('submissions/<int:pk>/', views.WritingSubmissionDetailView.as_view(), name='submission-detail'),
]
