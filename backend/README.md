# Teniola Site Backend

This is the Django backend for the Teniola portfolio site with admin management capabilities.

## Setup

1. **Activate virtual environment:**
   ```bash
   source venv/Scripts/activate  # On Windows
   # or
   source venv/bin/activate      # On Unix/Mac
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Setup admin roles:**
   ```bash
   python manage.py setup_admin_roles
   ```

5. **Create a superadmin user (for testing):**
   ```bash
   python manage.py create_superadmin --firebase-uid "your-firebase-uid" --email "your-email@example.com" --display-name "Your Name"
   ```

6. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/projects/` - List all projects
- `GET /api/skills/` - List all skills
- `GET /api/experience/` - List all experience entries
- `GET /api/education/` - List all education entries
- `GET /api/about/` - Get about information
- `GET /api/testimonials/` - List all testimonials
- `GET /api/blog-posts/` - List all blog posts
- `GET /api/social-links/` - List all social links
- `GET /api/settings/` - Get site settings
- `GET /api/services/` - List all services
- `POST /api/contact/` - Create a contact message

### Admin Endpoints (Authentication Required)
- `GET /api/admin-roles/` - List all admin roles
- `GET /api/admin-users/` - List admin users (filtered by current user)
- `GET /api/admin-invitations/` - List admin invitations (filtered by current user)
- `POST /api/admin-invitations/` - Create a new admin invitation
- `POST /api/accept-invitation/` - Accept an admin invitation (public)
- `GET /api/current-admin-user/` - Get current admin user information

## Authentication

The backend uses Firebase Authentication. Users must include a valid Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

## Admin Roles

- **superadmin**: Full access to all features
- **admin**: Can manage content and send invitations
- **editor**: Can edit content but cannot manage users
- **viewer**: Read-only access to admin features

## Database Models

- **AdminRole**: Defines admin roles and permissions
- **AdminUser**: Links Firebase users to admin roles
- **AdminInvitation**: Manages admin user invitations
- **Project**: Portfolio projects
- **Skill**: Technical skills
- **Experience**: Work experience
- **Education**: Educational background
- **About**: Personal information
- **Contact**: Contact form submissions
- **Testimonial**: Client testimonials
- **BlogPost**: Blog articles
- **SocialLink**: Social media links
- **Setting**: Site configuration
- **Service**: Services offered

## Development

- Django 5.2.5
- Django REST Framework
- SQLite database
- Firebase Authentication
- CORS enabled for frontend development
