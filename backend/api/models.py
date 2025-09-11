from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

# Create your models here.

class Project(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/')
    url = models.URLField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.JSONField(default=list)

    def __str__(self):
        return self.title

class Skill(models.Model):
    name = models.CharField(max_length=50)
    proficiency = models.IntegerField(default=0)  # 0-100 scale
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class About(models.Model):
    full_name = models.CharField(max_length=200)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    profile_picture = models.ImageField(upload_to='about/', blank=True, null=True)
    summary = models.TextField()
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    resume = models.FileField(upload_to='about/', blank=True, null=True)

    class Meta:
        verbose_name_plural = "About"

    def __str__(self):
        return self.full_name

    def save(self, *args, **kwargs):
        # Enforce the singleton pattern - allow updates to existing entries
        if About.objects.exists() and not self.pk:
            # If we're trying to create a new entry but one exists, update the existing one instead
            existing_about = About.objects.first()
            if existing_about:
                # Copy the data to the existing entry
                for field in self._meta.fields:
                    if field.name != 'id':
                        setattr(existing_about, field.name, getattr(self, field.name))
                return existing_about.save(*args, **kwargs)
        return super().save(*args, **kwargs)

class Experience(models.Model):
    job_title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    company_logo = models.ImageField(upload_to='experience/', blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.job_title} at {self.company}"

class Education(models.Model):
    degree = models.CharField(max_length=100)
    institution = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    url = models.URLField(max_length=200, blank=True, null=True)
    certificate = models.FileField(upload_to='education/', blank=True, null=True)

    def __str__(self):
        return f"{self.degree} from {self.institution}"

# --- Communication Models ---
class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} ({self.email})"

class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    feedback = models.TextField()
    company = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=100)
    rating = models.IntegerField(default=0)
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Testimonial from {self.name}"

# --- Content Models ---
class SocialLink(models.Model):
    platform = models.CharField(max_length=50)
    icon = models.CharField(max_length=50)
    url = models.URLField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform} - {self.url}"
    
class Setting(models.Model):
    site_name = models.CharField(max_length=100)
    site_logo = models.ImageField(upload_to='settings/', blank=True, null=True)
    site_favicon = models.ImageField(upload_to='settings/', blank=True, null=True)
    site_description = models.TextField()
    site_keywords = models.TextField()
    site_author = models.CharField(max_length=100)
    site_email = models.EmailField()
    site_phone = models.CharField(max_length=20)
    site_address = models.CharField(max_length=200)
    site_city = models.CharField(max_length=100)
    site_state = models.CharField(max_length=100)
    site_zip = models.CharField(max_length=20)
    site_country = models.CharField(max_length=100)
    site_copyright = models.CharField(max_length=100)
    site_github = models.URLField(max_length=200, blank=True, null=True)
    site_linkedin = models.URLField(max_length=200, blank=True, null=True)
    site_twitter = models.URLField(max_length=200, blank=True, null=True)
    site_instagram = models.URLField(max_length=200, blank=True, null=True)
    site_facebook = models.URLField(max_length=200, blank=True, null=True)
    site_youtube = models.URLField(max_length=200, blank=True, null=True)
    site_tiktok = models.URLField(max_length=200, blank=True, null=True)
    site_pinterest = models.URLField(max_length=200, blank=True, null=True)
    site_reddit = models.URLField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Settings"
        verbose_name = "Setting"
        ordering = ('site_name', 'site_logo', 'site_favicon', 'site_description', 'site_keywords', 'site_author', 'site_email', 'site_phone', 'site_address', 'site_city', 'site_state', 'site_zip', 'site_country', 'site_copyright', 'site_github', 'site_linkedin', 'site_twitter', 'site_instagram', 'site_facebook', 'site_youtube', 'site_tiktok', 'site_pinterest', 'site_reddit')  

    def __str__(self):
        return self.site_name
    
class Service(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True)  # FontAwesome or similar icon class
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

# --- Admin Management Models ---
class AdminRole(models.Model):
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    description = models.TextField()
    permissions = models.JSONField(default=dict)  # Store permissions as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Admin Role"
        verbose_name_plural = "Admin Roles"
    
    def __str__(self):
        return self.get_name_display()

class AdminInvitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    invite_code = models.CharField(max_length=32, unique=True)
    email = models.EmailField()
    role = models.ForeignKey(AdminRole, on_delete=models.CASCADE)
    invited_by = models.ForeignKey('AdminUser', on_delete=models.CASCADE, related_name='sent_invitations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField()
    accepted_by = models.ForeignKey('AdminUser', on_delete=models.CASCADE, related_name='accepted_invitations', blank=True, null=True)
    accepted_at = models.DateTimeField(blank=True, null=True)
    cancelled_by = models.ForeignKey('AdminUser', on_delete=models.CASCADE, related_name='cancelled_invitations', blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Admin Invitation"
        verbose_name_plural = "Admin Invitations"
    
    def __str__(self):
        return f"Invitation for {self.email} ({self.get_status_display()})"
    
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def can_accept(self):
        return self.status == 'pending' and not self.is_expired()
    
    def is_cancelled(self):
        return self.status == 'cancelled'
    
    def is_accepted(self):
        return self.status == 'accepted'
    
    def is_pending(self):
        return self.status == 'pending'
    

class AdminUser(models.Model):
    firebase_uid = models.CharField(max_length=128, unique=True)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=200, blank=True, null=True)
    role = models.ForeignKey(AdminRole, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Admin User"
        verbose_name_plural = "Admin Users"
    
    def __str__(self):
        return f"{self.display_name or self.email} ({self.role.name})"
    
    def is_superadmin(self):
        return self.role.name == 'superadmin'
    
    def has_permission(self, permission):
        return permission in self.role.permissions.get('permissions', [])
    
