import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type AdminUser } from '@/api/adminAPI';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AdminPageHeader,
  AdminDataTable,
  AdminActionButton,
  AdminLoadingState,
  AdminErrorState,
  AdminStatusBadge
} from '@/components/admin/AdminComponents';
import { 
  Users,
  User,
  Shield,
  Calendar,
  Trash2,
  Eye,
  Crown,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<number | null>(null);

  const fetchUsers = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.adminUsers.list()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message || 'Failed to load admin users'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: number) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setDeletingId(userToDelete);
    try {
      await AdminAPI.adminUsers.delete(userToDelete);
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete user', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super admin':
      case 'superadmin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'moderator':
        return <UserCheck className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
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
        <span className="flex items-center gap-1">
          {getRoleIcon(role.name)}
          {role.name}
        </span>
      </AdminStatusBadge>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Users">
        <AdminLoadingState message="Loading admin users..." />
      </AdminLayout>
    );
  }

  if (error && users.length === 0) {
    return (
      <AdminLayout title="Admin Users">
        <AdminErrorState message={error} onRetry={fetchUsers} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Users">
      <AdminPageHeader
        title="Admin User Management"
        subtitle="Manage administrative users and their permissions"
        icon={Users}
      >
        <AdminActionButton
          variant="primary"
          icon={Users}
          onClick={() => window.open('/admin/invitations', '_blank')}
        >
          Invite New Admin
        </AdminActionButton>
      </AdminPageHeader>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-500">
            <UserX className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* User Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role.name.toLowerCase() === 'super admin' || u.role.name.toLowerCase() === 'superadmin').length}
                </p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Crown className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role.name.toLowerCase() === 'admin').length}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moderators</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role.name.toLowerCase() === 'moderator').length}
                </p>
              </div>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AdminDataTable
          headers={['User', 'Role', 'Email', 'Joined', 'Last Login', 'Actions']}
          loading={loading}
          emptyMessage="No admin users found"
        >
          {users.map((user) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-b border-border/50 hover:bg-muted/50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.display_name || 'Unnamed User'}</p>
                    <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                {getRoleBadge(user.role)}
              </td>
              <td className="py-4 px-4">
                <span className="text-foreground">{user.email}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{formatDate(user.created_at)}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{formatDate(user.last_login)}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
                  >
                    View
                  </AdminActionButton>
                  {(user.role.name.toLowerCase() !== 'super admin' && user.role.name.toLowerCase() !== 'superadmin') && (
                    <AdminActionButton
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(user.id!)}
                      disabled={deletingId === user.id}
                      loading={deletingId === user.id}
                    >
                      Delete
                    </AdminActionButton>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </AdminDataTable>
      </motion.div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Admin User"
        message="Are you sure you want to delete this admin user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default AdminUsers;

