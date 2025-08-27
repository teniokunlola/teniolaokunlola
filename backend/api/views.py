from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone   
# from django.http import JsonResponse
from .models import Project, About
from .serializers import ProjectSerializer, AboutSerializer
from django.views.decorators.csrf import csrf_exempt # <-- New import
from django.utils.decorators import method_decorator # <-- New import
from rest_framework.decorators import api_view, permission_classes # <-- New import
from rest_framework import status # <-- New import
from rest_framework.response import Response # <-- New import
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
    AdminInvitation
)
from .serializers import (
    ProjectSerializer,
    SkillSerializer,
    ExperienceSerializer,
    AboutSerializer,
    EducationSerializer,
    ContactSerializer,
    TestimonialSerializer,
    SocialLinkSerializer,
    SettingSerializer,
    ServiceSerializer,
    AdminRoleSerializer,
    AdminUserSerializer,
    AdminInvitationSerializer,
    AcceptInvitationSerializer,
    CreateInvitationSerializer
)

# Create your views here.

class ProjectAdminViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

class SkillAdminViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

class TestimonialAdminViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [IsAuthenticated]
class ExperienceAdminViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
class EducationAdminViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]
class AboutAdminViewSet(viewsets.ModelViewSet):
    queryset = About.objects.all()
    serializer_class = AboutSerializer
    permission_classes = [IsAuthenticated]
class ContactAdminViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
class SocialLinkAdminViewSet(viewsets.ModelViewSet):
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer
    permission_classes = [IsAuthenticated]
class SettingAdminViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    permission_classes = [IsAuthenticated]
class ServiceAdminViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]



# --- Core Portfolio Views (Read-only for public access) ---
@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class ProjectList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

# --- Portfolio Views ---
@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class SkillList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

@method_decorator(csrf_exempt, name='dispatch')
class ExperienceList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer

@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class EducationList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class AboutList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = About.objects.all()
    serializer_class = AboutSerializer

@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class SocialLinkList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer


# --- Communication Views ---
@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
# class ContactList(generics.ListAPIView):
# permission_classes = [AllowAny]    
# queryset = Contact.objects.all()
#     serializer_class = ContactSerializer

