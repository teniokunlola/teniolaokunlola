import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Card, CardContent } from '@/components/ui/card';
import { AdminStatusBadge } from '@/components/admin/AdminComponents';
import { 
  User, 
  Shield, 
  Crown, 
  UserCheck, 
  Mail, 
  Calendar, 
  Clock
} from 'lucide-react';
import { type AdminUser } from '@/api/adminAPI';

interface UserProfileModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

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

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super admin':
      case 'superadmin':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'moderator':
        return <UserCheck className="w-5 h-5 text-green-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: { name: string }) => {
    const roleName = role.name.toLowerCase();
    let status: 'warning' | 'info' | 'success' = 'success';
    
    if (roleName === 'super admin' || roleName === 'superadmin') {
      status = 'warning';
    } else if (roleName === 'admin') {
      status = 'info';
    }
    
    return (
      <AdminStatusBadge status={status}>
        <span className="flex items-center gap-2">
          {getRoleIcon(role.name)}
          {role.name}
        </span>
      </AdminStatusBadge>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.display_name || 'Unnamed User'}</h2>
            <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Status and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <div className="mt-1">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <AdminStatusBadge status={user.is_active ? 'success' : 'error'}>
                        {user.is_active ? 'Active' : 'Disabled'}
                      </AdminStatusBadge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-500" />
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-20">Email:</span>
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-20">Display Name:</span>
                  <span className="text-foreground">{user.display_name || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/20">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Account Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-20">Created:</span>
                  <span className="text-foreground">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-20">Last Login:</span>
                  <span className="text-foreground">{formatDate(user.last_login)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-20">Firebase UID:</span>
                  <span className="text-foreground font-mono text-xs bg-muted px-2 py-1 rounded">
                    {user.firebase_uid || 'Not set'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border-indigo-500/20">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Activity Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-3 bg-indigo-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-500">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                </div>
                <div className="text-center p-3 bg-indigo-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-500">
                    {user.role.name}
                  </p>
                  <p className="text-sm text-muted-foreground">Permission Level</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileModal;
