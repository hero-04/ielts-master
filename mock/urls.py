from django.urls import path
from .views import (
    MockListView, MockDetailView, MockStartView, MockSectionView,
    MockSectionSubmitView, MockAutosaveView, MockFinishView, MockResultView, MockRetakeView,
)

app_name = 'mock'

urlpatterns = [
    path('', MockListView.as_view(), name='list'),
    path('<int:pk>/', MockDetailView.as_view(), name='detail'),
    path('<int:pk>/start/', MockStartView.as_view(), name='start'),
    path('<int:pk>/section/writing/autosave/', MockAutosaveView.as_view(), name='autosave'),
    path('<int:pk>/section/<str:section>/', MockSectionView.as_view(), name='section'),
    path('<int:pk>/section/<str:section>/submit/', MockSectionSubmitView.as_view(), name='section-submit'),
    path('<int:pk>/finish/', MockFinishView.as_view(), name='finish'),
    path('<int:pk>/result/', MockResultView.as_view(), name='result'),
    path('<int:pk>/retake/', MockRetakeView.as_view(), name='retake'),
]
