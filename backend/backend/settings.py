import os
from pathlib import Path
from datetime import timedelta
import dj_database_url




BASE_DIR = Path(__file__).resolve().parent.parent

# --- SÉCURITÉ ---
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-default-change-me')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Gestion des hôtes (Local + Production)
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# --- APPLICATIONS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'products',
    'corsheaders',
    'django_filters',
    'cloudinary',
    'cloudinary_storage',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# --- TEMPLATES (Indispensable pour l'admin) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# --- BASE DE DONNÉES ---
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL_LOCAL'),
        conn_max_age=600
    )
}

# --- REST FRAMEWORK & JWT ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=90),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# --- CORS ---
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS_ALLOW_ALL_ORIGINS = True

# --- FICHIERS STATIQUES & MEDIA ---
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# --- SERVICES TIERS (MTO & EMAIL) ---
MTN_API_USER = os.environ.get('MTN_API_USER')
MTN_API_KEY = os.environ.get('MTN_API_KEY')
MTN_SUBSCRIPTION_KEY = os.environ.get('MTN_SUBSCRIPTION_KEY')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')
DEFAULT_FROM_EMAIL = f"CAMEBUY <{os.environ.get('EMAIL_USER', '')}>"

# --- INTERNATIONALISATION ---
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'