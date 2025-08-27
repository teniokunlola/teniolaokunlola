#!/usr/bin/env python
"""
Migration script to transfer data from SQLite to Supabase PostgreSQL.
Run this script after setting up your Supabase database and updating your .env file.

Usage:
    python migrate_to_supabase.py

Make sure to:
1. Set up your Supabase database
2. Update your .env file with Supabase credentials
3. Run Django migrations on the new database first
4. Backup your SQLite database before running this script
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Set Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'teniola_site.settings')
django.setup()

from django.db import connections
from django.core.management import execute_from_command_line
from api.models import About, Project, Service, Skill, Testimonial, Setting, AdminRole, AdminUser, AdminInvitation

def backup_sqlite():
    """Create a backup of the SQLite database"""
    import shutil
    from datetime import datetime
    
    backup_name = f"db_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sqlite3"
    backup_path = BASE_DIR / backup_name
    
    if (BASE_DIR / 'db.sqlite3').exists():
        shutil.copy2(BASE_DIR / 'db.sqlite3', backup_path)
        print(f"✅ SQLite database backed up to: {backup_name}")
    else:
        print("⚠️  No SQLite database found to backup")

def check_supabase_connection():
    """Check if Supabase connection is working"""
    try:
        with connections['default'].cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Supabase connection successful")
            return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def migrate_data():
    """Migrate data from SQLite to Supabase"""
    print("\n🔄 Starting data migration...")
    
    # Check if we have data to migrate
    if not (BASE_DIR / 'db.sqlite3').exists():
        print("⚠️  No SQLite database found. Nothing to migrate.")
        return
    
    # Temporarily switch to SQLite to read data
    original_db = connections.databases['default'].copy()
    
    try:
        # Switch to SQLite
        connections.databases['default'] = {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
        
        # Read data from SQLite
        print("📖 Reading data from SQLite...")
        
        # About data
        about_data = {}
        if About.objects.exists():
            about = About.objects.first()
            about_data = {
                'full_name': about.full_name,
                'first_name': about.first_name,
                'last_name': about.last_name,
                'title': about.title,
                'summary': about.summary,
                'profile_picture': about.profile_picture,
                'email': about.email,
                'phone_number': about.phone_number,
                'address': about.address,
                'resume': about.resume,
            }
            print(f"📋 Found About data: {about.first_name} {about.last_name}")
        
        # Projects data
        projects_data = []
        if Project.objects.exists():
            projects = Project.objects.all()
            for project in projects:
                projects_data.append({
                    'title': project.title,
                    'description': project.description,
                    'image': project.image,
                    'url': project.url,
                    'tags': project.tags,
                })
            print(f"📋 Found {len(projects_data)} projects")
        
        # Services data
        services_data = []
        if Service.objects.exists():
            services = Service.objects.all()
            for service in services:
                services_data.append({
                    'name': service.name,
                    'description': service.description,
                    'icon': service.icon,
                })
            print(f"📋 Found {len(services_data)} services")
        
        # Skills data
        skills_data = []
        if Skill.objects.exists():
            skills = Skill.objects.all()
            for skill in skills:
                skills_data.append({
                    'name': skill.name,
                    'proficiency': skill.proficiency,
                })
            print(f"📋 Found {len(skills_data)} skills")
        
        # Testimonials data
        testimonials_data = []
        if Testimonial.objects.exists():
            testimonials = Testimonial.objects.all()
            for testimonial in testimonials:
                testimonials_data.append({
                    'name': testimonial.name,
                    'feedback': testimonial.feedback,
                    'company': testimonial.company,
                    'position': testimonial.position,
                    'rating': testimonial.rating,
                    'image': testimonial.image,
                })
            print(f"📋 Found {len(testimonials_data)} testimonials")
        
        # Settings data
        settings_data = []
        if Setting.objects.exists():
            settings = Setting.objects.all()
            for setting in settings:
                settings_data.append({
                    'site_name': setting.site_name,
                    'site_logo': setting.site_logo,
                    'site_favicon': setting.site_favicon,
                    'site_description': setting.site_description,
                    'site_keywords': setting.site_keywords,
                    'site_author': setting.site_author,
                    'site_email': setting.site_email,
                    'site_phone': setting.site_phone,
                    'site_address': setting.site_address,
                    'site_city': setting.site_city,
                    'site_state': setting.site_state,
                    'site_zip': setting.site_zip,
                    'site_country': setting.site_country,
                    'site_copyright': setting.site_copyright,
                    'site_github': setting.site_github,
                    'site_linkedin': setting.site_linkedin,
                    'site_twitter': setting.site_twitter,
                    'site_instagram': setting.site_instagram,
                    'site_facebook': setting.site_facebook,
                    'site_youtube': setting.site_youtube,
                    'site_tiktok': setting.site_tiktok,
                    'site_pinterest': setting.site_pinterest,
                    'site_reddit': setting.site_reddit,
                })
            print(f"📋 Found {len(settings_data)} settings")
        
        # Admin data
        admin_roles_data = []
        if AdminRole.objects.exists():
            admin_roles = AdminRole.objects.all()
            for role in admin_roles:
                admin_roles_data.append({
                    'name': role.name,
                    'permissions': role.permissions,
                })
            print(f"📋 Found {len(admin_roles_data)} admin roles")
        
        admin_users_data = []
        if AdminUser.objects.exists():
            admin_users = AdminUser.objects.all()
            for user in admin_users:
                admin_users_data.append({
                    'firebase_uid': user.firebase_uid,
                    'display_name': user.display_name,
                    'email': user.email,
                    'role_id': user.role.id if user.role else None,
                })
            print(f"📋 Found {len(admin_users_data)} admin users")
        
        admin_invitations_data = []
        if AdminInvitation.objects.exists():
            admin_invitations = AdminInvitation.objects.all()
            for invitation in admin_invitations:
                admin_invitations_data.append({
                    'invite_code': invitation.invite_code,
                    'email': invitation.email,
                    'role_id': invitation.role.id if invitation.role else None,
                    'invited_by_id': invitation.invited_by.id if invitation.invited_by else None,
                    'status': invitation.status,
                    'expires_at': invitation.expires_at,
                    'accepted_at': invitation.accepted_at,
                    'accepted_by_id': invitation.accepted_by.id if invitation.accepted_by else None,
                    'cancelled_by_id': invitation.cancelled_by.id if invitation.cancelled_by else None,
                    'cancelled_at': invitation.cancelled_at,
                })
            print(f"📋 Found {len(admin_invitations_data)} admin invitations")
        
        # Switch back to Supabase
        connections.close_all()
        connections.databases['default'] = original_db
        
        # Write data to Supabase
        print("\n💾 Writing data to Supabase...")
        
        # Create admin roles first (for foreign key relationships)
        role_id_mapping = {}
        for role_data in admin_roles_data:
            role, created = AdminRole.objects.get_or_create(
                name=role_data['name'],
                defaults=role_data
            )
            role_id_mapping[role_data['name']] = role.id
            if created:
                print(f"✅ Created admin role: {role.name}")
            else:
                print(f"📋 Admin role already exists: {role.name}")
        
        # Create admin users
        for user_data in admin_users_data:
            if user_data['role_id']:
                # Find the corresponding role by name and get its new ID
                old_role_name = None
                for role_data in admin_roles_data:
                    if role_data.get('id') == user_data['role_id']:
                        old_role_name = role_data['name']
                        break
                if old_role_name and old_role_name in role_id_mapping:
                    user_data['role_id'] = role_id_mapping[old_role_name]
                else:
                    # Fallback to first available role
                    user_data['role_id'] = list(role_id_mapping.values())[0] if role_id_mapping else None
            
            user, created = AdminUser.objects.get_or_create(
                firebase_uid=user_data['firebase_uid'],
                defaults=user_data
            )
            if created:
                print(f"✅ Created admin user: {user.display_name}")
            else:
                print(f"📋 Admin user already exists: {user.display_name}")
        
        # Create admin invitations
        for invitation_data in admin_invitations_data:
            if invitation_data['role_id']:
                # Find the corresponding role by name and get its new ID
                old_role_name = None
                for role_data in admin_roles_data:
                    if role_data.get('id') == invitation_data['role_id']:
                        old_role_name = role_data['name']
                        break
                if old_role_name and old_role_name in role_id_mapping:
                    invitation_data['role_id'] = role_id_mapping[old_role_name]
                else:
                    invitation_data['role_id'] = list(role_id_mapping.values())[0] if role_id_mapping else None
            
            if invitation_data['invited_by_id']:
                invitation_data['invited_by_id'] = AdminUser.objects.first().id
            if invitation_data['accepted_by_id']:
                invitation_data['accepted_by_id'] = AdminUser.objects.first().id
            
            invitation, created = AdminInvitation.objects.get_or_create(
                invite_code=invitation_data['invite_code'],
                defaults=invitation_data
            )
            if created:
                print(f"✅ Created admin invitation: {invitation.email}")
            else:
                print(f"📋 Admin invitation already exists: {invitation.email}")
        
        # Create about
        if about_data:
            about, created = About.objects.get_or_create(
                full_name=about_data['full_name'],
                defaults=about_data
            )
            if created:
                print("✅ Created About data")
            else:
                print("📋 About data already exists")
        
        # Create projects
        projects_created = 0
        for project_data in projects_data:
            project, created = Project.objects.get_or_create(
                title=project_data['title'],
                defaults=project_data
            )
            if created:
                projects_created += 1
        print(f"✅ Created {projects_created} new projects ({len(projects_data)} total)")
        
        # Create services
        services_created = 0
        for service_data in services_data:
            service, created = Service.objects.get_or_create(
                name=service_data['name'],
                defaults=service_data
            )
            if created:
                services_created += 1
        print(f"✅ Created {services_created} new services ({len(services_data)} total)")
        
        # Create skills
        skills_created = 0
        for skill_data in skills_data:
            skill, created = Skill.objects.get_or_create(
                name=skill_data['name'],
                defaults=skill_data
            )
            if created:
                skills_created += 1
        print(f"✅ Created {skills_created} new skills ({len(skills_data)} total)")
        
        # Create testimonials
        testimonials_created = 0
        for testimonial_data in testimonials_data:
            testimonial, created = Testimonial.objects.get_or_create(
                name=testimonial_data['name'],
                feedback=testimonial_data['feedback'],
                defaults=testimonial_data
            )
            if created:
                testimonials_created += 1
        print(f"✅ Created {testimonials_created} new testimonials ({len(testimonials_data)} total)")
        
        # Create settings
        settings_created = 0
        for setting_data in settings_data:
            setting, created = Setting.objects.get_or_create(
                site_name=setting_data['site_name'],
                defaults=setting_data
            )
            if created:
                settings_created += 1
        print(f"✅ Created {settings_created} new settings ({len(settings_data)} total)")
        
        print("\n🎉 Data migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        # Restore original database configuration
        connections.close_all()
        connections.databases['default'] = original_db
        raise
    finally:
        # Always restore original database configuration
        connections.close_all()
        connections.databases['default'] = original_db

def main():
    """Main migration function"""
    print("🚀 Supabase Migration Script")
    print("=" * 40)
    
    # Create backup
    backup_sqlite()
    
    # Check Supabase connection
    if not check_supabase_connection():
        print("\n❌ Cannot proceed without Supabase connection.")
        print("Please check your .env file and Supabase configuration.")
        return
    
    # Run Django migrations first
    print("\n🔄 Running Django migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Django migrations completed")
    except Exception as e:
        print(f"❌ Django migrations failed: {e}")
        return
    
    # Migrate data
    migrate_data()
    
    print("\n🎯 Migration Summary:")
    print("- SQLite database backed up")
    print("- Django migrations applied to Supabase")
    print("- All data transferred to Supabase")
    print("\n💡 Next steps:")
    print("1. Test your application with the new database")
    print("2. Verify all data is accessible")
    print("3. Update your production environment variables")
    print("4. Remove the old SQLite database when ready")

if __name__ == '__main__':
    main()
