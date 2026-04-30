from django.urls import path
from .views import (
    LoginView,
    TokenRefreshViewCustom,
    LogoutView,
    RegisterView,
    MeView,
    ChangePasswordView,
)

app_name = 'users'

urlpatterns = [
    # Registration & login
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    # Token management
    path('token/refresh/', TokenRefreshViewCustom.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Authenticated user
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
