import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Skill } from '@/api/adminAPI';

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
  Star,
  Plus,
  Edit,
  Trash2,
  Zap
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const EditSkills: React.FC = () => {
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Skill | null>(null);
  const [form, setForm] = React.useState<Partial<Skill>>({ 
    name: '', 
    proficiency: 50 
  });
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [skillToDelete, setSkillToDelete] = React.useState<number | null>(null);

  const fetchSkills = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.skills.list()
      .then((data) => setSkills(data))
      .catch((err) => setError(err.message || 'Failed to load skills'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleEdit = (skill: Skill) => {
    setEditing(skill);
    setForm({ ...skill });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ 
      name: '', 
      proficiency: 50 
    });
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'proficiency') {
      setForm({ ...form, [name]: parseInt(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      if (editing) {
        await AdminAPI.skills.update(editing.id!, form);
      } else {
        await AdminAPI.skills.create(form);
      }
      fetchSkills();
      setEditing(null);
      setForm({ 
        name: '', 
        proficiency: 50 
      });
      setShowForm(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to save skill', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSkillToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;
    
    setDeletingId(skillToDelete);
    try {
      await AdminAPI.skills.delete(skillToDelete);
      setSkills((prev) => prev.filter((skill) => skill.id !== skillToDelete));
      if (editing && editing.id === skillToDelete) {
        setEditing(null);
        setForm({ 
          name: '', 
          proficiency: 50 
        });
        setShowForm(false);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete skill', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setSkillToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ 
      name: '', 
      proficiency: 50 
    });
    setShowForm(false);
    setError(null);
  };

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 80) return 'text-green-500';
    if (proficiency >= 60) return 'text-blue-500';
    if (proficiency >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProficiencyBadge = (proficiency: number) => {
    if (proficiency >= 80) return { status: 'success' as const, text: 'Expert' };
    if (proficiency >= 60) return { status: 'info' as const, text: 'Advanced' };
    if (proficiency >= 40) return { status: 'warning' as const, text: 'Intermediate' };
    return { status: 'error' as const, text: 'Beginner' };
  };

  if (loading) {
    return (
      <AdminLayout title="Skills">
        <AdminLoadingState message="Loading skills..." />
      </AdminLayout>
    );
  }

  if (error && skills.length === 0) {
    return (
      <AdminLayout title="Skills">
        <AdminErrorState message={error} onRetry={fetchSkills} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Skills">
      <AdminPageHeader
        title="Manage Skills"
        subtitle="Add, edit, and manage your technical skills and proficiency levels"
        icon={Star}
      >
        <AdminActionButton
          variant="primary"
          icon={Plus}
          onClick={handleAdd}
        >
          Add Skill
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
        <AdminFormSection title={editing ? 'Edit Skill' : 'Add New Skill'}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Skill Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                placeholder="e.g., React.js, Python, UI/UX Design"
                className="admin-form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="proficiency" className="text-sm font-medium text-foreground">
                Proficiency Level <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <Input
                  id="proficiency"
                  name="proficiency"
                  type="range"
                  min="0"
                  max="100"
                  value={form.proficiency || 50}
                  onChange={handleChange}
                  className="admin-form-input w-full"
                  required
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Beginner (0%)</span>
                  <span className={`font-medium ${getProficiencyColor(form.proficiency || 50)}`}>
                    {form.proficiency || 50}%
                  </span>
                  <span className="text-muted-foreground">Expert (100%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (form.proficiency || 50) >= 80 ? 'bg-green-500' :
                      (form.proficiency || 50) >= 60 ? 'bg-blue-500' :
                      (form.proficiency || 50) >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${form.proficiency || 50}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-500/20">
              <AdminActionButton
                variant="outline"
                icon={Star}
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
                {saving ? 'Saving...' : editing ? 'Update Skill' : 'Add Skill'}
              </AdminActionButton>
            </div>
          </form>
        </AdminFormSection>
      ) : (
        <AdminDataTable
          headers={['Skill', 'Proficiency', 'Level', 'Actions']}
          loading={loading}
          emptyMessage="No skills found. Add your first skill to get started."
        >
          {skills.map((skill) => {
            const proficiencyBadge = getProficiencyBadge(skill.proficiency);
            return (
              <tr key={skill.id} className="hover:bg-gray-800/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg">
                      <Zap className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{skill.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Added {skill.created_at 
                          ? new Date(skill.created_at).toLocaleDateString()
                          : 'recently'
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Proficiency</span>
                      <span className={`font-medium ${getProficiencyColor(skill.proficiency)}`}>
                        {skill.proficiency}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          skill.proficiency >= 80 ? 'bg-green-500' :
                          skill.proficiency >= 60 ? 'bg-blue-500' :
                          skill.proficiency >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${skill.proficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <AdminStatusBadge status={proficiencyBadge.status}>
                    {proficiencyBadge.text}
                  </AdminStatusBadge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <AdminActionButton
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEdit(skill)}
                      disabled={deletingId === skill.id}
                    >
                      Edit
                    </AdminActionButton>
                    
                    <AdminActionButton
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(skill.id!)}
                      disabled={deletingId === skill.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      {deletingId === skill.id ? 'Deleting...' : 'Delete'}
                    </AdminActionButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminDataTable>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default EditSkills;
