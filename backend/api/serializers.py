# backend/portfolio/serializers.py

from rest_framework import serializers
from .models import (
    Project,
    Skill,
    Experience,
    About,
    Education,
    Contact,
    Testimonial,
    SocialLink,
    Setting,
    Service,
    AdminRole,
    AdminUser,
    AdminInvitation,
)

# --- Core Portfolio Serializers ---
class ProjectSerializer(serializers.ModelSerializer):
    # The frontend should upload project images using the 'image' key in form data.
    class Meta:
        model = Project
        fields = '__all__'

    def create(self, validated_data):
        # Parse tags if sent as JSON string in multipart
        try:
            tags_value = self.context['request'].data.get('tags')
            if isinstance(tags_value, str) and tags_value.strip() != '':
                import json
                validated_data['tags'] = json.loads(tags_value)
        except Exception:
            pass
        image = self.context['request'].FILES.get('image')
        if image:
            validated_data['image'] = image
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Parse tags if sent as JSON string in multipart
        try:
            tags_value = self.context['request'].data.get('tags')
            if isinstance(tags_value, str) and tags_value.strip() != '':
                import json
                validated_data['tags'] = json.loads(tags_value)
        except Exception:
            pass
        image = self.context['request'].FILES.get('image')
        if image:
            validated_data['image'] = image
        return super().update(instance, validated_data)

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'

    # Map generic 'image' upload key to model field 'company_logo'
    def create(self, validated_data):
        image = self.context['request'].FILES.get('image') or self.context['request'].FILES.get('company_logo')
        if image:
            validated_data['company_logo'] = image
        return super().create(validated_data)

    def update(self, instance, validated_data):
        image = self.context['request'].FILES.get('image') or self.context['request'].FILES.get('company_logo')
        if image:
            validated_data['company_logo'] = image
        return super().update(instance, validated_data)

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'

    def create(self, validated_data):
        certificate = self.context['request'].FILES.get('certificate')
        if certificate:
            validated_data['certificate'] = certificate
        return super().create(validated_data)

    def update(self, instance, validated_data):
        certificate = self.context['request'].FILES.get('certificate')
        if certificate:
            validated_data['certificate'] = certificate
        return super().update(instance, validated_data)

class AboutSerializer(serializers.ModelSerializer):
    # The frontend should upload profile pictures using the 'profile_picture' key and resumes using the 'resume' key in form data.
    class Meta:
        model = About
        fields = '__all__'

    def create(self, validated_data):
        profile_picture = self.context['request'].FILES.get('profile_picture')
        if profile_picture:
            validated_data['profile_picture'] = profile_picture
        resume = self.context['request'].FILES.get('resume')
        if resume:
            validated_data['resume'] = resume
        return super().create(validated_data)

    def update(self, instance, validated_data):
        profile_picture = self.context['request'].FILES.get('profile_picture')
        if profile_picture:
            validated_data['profile_picture'] = profile_picture
        resume = self.context['request'].FILES.get('resume')
        if resume:
            validated_data['resume'] = resume
        return super().update(instance, validated_data)


# --- Communication Serializers ---
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    # The frontend should upload testimonial images using the 'image' key in form data.
    class Meta:
        model = Testimonial
        fields = '__all__'

    def create(self, validated_data):
        image = self.context['request'].FILES.get('image')
        if image:
            validated_data['image'] = image
        return super().create(validated_data)

    def update(self, instance, validated_data):
        image = self.context['request'].FILES.get('image')
        if image:
            validated_data['image'] = image
        return super().update(instance, validated_data)


# --- Configuration Serializers ---
class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'

    def create(self, validated_data):
        site_logo = self.context['request'].FILES.get('site_logo')
        if site_logo:
            validated_data['site_logo'] = site_logo
        site_favicon = self.context['request'].FILES.get('site_favicon')
        if site_favicon:
            validated_data['site_favicon'] = site_favicon
        return super().create(validated_data)

    def update(self, instance, validated_data):
        site_logo = self.context['request'].FILES.get('site_logo')
        if site_logo:
            validated_data['site_logo'] = site_logo
        site_favicon = self.context['request'].FILES.get('site_favicon')
        if site_favicon:
            validated_data['site_favicon'] = site_favicon
        return super().update(instance, validated_data)

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

# --- Admin Management Serializers ---
class AdminRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminRole
        fields = '__all__'

class AdminUserSerializer(serializers.ModelSerializer):
    role = AdminRoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = AdminUser
        fields = ['id', 'firebase_uid', 'email', 'display_name', 'role', 'role_id', 'is_active', 'last_login', 'created_at', 'updated_at']
        read_only_fields = ['firebase_uid', 'created_at', 'updated_at']

class AdminInvitationSerializer(serializers.ModelSerializer):
    role = AdminRoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True)
    invited_by = AdminUserSerializer(read_only=True)
    
    class Meta:
        model = AdminInvitation
        fields = ['id', 'invite_code', 'email', 'role', 'role_id', 'invited_by', 'status', 'expires_at', 'accepted_at', 'created_at', 'updated_at']
        read_only_fields = ['invite_code', 'invited_by', 'status', 'accepted_at', 'created_at', 'updated_at']

class CreateInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminInvitation
        fields = ['email', 'role_id']
        extra_kwargs = {
            'email': {'required': True},
            'role_id': {'required': True, 'source': 'role'}
        }
    
    def validate_email(self, value):
        # Check if user already exists
        if AdminUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

class AcceptInvitationSerializer(serializers.Serializer):
    invite_code = serializers.CharField(max_length=32)
    firebase_uid = serializers.CharField(max_length=128)
    display_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    def validate_invite_code(self, value):
        try:
            invitation = AdminInvitation.objects.get(invite_code=value)
            if not invitation.can_accept():
                raise serializers.ValidationError("This invitation is no longer valid.")
        except AdminInvitation.DoesNotExist:
            raise serializers.ValidationError("Invalid invitation code.")
        return value

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = '__all__'