import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Experience } from '@/api/adminAPI';
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
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building,
  Clock
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const EditExperience: React.FC = () => {
  const [experiences, setExperiences] = React.useState<Experience[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Experience | null>(null);
  const [form, setForm] = React.useState<Partial<Experience>>({ 
    job_title: '', 
    company: '', 
    start_date: '', 
    end_date: '', 
    description: '' 
  });
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [experienceToDelete, setExperienceToDelete] = React.useState<number | null>(null);

  const fetchExperiences = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.experience.list()
      .then((data) => setExperiences(data))
      .catch((err) => setError(err.message || 'Failed to load experiences'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleEdit = (experience: Experience) => {
    setEditing(experience);
    setForm({ ...experience });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ 
      job_title: '', 
      company: '', 
      start_date: '', 
      end_date: '', 
      description: '' 
    });
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
        await AdminAPI.experience.update(editing.id!, form);
      } else {
        await AdminAPI.experience.create(form);
      }
      fetchExperiences();
      setEditing(null);
      setForm({ 
        job_title: '', 
        company: '', 
        start_date: '', 
        end_date: '', 
        description: '' 
      });
      setShowForm(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to save experience', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setExperienceToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!experienceToDelete) return;
    
    setDeletingId(experienceToDelete);
    try {
      await AdminAPI.experience.delete(experienceToDelete);
      setExperiences((prev) => prev.filter((exp) => exp.id !== experienceToDelete));
      if (editing && editing.id === experienceToDelete) {
        setEditing(null);
        setForm({ 
          job_title: '', 
          company: '', 
          start_date: '', 
          end_date: '', 
          description: '' 
        });
        setShowForm(false);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete experience', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setExperienceToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ 
      job_title: '', 
      company: '', 
      start_date: '', 
      end_date: '', 
      description: '' 
    });
    setShowForm(false);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate?: string) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <AdminLayout title="Experience">
        <AdminLoadingState message="Loading experience entries..." />
      </AdminLayout>
    );
  }

  if (error && experiences.length === 0) {
    return (
      <AdminLayout title="Experience">
        <AdminErrorState message={error} onRetry={fetchExperiences} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Experience">
      <AdminPageHeader
        title="Manage Work Experience"
        subtitle="Add, edit, and manage your professional work experience"
        icon={Briefcase}
      >
        <AdminActionButton
          variant="primary"
          icon={Plus}
          onClick={handleAdd}
        >
          Add Experience
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
        <AdminFormSection title={editing ? 'Edit Experience' : 'Add New Experience'}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_title" className="text-sm font-medium text-foreground">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={form.job_title || ''}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                  className="admin-form-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium text-foreground">
                  Company <span className="text-red-500">*</span>
                </label>
                <Input
                  id="company"
                  name="company"
                  value={form.company || ''}
                  onChange={handleChange}
                  placeholder="e.g., Tech Company Inc."
                  className="admin-form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium text-foreground">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={form.start_date || ''}
                  onChange={handleChange}
                  className="admin-form-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="end_date" className="text-sm font-medium text-foreground">
                  End Date
                </label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={form.end_date || ''}
                  onChange={handleChange}
                  className="admin-form-input"
                  placeholder="Leave empty if current position"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
                className="admin-form-input resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-500/20">
              <AdminActionButton
                variant="outline"
                icon={Briefcase}
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
                {saving ? 'Saving...' : editing ? 'Update Experience' : 'Add Experience'}
              </AdminActionButton>
            </div>
          </form>
        </AdminFormSection>
      ) : (
        <AdminDataTable
          headers={['Position', 'Company', 'Duration', 'Period', 'Actions']}
          loading={loading}
          emptyMessage="No experience entries found. Add your first work experience to get started."
        >
          {experiences.map((experience) => (
            <tr key={experience.id} className="hover:bg-gray-800/20 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{experience.job_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {experience.description.length > 60 
                        ? `${experience.description.substring(0, 60)}...` 
                        : experience.description
                      }
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-foreground">{experience.company}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <AdminStatusBadge status="info">
                    {getDuration(experience.start_date, experience.end_date)}
                  </AdminStatusBadge>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(experience.start_date)} - {formatDate(experience.end_date || '')}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEdit(experience)}
                    disabled={deletingId === experience.id}
                  >
                    Edit
                  </AdminActionButton>
                  
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(experience.id!)}
                    disabled={deletingId === experience.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {deletingId === experience.id ? 'Deleting...' : 'Delete'}
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
        title="Delete Experience Entry"
        message="Are you sure you want to delete this experience entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default EditExperience;
