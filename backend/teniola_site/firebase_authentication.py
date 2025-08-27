# teniola_site/firebase_authentication.py
# This file defines a custom authentication class for Django REST Framework
# that uses Firebase ID tokens to authenticate users.

import firebase_admin
from firebase_admin import auth, credentials
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
from django.conf import settings


# Initialize Firebase Admin SDK
# We do this once to avoid re-initializing it on every request.
# The service account key path must be defined in settings.py.
if not firebase_admin._apps:
    # This checks if the setting exists before trying to use it.
    if hasattr(settings, 'FIREBASE_SERVICE_ACCOUNT_KEY_PATH'):
        try:
            cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            # Handle potential errors with the service account key.
            print(f"Firebase initialization error: {e}")
            raise AuthenticationFailed("Firebase service account could not be initialized.")
    else:
        # Raise an error if the setting is missing, which is the root cause
        # of the 'AttributeError' you were seeing before.
        raise AuthenticationFailed("FIREBASE_SERVICE_ACCOUNT_KEY_PATH not defined in settings.py")


class FirebaseUser:
    """
    A custom user class that mimics Django's User model interface
    for Firebase authentication.
    """
    def __init__(self, uid, email=None, display_name=None):
        self.uid = uid
        self.email = email
        self.display_name = display_name
        self.is_authenticated = True
        self.is_anonymous = False
        self.pk = uid  # Use UID as primary key
    
    def __str__(self):
        return self.email or self.uid


class FirebaseAuthentication(BaseAuthentication):
    """
    A custom authentication class for Django REST Framework that authenticates
    users using a Firebase ID token sent in the 'Authorization' header.
    """

    def authenticate(self, request):
        """
        Authenticates the user based on the Firebase ID token.
        Returns a tuple of (user, auth) on success, otherwise None.
        """
        # Get the authorization header from the request
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        print(f"DEBUG: Auth header received: {auth_header}")
        print(f"DEBUG: Request META keys: {list(request.META.keys())}")

        if not auth_header:
            print("DEBUG: No authorization header found")
            return None

        # Split the header to get the token part.
        # It should be in the format 'Bearer <token>'.
        try:
            token_type, id_token = auth_header.split(' ')
            print(f"DEBUG: Token type: {token_type}, Token length: {len(id_token) if id_token else 0}")
            if token_type.lower() != 'bearer':
                print("DEBUG: Invalid token type, expected 'Bearer'")
                return None
        except ValueError:
            print("DEBUG: Failed to split authorization header")
            return None

        # Verify the Firebase ID token and get the user's data.
        try:
            print("DEBUG: Attempting to verify Firebase ID token...")
            decoded_token = auth.verify_id_token(id_token, check_revoked=False)
        except Exception as e:
            # Handle minor clock skew by retrying once if token is used too early
            message = str(e)
            print(f"DEBUG: Firebase token verification failed: {message}")
            if 'Token used too early' in message:
                import time
                print("DEBUG: Detected 'Token used too early'. Retrying verification after 2 seconds...")
                time.sleep(2)
                try:
                    decoded_token = auth.verify_id_token(id_token, check_revoked=False)
                except Exception as e2:
                    print(f"DEBUG: Retry verification failed: {str(e2)}")
                    raise AuthenticationFailed(f'Invalid Firebase ID token: {str(e2)}')
            else:
                # Propagate other verification errors
                raise AuthenticationFailed(f'Invalid Firebase ID token: {message}')

        uid = decoded_token['uid']
        email = decoded_token.get('email')
        display_name = decoded_token.get('name', '')

        print(f"DEBUG: Token verified successfully. UID: {uid}, Email: {email}")

        # Create a FirebaseUser object that mimics Django's User interface
        user = FirebaseUser(uid=uid, email=email, display_name=display_name)
        
        # Return the user object and the decoded token
        return (user, decoded_token)
