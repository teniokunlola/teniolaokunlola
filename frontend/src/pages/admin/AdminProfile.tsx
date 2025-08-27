import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { type AdminUser } from '@/api/adminAPI';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  AdminPageHeader,
  AdminFormSection,
  AdminActionButton,
  AdminLoadingState,
  AdminErrorState,
  AdminStatusBadge
} from '@/components/admin/AdminComponents';
import { 
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Key,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SimpleModal } from '@/components/ui/modal';
import { authFetch } from '@/api/authFetch';
import { buildApiUrl } from '@/api/config';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    email: ''
  });
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const fetchProfile = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(buildApiUrl('current-admin-user/'));
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setForm({
        display_name: data.display_name || '',
        email: data.email || ''
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to load profile', { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      display_name: profile?.display_name || '',
      email: profile?.email || ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await authFetch(buildApiUrl('current-admin-user/'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to update profile', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Profile">
        <AdminLoadingState message="Loading profile..." />
      </AdminLayout>
    );
  }

  if (error && !profile) {
    return (
      <AdminLayout title="Admin Profile">
        <AdminErrorState message={error} onRetry={fetchProfile} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Profile">
      <AdminPageHeader
        title="Admin Profile"
        subtitle="Manage your administrative account and personal information"
        icon={User}
      >
        {!editing ? (
          <AdminActionButton
            variant="primary"
            icon={Edit}
            onClick={handleEdit}
          >
            Edit Profile
          </AdminActionButton>
        ) : (
          <div className="flex items-center gap-2">
            <AdminActionButton
              variant="outline"
              icon={X}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </AdminActionButton>
            
            <AdminActionButton
              variant="primary"
              icon={Save}
              onClick={handleSave}
              loading={saving}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </AdminActionButton>
          </div>
        )}
      </AdminPageHeader>

        {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {profile && (
        <div className="space-y-6">
          {/* Profile Overview */}
          <AdminFormSection title="Profile Overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture & Basic Info */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {profile.display_name || 'Admin User'}
                  </h2>
                  <p className="text-muted-foreground mb-4">{profile.email}</p>
                  
                  <div className="space-y-2">
                    <AdminStatusBadge status={profile.is_active ? 'success' : 'error'}>
                      {profile.is_active ? 'Active Account' : 'Inactive Account'}
                    </AdminStatusBadge>
                    
                    <AdminStatusBadge status="info">
                      {profile.role?.name || 'No Role Assigned'}
                    </AdminStatusBadge>
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                          <p className="text-foreground font-semibold">
                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Clock className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                          <p className="text-foreground font-semibold">
                            {getTimeAgo(profile.last_login)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </AdminFormSection>

          {/* Profile Details */}
          <AdminFormSection title="Profile Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  {editing ? (
                    <Input
                      name="display_name"
                      value={form.display_name}
                      onChange={handleChange}
                      placeholder="Enter your display name"
                      className="admin-form-input"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-800/20 rounded-lg">
                      <span className="text-foreground">{profile.display_name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-800/20 rounded-lg flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-foreground">{profile.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Account Information
                  </label>
                  <div className="p-3 bg-gray-800/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Additional profile fields can be added by extending the AdminUser model in the backend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AdminFormSection>

          {/* Account Security */}
          <AdminFormSection title="Account Security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-500">
                    <Key className="w-5 h-5" />
                    Password Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Keep your account secure by regularly updating your password.
                  </p>
                  <AdminActionButton
                    variant="outline"
                    icon={Key}
                    onClick={() => setPasswordModalOpen(true)}
                  >
                    Change Password
                  </AdminActionButton>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
            <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-500">
                    <Shield className="w-5 h-5" />
                    Account Status
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <AdminStatusBadge status={profile.is_active ? 'success' : 'error'}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </AdminStatusBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Role</span>
                      <span className="text-foreground font-medium">
                        {profile.role?.name || 'No Role'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Activity</span>
                      <span className="text-foreground text-sm">
                        {getTimeAgo(profile.last_login)}
                      </span>
                    </div>
                  </div>
            </CardContent>
          </Card>
            </div>
          </AdminFormSection>

          {/* Activity Log */}
          <AdminFormSection title="Recent Activity">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800/20 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Profile Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.updated_at ? formatDate(profile.updated_at) : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/20 rounded-lg">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.last_login ? formatDate(profile.last_login) : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/20 rounded-lg">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <User className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.created_at ? formatDate(profile.created_at) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </AdminFormSection>
        </div>
      )}

      <SimpleModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Password change functionality would be implemented here. This would typically include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Current password verification</li>
            <li>New password input with strength validation</li>
            <li>Password confirmation</li>
            <li>Security requirements display</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            For now, this is a placeholder for the password change feature.
          </p>
        </div>
      </SimpleModal>
    </AdminLayout>
  );
};

export default AdminProfile;
