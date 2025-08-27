from django.apps import AppConfig


class TeniolaSiteConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'teniola_site'
    
    def ready(self):
        # Initialize Firebase when Django is ready
        try:
            from core.firebase_authentication import initialize_firebase
            initialize_firebase()
        except Exception as e:
            # Log error but don't crash the app
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to initialize Firebase: {e}")
