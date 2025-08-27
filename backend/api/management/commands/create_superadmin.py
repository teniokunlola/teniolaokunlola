from django.core.management.base import BaseCommand
from api.models import AdminRole, AdminUser


class Command(BaseCommand):
    help = 'Create a superadmin user for testing'

    def add_arguments(self, parser):
        parser.add_argument('--firebase-uid', type=str, required=True, help='Firebase UID for the superadmin')
        parser.add_argument('--email', type=str, required=True, help='Email for the superadmin')
        parser.add_argument('--display-name', type=str, default='', help='Display name for the superadmin')

    def handle(self, *args, **options):
        firebase_uid = options['firebase_uid']
        email = options['email']
        display_name = options['display_name']

        try:
            # Get the superadmin role
            superadmin_role = AdminRole.objects.get(name='superadmin')
            
            # Check if user already exists
            if AdminUser.objects.filter(firebase_uid=firebase_uid).exists():
                self.stdout.write(
                    self.style.WARNING(f'Admin user with Firebase UID {firebase_uid} already exists')
                )
                return
            
            # Create the superadmin user
            admin_user = AdminUser.objects.create(
                firebase_uid=firebase_uid,
                email=email,
                display_name=display_name,
                role=superadmin_role,
                is_active=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created superadmin user: {admin_user.email} (UID: {admin_user.firebase_uid})'
                )
            )
            
        except AdminRole.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Superadmin role not found. Please run setup_admin_roles first.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superadmin user: {e}')
            )
