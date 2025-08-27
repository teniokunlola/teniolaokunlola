import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Education } from '@/api/adminAPI';
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
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building,
  Award,
  Clock
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const EditEducation: React.FC = () => {
  const [educations, setEducations] = React.useState<Education[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Education | null>(null);
  const [form, setForm] = React.useState<Partial<Education>>({ 
    degree: '', 
    institution: '', 
    start_date: '', 
    end_date: '' 
  });
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [educationToDelete, setEducationToDelete] = React.useState<number | null>(null);

  const fetchEducations = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.education.list()
      .then((data) => setEducations(data))
      .catch((err) => setError(err.message || 'Failed to load education entries'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchEducations();
  }, [fetchEducations]);

  const handleEdit = (education: Education) => {
    setEditing(education);
    setForm({ ...education });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ 
      degree: '', 
      institution: '', 
      start_date: '', 
      end_date: '' 
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
        await AdminAPI.education.update(editing.id!, form);
      } else {
        await AdminAPI.education.create(form);
      }
      fetchEducations();
      setEditing(null);
      setForm({ 
        degree: '', 
        institution: '', 
        start_date: '', 
        end_date: '' 
      });
      setShowForm(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to save education entry', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setEducationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!educationToDelete) return;
    
    setDeletingId(educationToDelete);
    try {
      await AdminAPI.education.delete(educationToDelete);
      setEducations((prev) => prev.filter((edu) => edu.id !== educationToDelete));
      if (editing && editing.id === educationToDelete) {
        setEditing(null);
        setForm({ 
          degree: '', 
          institution: '', 
          start_date: '', 
          end_date: '' 
        });
        setShowForm(false);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete education entry', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setEducationToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ 
      degree: '', 
      institution: '', 
      start_date: '', 
      end_date: '' 
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
      <AdminLayout title="Education">
        <AdminLoadingState message="Loading education entries..." />
      </AdminLayout>
    );
  }

  if (error && educations.length === 0) {
    return (
      <AdminLayout title="Education">
        <AdminErrorState message={error} onRetry={fetchEducations} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Education">
      <AdminPageHeader
        title="Manage Education"
        subtitle="Add, edit, and manage your educational background"
        icon={GraduationCap}
      >
        <AdminActionButton
          variant="primary"
          icon={Plus}
          onClick={handleAdd}
        >
          Add Education
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
        <AdminFormSection title={editing ? 'Edit Education' : 'Add New Education'}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="degree" className="text-sm font-medium text-foreground">
                  Degree/Certificate <span className="text-red-500">*</span>
                </label>
                <Input
                  id="degree"
                  name="degree"
                  value={form.degree || ''}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  className="admin-form-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="institution" className="text-sm font-medium text-foreground">
                  Institution <span className="text-red-500">*</span>
                </label>
                <Input
                  id="institution"
                  name="institution"
                  value={form.institution || ''}
                  onChange={handleChange}
                  placeholder="e.g., University of Technology"
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
                  placeholder="Leave empty if currently studying"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-500/20">
              <AdminActionButton
                variant="outline"
                icon={GraduationCap}
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
                {saving ? 'Saving...' : editing ? 'Update Education' : 'Add Education'}
              </AdminActionButton>
            </div>
          </form>
        </AdminFormSection>
      ) : (
        <AdminDataTable
          headers={['Degree', 'Institution', 'Duration', 'Period', 'Actions']}
          loading={loading}
          emptyMessage="No education entries found. Add your first education entry to get started."
        >
          {educations.map((education) => (
            <tr key={education.id} className="hover:bg-gray-800/20 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{education.degree}</div>
                    <div className="text-sm text-muted-foreground">
                      {education.degree.length > 50 
                        ? `${education.degree.substring(0, 50)}...` 
                        : education.degree
                      }
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-foreground">{education.institution}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <AdminStatusBadge status="info">
                    {getDuration(education.start_date, education.end_date)}
                  </AdminStatusBadge>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(education.start_date)} - {formatDate(education.end_date || '')}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEdit(education)}
                    disabled={deletingId === education.id}
                  >
                    Edit
                  </AdminActionButton>
                  
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(education.id!)}
                    disabled={deletingId === education.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {deletingId === education.id ? 'Deleting...' : 'Delete'}
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
        title="Delete Education Entry"
        message="Are you sure you want to delete this education entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default EditEducation;
