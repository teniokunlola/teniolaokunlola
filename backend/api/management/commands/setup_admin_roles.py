from django.core.management.base import BaseCommand
from api.models import AdminRole

class Command(BaseCommand):
    help = 'Set up initial admin roles and permissions'

    def handle(self, *args, **options):
        self.stdout.write('Setting up admin roles...')
        
        # Define default roles with permissions
        roles_data = [
            {
                'name': 'superadmin',
                'description': 'Full access to all features and admin management',
                'permissions': {
                    'permissions': [
                        'manage_projects', 'manage_skills', 'manage_about', 
                        'manage_experience', 'manage_education', 'manage_testimonials',
                        'manage_services', 'manage_settings', 'manage_admin_users',
                        'manage_admin_roles', 'send_invitations', 'view_analytics',
                        'system_configuration'
                    ]
                }
            },
            {
                'name': 'admin',
                'description': 'Full access to portfolio content management',
                'permissions': {
                    'permissions': [
                        'manage_projects', 'manage_skills', 'manage_about',
                        'manage_experience', 'manage_education', 'manage_testimonials',
                        'manage_services', 'manage_settings', 'view_analytics'
                    ]
                }
            },
            {
                'name': 'editor',
                'description': 'Can edit portfolio content but cannot manage admin users',
                'permissions': {
                    'permissions': [
                        'manage_projects', 'manage_skills', 'manage_about',
                        'manage_experience', 'manage_education', 'manage_testimonials',
                        'manage_services'
                    ]
                }
            },
            {
                'name': 'viewer',
                'description': 'Read-only access to portfolio content',
                'permissions': {
                    'permissions': [
                        'view_projects', 'view_skills', 'view_about',
                        'view_experience', 'view_education', 'view_testimonials',
                        'view_services', 'view_analytics'
                    ]
                }
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for role_data in roles_data:
            role, created = AdminRole.objects.get_or_create(
                name=role_data['name'],
                defaults=role_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'Created role: {role.name}')
            else:
                # Update existing role permissions
                role.description = role_data['description']
                role.permissions = role_data['permissions']
                role.save()
                updated_count += 1
                self.stdout.write(f'Updated role: {role.name}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully set up admin roles! '
                f'Created: {created_count}, Updated: {updated_count}'
            )
        )
