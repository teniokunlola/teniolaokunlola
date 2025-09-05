"""
Production settings for teniola_site project.
"""

from .base import *
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(BASE_DIR / ".env.production")

# -----------------------------------------------------------------------------
# SECURITY SETTINGS
# -----------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

DEBUG = False

# Hosts - Production hosts
ALLOWED_HOSTS = [
    "teniolaokunlola.com",
    "www.teniolaokunlola.com",
    "api.teniolaokunlola.com",
    "admin.teniolaokunlola.com",
    os.getenv("SERVER_IP", "")
]

# SSL settings - enabled for production
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True").lower() == "true"

# HSTS
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv("SECURE_HSTS_INCLUDE_SUBDOMAINS", "True").lower() == "true"
SECURE_HSTS_PRELOAD = os.getenv("SECURE_HSTS_PRELOAD", "True").lower() == "true"

# Cookie security
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "True").lower() == "true"
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "True").lower() == "true"

# Security headers
SECURE_BROWSER_XSS_FILTER = os.getenv("SECURE_BROWSER_XSS_FILTER", "True").lower() == "true"
SECURE_CONTENT_TYPE_NOSNIFF = os.getenv("SECURE_CONTENT_TYPE_NOSNIFF", "True").lower() == "true"

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [
    origin.strip() for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if origin.strip()
] or [
    "https://teniolaokunlola.com",
    "https://www.teniolaokunlola.com",
    "https://api.teniolaokunlola.com",
    "https://admin.teniolaokunlola.com",
]

# -----------------------------------------------------------------------------
# DATABASES
# -----------------------------------------------------------------------------
if all([
    os.getenv("SUPABASE_DB_HOST"),
    os.getenv("SUPABASE_DB_NAME"),
    os.getenv("SUPABASE_DB_PASSWORD")
]):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("SUPABASE_DB_NAME"),
            "USER": os.getenv("SUPABASE_DB_USER", "postgres"),
            "PASSWORD": os.getenv("SUPABASE_DB_PASSWORD"),
            "HOST": os.getenv("SUPABASE_DB_HOST"),
            "PORT": int(os.getenv("SUPABASE_DB_PORT", "5432")),
            "OPTIONS": {"sslmode": "require"},
        }
    }
else:
    # Fallback to SQLite if Supabase credentials are not provided
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# -----------------------------------------------------------------------------
# CORS CONFIG
# -----------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if origin.strip()
] or [
    "https://teniolaokunlola.com",
    "https://www.teniolaokunlola.com",
    "https://admin.teniolaokunlola.com",
]
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# -----------------------------------------------------------------------------
# LOGGING
# -----------------------------------------------------------------------------
# Create logs directory if it doesn't exist
import os
logs_dir = BASE_DIR / "logs"
if not logs_dir.exists():
    os.makedirs(logs_dir, exist_ok=True)

# Add file handler for production
LOGGING["handlers"]["file"] = {
    "level": "INFO",
    "class": "logging.FileHandler",
    "filename": logs_dir / "django.log",
    "formatter": "verbose",
}

LOGGING["root"]["handlers"] = ["console", "file"]
LOGGING["loggers"]["django"]["handlers"] = ["console", "file"]
LOGGING["loggers"]["api"]["handlers"] = ["console", "file"]
LOGGING["handlers"]["console"]["level"] = "WARNING"
LOGGING["loggers"]["django"]["level"] = "WARNING"
LOGGING["loggers"]["api"]["level"] = "INFO"

# -----------------------------------------------------------------------------
# CACHING
# -----------------------------------------------------------------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.getenv("REDIS_URL", "redis://127.0.0.1:6379/1"),
    }
}

# -----------------------------------------------------------------------------
# SESSION CONFIGURATION
# -----------------------------------------------------------------------------
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_SAVE_EVERY_REQUEST = True
