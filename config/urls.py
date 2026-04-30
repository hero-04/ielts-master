from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth endpoints: /api/auth/register/, /api/auth/login/, etc.
    path('api/auth/', include('users.urls', namespace='users')),
    
    # Reading endpoints
    path('api/reading/', include('reading.urls', namespace='reading')),
]
