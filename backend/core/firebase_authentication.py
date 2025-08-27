"""
Custom Firebase Authentication for Django REST Framework
Compatible with Django 5.2.5 and newer versions
"""

import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import os

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom Firebase authentication class that's compatible with Django 5.2.5+
    """
    
    def authenticate(self, request):
        # Get the Firebase ID token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
            
        # Check if it's a Bearer token
        if not auth_header.startswith('Bearer '):
            return None
            
        id_token = auth_header.split('Bearer ')[1]
        
        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(id_token)
            
            # Extract user information
            uid = decoded_token.get('uid')
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')
            picture = decoded_token.get('picture', '')
            
            if not uid:
                raise AuthenticationFailed('Invalid token: no UID found')
                
            # Create or get user (you can customize this based on your needs)
            user = self.get_or_create_user(uid, email, name, picture)
            
            return (user, None)
            
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def get_or_create_user(self, uid, email, name, picture):
        """
        Get or create a user based on Firebase UID
        You can customize this method to integrate with your User model
        """
        from django.contrib.auth.models import User
        
        # Try to find existing user by custom field (you might want to add a firebase_uid field)
        try:
            # For now, we'll use email to find existing users
            if email:
                user = User.objects.get(email=email)
                # Update user info if needed
                if user.first_name != name:
                    user.first_name = name
                    user.save(update_fields=['first_name'])
                return user
        except User.DoesNotExist:
            pass
        
        # Create new user if not found
        if email:
            username = email.split('@')[0]  # Use email prefix as username
            # Ensure username is unique
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=name,
                password=None  # No password for Firebase users
            )
            return user
        
        # Fallback: create user with UID as username
        username = f"firebase_{uid[:8]}"
        user = User.objects.create_user(
            username=username,
            first_name=name,
            password=None
        )
        return user

def initialize_firebase():
    """
    Initialize Firebase Admin SDK
    Call this in your Django app configuration
    """
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize Firebase Admin SDK
        cred_path = os.path.join(settings.BASE_DIR, 'core', 'firebase_service_account.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Try to use environment variable for service account
            import json
            service_account_info = os.getenv('FIREBASE_SERVICE_ACCOUNT')
            if service_account_info:
                try:
                    cred = credentials.Certificate(json.loads(service_account_info))
                    firebase_admin.initialize_app(cred)
                except Exception as e:
                    print(f"Failed to initialize Firebase with environment variable: {e}")
            else:
                print("Firebase service account not found. Authentication will not work.")
