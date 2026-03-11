import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email    = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@camebuy.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin1234')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser {username} créé.')
else:
    print(f'Superuser {username} existe déjà.')