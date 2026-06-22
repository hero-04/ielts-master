from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth endpoints: /api/auth/register/, /api/auth/login/, etc.
    path('api/auth/', include('users.urls', namespace='users')),

    # Reading endpoints
    path('api/reading/', include('reading.urls', namespace='reading')),

    # Listening endpoints
    path('api/listening/', include('listening.urls', namespace='listening')),

    # Vocabulary endpoints
    path('api/vocabulary/', include('vocabulary.urls', namespace='vocabulary')),

    # Writing endpoints
    path('api/writing/', include('writing.urls', namespace='writing')),

    # Speaking endpoints
    path('api/speaking/', include('speaking.urls', namespace='speaking')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
