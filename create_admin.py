import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from users.models import User
if not User.objects.filter(email='admin@ielts.com').exists():
    User.objects.create_superuser(email='admin@ielts.com', password='Admin1234!', full_name='Admin')
    print('Superuser created!')
else:
    print('Superuser already exists.')
