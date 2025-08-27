from django.contrib import admin
from .models import (
    Project, Skill, About, Experience, Education, 
    Contact, Testimonial, SocialLink, 
    Setting, Service, AdminRole, AdminUser, AdminInvitation
)

# Register your models here.
admin.site.register(Project)
admin.site.register(Skill)
admin.site.register(Experience)
admin.site.register(Education)
admin.site.register(About)
admin.site.register(Contact)
admin.site.register(Testimonial)
admin.site.register(SocialLink)
admin.site.register(Setting)
admin.site.register(Service)

@admin.register(AdminRole)
class AdminRoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.name == 'superadmin':
            return ['name', 'description', 'permissions', 'created_at', 'updated_at']
        return ['created_at', 'updated_at']

@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'display_name', 'role', 'is_active', 'last_login', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['email', 'display_name', 'firebase_uid']
    readonly_fields = ['firebase_uid', 'created_at', 'updated_at']
    list_editable = ['is_active']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('role')

@admin.register(AdminInvitation)
class AdminInvitationAdmin(admin.ModelAdmin):
    list_display = ['email', 'role', 'status', 'invited_by', 'expires_at', 'created_at']
    list_filter = ['status', 'role', 'created_at']
    search_fields = ['email', 'invite_code']
    readonly_fields = ['invite_code', 'invited_by', 'created_at', 'updated_at']
    list_editable = ['status']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('role', 'invited_by')