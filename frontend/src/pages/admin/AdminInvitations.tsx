import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI from '@/api/adminAPI';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  AdminPageHeader,
  AdminDataTable,
  AdminActionButton,
  AdminFormSection,
  AdminLoadingState,
  AdminErrorState,
  AdminStatusBadge
} from '@/components/admin/AdminComponents';
import { 
  Mail,
  Users,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Send,
  Calendar,
  Eye
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { SimpleModal } from '@/components/ui/modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';
import { Button } from '@/components/ui/button';

interface Role {
  id: number;
  name: string;
}

interface Invitation {
  id: number;
  email: string;
  invite_code: string;
  status: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  accepted_by: string | null;
  role: { name: string };
}

const AdminInvitations: React.FC = () => {
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [email, setEmail] = React.useState('');
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [sending, setSending] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [invitationToDelete, setInvitationToDelete] = React.useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedInvitation, setSelectedInvitation] = React.useState<Invitation | null>(null);

  const fetchInvitations = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.list<Invitation>('admin-invitations')
      .then((data) => setInvitations(data))
      .catch((err) => setError(err.message || 'Failed to load invitations'))
      .finally(() => setLoading(false));
  }, []);

  const fetchRoles = React.useCallback(() => {
    AdminAPI.list<Role>('admin-roles')
      .then((data) => setRoles(data))
      .catch(() => {
        // Role fetch failure is not critical, just keep empty
      });
  }, []);

  React.useEffect(() => {
    fetchInvitations();
    fetchRoles();
  }, [fetchInvitations, fetchRoles]);

  const handleSendInvitation = async () => {
    if (!email || !selectedRoleId) {
      setError('Please enter email and select a role.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await AdminAPI.create('admin-invitations', { email, role_id: selectedRoleId });
      setEmail('');
      setSelectedRoleId(null);
      setShowForm(false);
      fetchInvitations();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to send invitation', { error: err, email, roleId: selectedRoleId });
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    setInvitationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!invitationToDelete) return;
    
    setDeletingId(invitationToDelete);
    try {
      await AdminAPI.delete('admin-invitations', invitationToDelete);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationToDelete));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete invitation', { error: err, invitationId: invitationToDelete });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setInvitationToDelete(null);
    }
  };

  const handleCancelInvitation = async (id: number) => {
    setError(null);
    try {
      await AdminAPI.patch('admin-invitations', id, { status: 'cancelled' });
      fetchInvitations();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to cancel invitation', { error: err, invitationId: id });
      setError(errorMessage);
    }
  };

  const handleView = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setViewModalOpen(true);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could show a toast notification here
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <AdminStatusBadge status="warning">Pending</AdminStatusBadge>;
      case 'accepted':
        return <AdminStatusBadge status="success">Accepted</AdminStatusBadge>;
      case 'cancelled':
        return <AdminStatusBadge status="error">Cancelled</AdminStatusBadge>;
      case 'expired':
        return <AdminStatusBadge status="error">Expired</AdminStatusBadge>;
      default:
        return <AdminStatusBadge status="info">{status}</AdminStatusBadge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Invitations">
        <AdminLoadingState message="Loading invitations..." />
      </AdminLayout>
    );
  }

  if (error && invitations.length === 0) {
    return (
      <AdminLayout title="Admin Invitations">
        <AdminErrorState message={error} onRetry={fetchInvitations} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Invitations">
      <AdminPageHeader
        title="Admin Invitations"
        subtitle="Send and manage invitations for new administrative users"
        icon={Users}
      >
        <AdminActionButton
          variant="primary"
          icon={Plus}
          onClick={() => setShowForm(true)}
        >
          Send Invitation
        </AdminActionButton>
      </AdminPageHeader>

            {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
              </div>
            )}

      {/* Send Invitation Form */}
      {showForm && (
        <AdminFormSection title="Send New Invitation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="admin-form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Admin Role <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRoleId || ''}
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                className="admin-form-input"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-500/20">
            <AdminActionButton
              variant="outline"
              icon={XCircle}
              onClick={() => {
                setShowForm(false);
                setEmail('');
                setSelectedRoleId(null);
                setError(null);
              }}
              disabled={sending}
            >
              Cancel
            </AdminActionButton>
            
            <AdminActionButton
              variant="primary"
              icon={Send}
              onClick={handleSendInvitation}
              loading={sending}
              disabled={sending || !email || !selectedRoleId}
            >
              {sending ? 'Sending...' : 'Send Invitation'}
            </AdminActionButton>
          </div>
        </AdminFormSection>
      )}

      {/* Invitations List */}
      <AdminDataTable
        headers={['Email', 'Role', 'Status', 'Invite Code', 'Expires', 'Actions']}
        loading={loading}
        emptyMessage="No invitations found. Send your first invitation to get started."
      >
        {invitations.map((invitation) => (
          <tr key={invitation.id} className="hover:bg-gray-800/20 transition-colors">
            <td className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{invitation.email}</div>
                  <div className="text-sm text-muted-foreground">
                    Sent {formatDate(invitation.created_at)}
                  </div>
                </div>
              </div>
            </td>
            <td className="py-3 px-4">
              <AdminStatusBadge status="info">
                {invitation.role?.name || 'No Role'}
              </AdminStatusBadge>
            </td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(invitation.status)}
                {getStatusBadge(invitation.status)}
              </div>
            </td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-800/50 px-2 py-1 rounded font-mono">
                  {invitation.invite_code}
                </code>
                <AdminActionButton
                  variant="outline"
                  size="sm"
                  icon={Copy}
                  onClick={() => copyInviteCode(invitation.invite_code)}
                  className="p-1 h-auto"
                >
                  Copy
                </AdminActionButton>
              </div>
            </td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className={`text-sm ${isExpired(invitation.expires_at) ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {formatDate(invitation.expires_at)}
                </span>
              </div>
            </td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleView(invitation)}
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    Cancel
                  </AdminActionButton>
                )}
                
                <AdminActionButton
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(invitation.id)}
                  disabled={deletingId === invitation.id}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  {deletingId === invitation.id ? 'Deleting...' : 'Delete'}
                </AdminActionButton>
              </div>
            </td>
          </tr>
        ))}
      </AdminDataTable>

      {/* Invitation Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invitations</p>
                <p className="text-2xl font-bold text-foreground">{invitations.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
        <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">
                  {invitations.filter(inv => inv.status === 'pending' && !isExpired(inv.expires_at)).length}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-foreground">
                  {invitations.filter(inv => inv.status === 'accepted').length}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
                    </div>
                  </CardContent>
                </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired/Cancelled</p>
                <p className="text-2xl font-bold text-foreground">
                  {invitations.filter(inv => 
                    inv.status === 'cancelled' || 
                    inv.status === 'expired' || 
                    isExpired(inv.expires_at)
                  ).length}
                </p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Invitation"
        message="Are you sure you want to delete this invitation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <SimpleModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Invitation Details"
      >
        {selectedInvitation && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-foreground font-medium">{selectedInvitation.email}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Role</div>
                <div className="text-foreground font-medium">{selectedInvitation.role?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-foreground font-medium capitalize">{selectedInvitation.status}</div>
              </div>
            </div>
            {selectedInvitation.role?.name && (
              <div>
                <div className="text-sm text-muted-foreground">Notes</div>
                <div className="text-foreground">Invitation for {selectedInvitation.role.name} role</div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Invite Code</div>
                <code className="text-foreground bg-gray-800/40 px-2 py-1 rounded inline-block">{selectedInvitation.invite_code}</code>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Expires At</div>
                <div className="text-foreground font-medium">{formatDate(selectedInvitation.expires_at)}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="text-foreground font-medium">{formatDate(selectedInvitation.created_at)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Accepted At</div>
                <div className="text-foreground font-medium">{selectedInvitation.accepted_at ? formatDate(selectedInvitation.accepted_at) : '—'}</div>
              </div>
            </div>
          </div>
        )}
      </SimpleModal>
    </AdminLayout>
  );
};

export default AdminInvitations;
