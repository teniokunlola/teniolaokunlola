import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Contact } from '@/api/adminAPI';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { 
  AdminPageHeader,
  AdminActionButton,
  AdminLoadingState,
  AdminErrorState
} from '@/components/admin/AdminComponents';
import { 
  MessageSquare,
  Mail,
  User,
  Calendar,
  Trash2,

  Clock,
  CheckCircle
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const Messages: React.FC = () => {
  const [messages, setMessages] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Contact | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [unreadIds, setUnreadIds] = React.useState<Set<number>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [messageToDelete, setMessageToDelete] = React.useState<number | null>(null);

  const fetchMessages = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.contacts.list()
      .then((data) => setMessages(data))
      .catch((err) => setError(err.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSelect = (msg: Contact) => {
    setSelected(msg);
    setUnreadIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(msg.id!);
      return newSet;
    });
  };

  const handleClose = () => {
    setSelected(null);
  };

  const handleDelete = async (id: number) => {
    setMessageToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    
    setDeletingId(messageToDelete);
    try {
      await AdminAPI.contacts.delete(messageToDelete);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete));
      if (selected?.id === messageToDelete) handleClose();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete message', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setMessageToDelete(null);
    }
  };

  const handleMarkAsUnread = (id: number) => {
    setUnreadIds((prev) => new Set(prev).add(id));
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

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <AdminLayout title="Messages">
        <AdminLoadingState message="Loading messages..." />
      </AdminLayout>
    );
  }

  if (error && messages.length === 0) {
    return (
      <AdminLayout title="Messages">
        <AdminErrorState message={error} onRetry={fetchMessages} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Messages">
      <AdminPageHeader
        title="Contact Messages"
        subtitle="Manage and respond to contact form submissions"
        icon={MessageSquare}
      >
        <AdminActionButton
          variant="primary"
          icon={MessageSquare}
          onClick={() => fetchMessages()}
        >
          Refresh Messages
        </AdminActionButton>
      </AdminPageHeader>

        {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Inbox ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
              {messages.map((msg) => (
                  <div
                  key={msg.id}
                    className={`p-4 cursor-pointer border-l-4 transition-all duration-200 hover:bg-gray-800/20 ${
                      selected?.id === msg.id 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-transparent'
                    } ${unreadIds.has(msg.id!) ? 'bg-blue-500/10 border-l-blue-500' : ''}`}
                  onClick={() => handleSelect(msg)}
                >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-foreground">{msg.name}</div>
                      {unreadIds.has(msg.id!) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {msg.message || 'No message content'}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{msg.email}</span>
                      <span>{getTimeAgo(msg.created_at || '')}</span>
                    </div>
                  </div>
                ))}
              </div>
                  </CardContent>
                </Card>
            </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
            {selected ? (
            <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
                <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-500" />
                    Message from {selected.name}
                  </CardTitle>
                    <div className="flex items-center gap-2">
                    <AdminActionButton
                      variant="outline"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleMarkAsUnread(selected.id!)}
                      className={unreadIds.has(selected.id!) ? 'text-blue-500' : ''}
                    >
                      {unreadIds.has(selected.id!) ? 'Mark as Unread' : 'Mark as Read'}
                    </AdminActionButton>
                    
                    <AdminActionButton
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                            onClick={() => handleDelete(selected.id!)}
                            disabled={deletingId === selected.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      {deletingId === selected.id ? 'Deleting...' : 'Delete'}
                    </AdminActionButton>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">From</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-800/20 rounded-lg">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-foreground">{selected.name}</span>
                    </div>
                        </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-800/20 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-foreground">{selected.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date Received</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-foreground">{formatDate(selected.created_at || '')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <div className="p-4 bg-gray-800/20 rounded-lg border-l-4 border-purple-500">
                    <p className="text-foreground whitespace-pre-wrap">{selected.message || 'No message content'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-500/20">
                  <AdminActionButton
                    variant="primary"
                    icon={Mail}
                    onClick={() => window.open(`mailto:${selected.email}`, '_blank')}
                  >
                    Reply via Email
                  </AdminActionButton>
                </div>
                </CardContent>
              </Card>
            ) : (
            <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Message</h3>
                <p className="text-muted-foreground">
                  Choose a message from the inbox to view its details and respond.
                </p>
              </CardContent>
            </Card>
            )}
          </div>
        </div>

      {/* Message Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-foreground">{messages.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read Messages</p>
                <p className="text-2xl font-bold text-foreground">
                  {messages.length - unreadIds.size}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-foreground">{unreadIds.size}</p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Messages</p>
                <p className="text-2xl font-bold text-foreground">
                  {messages.filter(msg => {
                    const today = new Date();
                    const messageDate = new Date(msg.created_at || '');
                    return today.toDateString() === messageDate.toDateString();
                  }).length}
                </p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default Messages;