@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class ContactCreate(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print('CONTACT FORM ERROR:', e)
            traceback.print_exc()
            return Response({'detail': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class TestimonialList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer


# --- Configuration Views ---
@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class SettingList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

@method_decorator(csrf_exempt, name='dispatch')  # <-- Apply CSRF exemption
class ServiceList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

# --- Admin Management Views ---
class AdminRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminRole.objects.all()
    serializer_class = AdminRoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get the Firebase UID from the FirebaseUser object
        firebase_uid = getattr(self.request.user, 'uid', None)
        if not firebase_uid:
            return AdminRole.objects.none()
        
        # Get the current admin user
        try:
            admin_user = AdminUser.objects.get(firebase_uid=firebase_uid)
            # Superadmins and admins can see all roles
            if admin_user.role.name in ['superadmin', 'admin']:
                return AdminRole.objects.all()
            # Other roles can only see their own role
            return AdminRole.objects.filter(id=admin_user.role.id)
        except AdminUser.DoesNotExist:
            return AdminRole.objects.none()

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = AdminUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get the Firebase UID from the FirebaseUser object
        firebase_uid = getattr(self.request.user, 'uid', None)
        if not firebase_uid:
            return AdminUser.objects.none()
        
        # Get the current admin user
        try:
            admin_user = AdminUser.objects.get(firebase_uid=firebase_uid)
            # Superadmins can see all users, regular admins only see themselves
            if admin_user.role.name == 'superadmin':
                return AdminUser.objects.all().select_related('role').order_by('-created_at')
            else:
                return AdminUser.objects.filter(firebase_uid=firebase_uid).select_related('role').order_by('-created_at')
        except AdminUser.DoesNotExist:
            return AdminUser.objects.none()
    
    def perform_destroy(self, instance):
        # Get the current admin user
        firebase_uid = getattr(self.request.user, 'uid', None)
        if not firebase_uid:
            raise PermissionDenied("Authentication required")
        
        try:
            current_admin = AdminUser.objects.get(firebase_uid=firebase_uid)
            # Only superadmins can delete users
            if current_admin.role.name != 'superadmin':
                raise PermissionDenied("Only superadmins can delete users")
            
            # Prevent superadmins from deleting themselves
            if instance.firebase_uid == firebase_uid:
                raise PermissionDenied("Cannot delete your own account")
            
            # Prevent deletion of other superadmins
            if instance.role.name == 'superadmin':
                raise PermissionDenied("Cannot delete other superadmin accounts")
            
            instance.delete()
        except AdminUser.DoesNotExist:
            raise PermissionDenied("Admin user not found")
    
    def perform_update(self, serializer):
        # Get the current admin user
        firebase_uid = getattr(self.request.user, 'uid', None)
        if not firebase_uid:
            raise PermissionDenied("Authentication required")
        
        try:
            current_admin = AdminUser.objects.get(firebase_uid=firebase_uid)
            instance = serializer.instance
            
            # Only superadmins can modify other users
            if current_admin.role.name != 'superadmin' and instance.firebase_uid != firebase_uid:
                raise PermissionDenied("Only superadmins can modify other users")
            
            # Prevent superadmins from disabling themselves
            if instance.firebase_uid == firebase_uid and 'is_active' in serializer.validated_data:
                if not serializer.validated_data['is_active']:
                    raise PermissionDenied("Cannot disable your own account")
            
            serializer.save()
        except AdminUser.DoesNotExist:
            raise PermissionDenied("Admin user not found")

class AdminInvitationViewSet(viewsets.ModelViewSet):
    queryset = AdminInvitation.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateInvitationSerializer
        return AdminInvitationSerializer
    
    def get_queryset(self):
        # Get the Firebase UID from the FirebaseUser object
        firebase_uid = getattr(self.request.user, 'uid', None)
        if not firebase_uid:
            return AdminInvitation.objects.none()
        
        # Get the current admin user
        try:
            admin_user = AdminUser.objects.get(firebase_uid=firebase_uid)
            # Superadmins can see all invitations, regular admins only see their own
            if admin_user.role.name == 'superadmin':
                return AdminInvitation.objects.all().select_related('role', 'invited_by').order_by('-created_at')
            else:
                return AdminInvitation.objects.filter(invited_by__firebase_uid=firebase_uid).select_related('role', 'invited_by').order_by('-created_at')
        except AdminUser.DoesNotExist:
            return AdminInvitation.objects.none()
    
    def perform_create(self, serializer):
        import secrets
        import string
        from django.utils import timezone
        from datetime import timedelta
        
        # Generate unique invite code
        def generate_invite_code():
            alphabet = string.ascii_uppercase + string.digits
            while True:
                code = ''.join(secrets.choice(alphabet) for _ in range(8))
                if not AdminInvitation.objects.filter(invite_code=code).exists():
                    return code
        
        # Set expiration (7 days from now)
        expires_at = timezone.now() + timedelta(days=7)
        
        # Get the Firebase UID from the FirebaseUser object
        firebase_uid = getattr(self.request.user, 'uid', None)
        if not firebase_uid:
            raise ValueError('Firebase UID not found in user object.')
        
        # Get or create the AdminUser for the current user
        try:
            admin_user = AdminUser.objects.get(firebase_uid=firebase_uid)
        except AdminUser.DoesNotExist:
            raise ValueError('Current user is not an admin user.')
        
        serializer.save(
            invite_code=generate_invite_code(),
            invited_by=admin_user,
            expires_at=expires_at
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def accept_invitation(request):
    """Accept an admin invitation using invite code"""
    serializer = AcceptInvitationSerializer(data=request.data)
    if serializer.is_valid():
        invite_code = serializer.validated_data['invite_code']
        firebase_uid = serializer.validated_data['firebase_uid']
        display_name = serializer.validated_data.get('display_name', '')
        
        try:
            invitation = AdminInvitation.objects.get(invite_code=invite_code)
            
            if not invitation.can_accept():
                return Response(
                    {'error': 'This invitation is no longer valid.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create admin user
            admin_user = AdminUser.objects.create(
                firebase_uid=firebase_uid,
                email=invitation.email,
                display_name=display_name,
                role=invitation.role
            )
            
            # Update invitation status
            invitation.status = 'accepted'
            invitation.accepted_at = timezone.now()
            invitation.save()
            
            return Response({
                'message': 'Invitation accepted successfully!',
                'admin_user': AdminUserSerializer(admin_user).data
            }, status=status.HTTP_201_CREATED)
            
        except AdminInvitation.DoesNotExist:
            return Response(
                {'error': 'Invalid invitation code.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def validate_invitation(request):
    """Validate an invitation code and return invitation details"""
    invite_code = request.GET.get('code')
    if not invite_code:
        return Response(
            {'error': 'Invitation code is required.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        invitation = AdminInvitation.objects.get(invite_code=invite_code)
        
        if not invitation.can_accept():
            return Response(
                {'error': 'This invitation is no longer valid.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'email': invitation.email,
            'role': {
                'name': invitation.role.name,
                'description': invitation.role.description
            },
            'expires_at': invitation.expires_at,
            'status': invitation.status
        })
        
    except AdminInvitation.DoesNotExist:
        return Response(
            {'error': 'Invalid invitation code.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics_data(request):
    """Get analytics data for admin dashboard"""
    try:
        # Get the Firebase UID from the FirebaseUser object
        firebase_uid = getattr(request.user, 'uid', None)
        if not firebase_uid:
            return Response(
                {'error': 'Firebase UID not found in user object.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify user is admin
        admin_user = AdminUser.objects.get(firebase_uid=firebase_uid)
        
        # Calculate analytics data
        total_projects = Project.objects.count()
        total_skills = Skill.objects.count()
        total_experiences = Experience.objects.count()
        total_contacts = Contact.objects.count()
        total_testimonials = Testimonial.objects.count()
        
        # Recent activity (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        recent_contacts = Contact.objects.filter(created_at__gte=thirty_days_ago).count()
        recent_projects = Project.objects.filter(created_at__gte=thirty_days_ago).count()
        
        analytics_data = {
            'overview': {
                'total_projects': total_projects,
                'total_skills': total_skills,
                'total_experiences': total_experiences,
                'total_contacts': total_contacts,
                'total_testimonials': total_testimonials,
            },
            'recent_activity': {
                'recent_contacts': recent_contacts,
                'recent_projects': recent_projects,
            },
            'growth': {
                'contacts_growth': f"+{recent_contacts}" if recent_contacts > 0 else "0",
                'projects_growth': f"+{recent_projects}" if recent_projects > 0 else "0",
            }
        }
        
        return Response(analytics_data)
        
    except AdminUser.DoesNotExist:
        return Response(
            {'error': 'Admin user not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_current_admin_user(request):
    """Get current admin user information or update it"""
    try:
        # Debug: Log the request user information
        print(f"DEBUG: Request user: {request.user}")
        print(f"DEBUG: Request user type: {type(request.user)}")
        print(f"DEBUG: Request user attributes: {dir(request.user)}")
        
        # Get the Firebase UID from the FirebaseUser object
        firebase_uid = getattr(request.user, 'uid', None)
        print(f"DEBUG: Firebase UID: {firebase_uid}")
        
        if not firebase_uid:
            print("DEBUG: No Firebase UID found in user object")
            return Response(
                {'error': 'Firebase UID not found in user object.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"DEBUG: Looking for AdminUser with firebase_uid: {firebase_uid}")
        
        try:
            admin_user = AdminUser.objects.get(firebase_uid=firebase_uid)
            print(f"DEBUG: Found existing admin user: {admin_user}")
        except AdminUser.DoesNotExist:
            print(f"DEBUG: AdminUser not found, creating new one for firebase_uid: {firebase_uid}")
            
            # Get the user's email from the Firebase token
            email = getattr(request.user, 'email', None)
            display_name = getattr(request.user, 'display_name', None)
            
            if not email:
                return Response(
                    {'error': 'Email not found in Firebase user data.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Attempt to link existing admin by email (in case UID changed)
            try:
                existing_by_email = AdminUser.objects.get(email=email)
                print(f"DEBUG: Found existing admin by email, updating UID. Email: {email}")
                existing_by_email.firebase_uid = firebase_uid
                # Preserve existing display name, only update if it's empty and we have a Firebase display name
                if not existing_by_email.display_name and display_name:
                    existing_by_email.display_name = display_name
                existing_by_email.is_active = True
                existing_by_email.save(update_fields=['firebase_uid', 'display_name', 'is_active', 'updated_at'])
                admin_user = existing_by_email
                print(f"DEBUG: Updated existing admin user with new UID: {admin_user}")
            except AdminUser.DoesNotExist:
                # Get the default admin role (or create one if it doesn't exist)
                try:
                    admin_role = AdminRole.objects.get(name='admin')
                except AdminRole.DoesNotExist:
                    # Create a default admin role if it doesn't exist
                    admin_role = AdminRole.objects.create(
                        name='admin',
                        description='Default admin role for new users',
                        permissions={'permissions': ['manage_projects', 'manage_skills', 'manage_about']}
                    )
                
                # Create the new AdminUser
                admin_user = AdminUser.objects.create(
                    firebase_uid=firebase_uid,
                    email=email,
                    display_name=display_name or email.split('@')[0],
                    role=admin_role,
                    is_active=True
                )
                
                print(f"DEBUG: Created new admin user: {admin_user}")
        
        # Handle PATCH request for updating profile
        if request.method == 'PATCH':
            try:
                data = request.data
                if 'display_name' in data:
                    admin_user.display_name = data['display_name']
                if 'email' in data:
                    admin_user.email = data['email']
                
                admin_user.save()
                print(f"DEBUG: Updated admin user: {admin_user}")
                return Response(AdminUserSerializer(admin_user).data)
            except Exception as e:
                print(f"DEBUG: Error updating admin user: {str(e)}")
                return Response(
                    {'error': f'Failed to update profile: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Handle GET request for retrieving profile
        return Response(AdminUserSerializer(admin_user).data)
        
    except Exception as e:
        print(f"DEBUG: Unexpected error: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        return Response(
            {'error': f'Unexpected error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def health_check(request):
    """Health check endpoint for Docker containers"""
    return Response({"status": "healthy"}, status=status.HTTP_200_OK)