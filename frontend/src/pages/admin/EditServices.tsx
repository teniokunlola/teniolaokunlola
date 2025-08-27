import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Service } from '@/api/adminAPI';

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
  Settings,
  Plus,
  Edit,
  Trash2,
  Globe,
  Calendar,
  Zap
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const EditServices: React.FC = () => {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [form, setForm] = React.useState<Partial<Service>>({ name: '', description: '', icon: '' });
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [serviceToDelete, setServiceToDelete] = React.useState<number | null>(null);

  const fetchServices = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.services.list()
      .then((data) => setServices(data))
      .catch((err) => setError(err.message || 'Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEdit = (service: Service) => {
    setEditing(service);
    setForm({ ...service });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', icon: '' });
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await AdminAPI.services.update(editing.id!, form);
      } else {
        await AdminAPI.services.create(form);
      }
      fetchServices();
      setEditing(null);
      setForm({ name: '', description: '', icon: '' });
      setShowForm(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to save service', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setServiceToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    setDeletingId(serviceToDelete);
    try {
      await AdminAPI.services.delete(serviceToDelete);
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete));
      if (editing && editing.id === serviceToDelete) {
        setEditing(null);
        setForm({ name: '', description: '', icon: '' });
        setShowForm(false);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete service', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setServiceToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: '', description: '', icon: '' });
    setShowForm(false);
    setError(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Services">
        <AdminLoadingState message="Loading services..." />
      </AdminLayout>
    );
  }

  if (error && services.length === 0) {
    return (
      <AdminLayout title="Services">
        <AdminErrorState message={error} onRetry={fetchServices} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Services">
      <AdminPageHeader
        title="Manage Services"
        subtitle="Add, edit, and manage the services you offer"
        icon={Settings}
      >
        <AdminActionButton
          variant="primary"
          icon={Plus}
          onClick={handleAdd}
        >
          Add Service
        </AdminActionButton>
      </AdminPageHeader>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <span>{error}</span>
          </div>
        </div>
      )}

      {showForm ? (
        <AdminFormSection title={editing ? 'Edit Service' : 'Add New Service'}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  placeholder="e.g., Web Development, UI/UX Design"
                  className="admin-form-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="icon" className="text-sm font-medium text-foreground">
                  Icon Class
                </label>
                <Input
                  id="icon"
                  name="icon"
                  value={form.icon || ''}
                  onChange={handleChange}
                  placeholder="e.g., fas fa-code, icon-web"
                  className="admin-form-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Service Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                placeholder="Describe what this service includes..."
                rows={4}
                className="admin-form-input resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-500/20">
              <AdminActionButton
                variant="outline"
                icon={Settings}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </AdminActionButton>
              
              <AdminActionButton
                variant="primary"
                icon={Plus}
                onClick={() => {
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  handleSave(fakeEvent);
                }}
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Saving...' : editing ? 'Update Service' : 'Add Service'}
              </AdminActionButton>
            </div>
          </form>
        </AdminFormSection>
      ) : (
        <AdminDataTable
          headers={['Service', 'Description', 'Icon', 'Date Added', 'Actions']}
          loading={loading}
          emptyMessage="No services found. Add your first service to get started."
        >
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-gray-800/20 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg">
                    <Globe className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.description.length > 60 
                        ? `${service.description.substring(0, 60)}...` 
                        : service.description
                      }
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </td>
              <td className="py-3 px-4">
                {service.icon ? (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <AdminStatusBadge status="success">Has Icon</AdminStatusBadge>
                  </div>
                ) : (
                  <AdminStatusBadge status="warning">No Icon</AdminStatusBadge>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {service.created_at 
                    ? new Date(service.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEdit(service)}
                    disabled={deletingId === service.id}
                  >
                    Edit
                  </AdminActionButton>
                  
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(service.id!)}
                    disabled={deletingId === service.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {deletingId === service.id ? 'Deleting...' : 'Delete'}
                  </AdminActionButton>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default EditServices;

