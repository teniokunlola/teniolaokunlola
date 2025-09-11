import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type About } from '@/api/adminAPI';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ui/image-upload';
import { 
  AdminPageHeader,
  AdminDataTable,
  AdminActionButton,
  AdminFormSection,
  AdminLoadingState,
  AdminErrorState
} from '@/components/admin/AdminComponents';
import { User, Plus, Edit, Trash2 } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

const EditAbout: React.FC = () => {
  const [items, setItems] = React.useState<About[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<About | null>(null);
  const [form, setForm] = React.useState<Partial<About>>({ full_name: '', first_name: '', last_name: '', title: '', summary: '', email: '', phone_number: '', address: '', profile_picture: '', resume: '' });
  const [profileFile, setProfileFile] = React.useState<File | null>(null);
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [toDeleteId, setToDeleteId] = React.useState<number | null>(null);

  const fetchAbout = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.about.list()
      .then((data) => setItems(Array.isArray(data) ? data : [data]))
      .catch((err) => setError(err.message || 'Failed to load about info'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { fetchAbout(); }, [fetchAbout]);

  // Remove automatic editing - form should only show when explicitly requested

  const handleEdit = (item: About) => {
    setEditing(item);
    setForm({ ...item });
    setShowForm(true);
  };

  const handleAdd = () => {
    // Enforce singleton: if an entry exists, switch to edit mode instead of creating
    if (items.length > 0) {
      setEditing(items[0]);
      setForm({ ...items[0] });
      setShowForm(true);
      return;
    }
    setEditing(null);
    setForm({ full_name: '', first_name: '', last_name: '', title: '', summary: '', email: '', phone_number: '', address: '', profile_picture: '', resume: '' });
    setProfileFile(null);
    setResumeFile(null);
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Basic required field checks
      if (!form.full_name || !form.summary) {
        throw new Error('Full name and summary are required.');
      }
      if (!editing) {
        if (!form.first_name || !form.last_name || !form.title) {
          throw new Error('First name, last name, and title are required.');
        }
        if (!profileFile) {
          throw new Error('Profile picture is required.');
        }
      }
      const formData = new FormData();
      formData.append('full_name', form.full_name || '');
      if (form.first_name) formData.append('first_name', form.first_name);
      if (form.last_name) formData.append('last_name', form.last_name);
      if (form.title) formData.append('title', form.title);
      formData.append('summary', form.summary || '');
      if (form.email) formData.append('email', form.email);
      if (form.phone_number) formData.append('phone_number', form.phone_number);
      if (form.address) formData.append('address', form.address);
      if (profileFile) formData.append('profile_picture', profileFile);
      if (resumeFile) formData.append('resume', resumeFile);

      if (editing?.id) {
        await AdminAPI.about.update(editing.id, formData);
      } else {
        await AdminAPI.about.create(formData);
      }
      fetchAbout();
      setEditing(null);
      setForm({ full_name: '', first_name: '', last_name: '', title: '', summary: '', email: '', phone_number: '', address: '', profile_picture: '', resume: '' });
      setProfileFile(null);
      setResumeFile(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save about info');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setToDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await AdminAPI.about.delete(toDeleteId);
      setItems(prev => prev.filter(i => i.id !== toDeleteId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setToDeleteId(null);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="About">
        <AdminLoadingState message="Loading about info..." />
      </AdminLayout>
    );
  }

  if (error && items.length === 0) {
    return (
      <AdminLayout title="About">
        <AdminErrorState message={error} onRetry={fetchAbout} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="About">
      <AdminPageHeader
        title="Manage About"
        subtitle="Update your personal information displayed on the site"
        icon={User}
      >
        <AdminActionButton variant="primary" icon={Plus} onClick={handleAdd}>
          {items.length === 0 ? 'Add About Entry' : 'Update About'}
        </AdminActionButton>
      </AdminPageHeader>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="text-red-500">{error}</span>
        </div>
      )}

      {showForm ? (
        <AdminFormSection title={editing ? 'Edit About' : 'Add About'}>
          <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input name="full_name" value={form.full_name || ''} onChange={handleChange} placeholder="Your full name" className="admin-form-input" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input name="title" value={form.title || ''} onChange={handleChange} placeholder="e.g. Full-Stack Developer" className="admin-form-input" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <Input name="first_name" value={form.first_name || ''} onChange={handleChange} placeholder="First name" className="admin-form-input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <Input name="last_name" value={form.last_name || ''} onChange={handleChange} placeholder="Last name" className="admin-form-input" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input name="email" type="email" value={form.email || ''} onChange={handleChange} placeholder="email@example.com" className="admin-form-input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input name="phone_number" value={form.phone_number || ''} onChange={handleChange} placeholder="e.g. +234 701..." className="admin-form-input" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input name="address" value={form.address || ''} onChange={handleChange} placeholder="City, Country" className="admin-form-input" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Profile Picture</label>
              <ImageUpload
                value={form.profile_picture}
                onChange={(url, file) => { setForm(prev => ({ ...prev, profile_picture: url })); setProfileFile(file || null); }}
                className="admin-form-input"
                acceptedFormats={['image/jpeg','image/png','image/webp']}
                aspectRatio="aspect-square"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Summary</label>
            <textarea name="summary" value={form.summary || ''} onChange={handleChange} rows={4} className="admin-form-input resize-none" placeholder="A short bio about you" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Resume (PDF)</label>
            <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="admin-form-input" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-500/20">
            <AdminActionButton variant="outline" icon={User} onClick={() => { setEditing(null); setForm({ full_name: '', first_name: '', last_name: '', title: '', summary: '', email: '', phone_number: '', address: '', profile_picture: '', resume: '' }); setProfileFile(null); setResumeFile(null); setShowForm(false); }} disabled={saving}>
              Cancel
            </AdminActionButton>
            <AdminActionButton variant="primary" icon={Plus} onClick={() => { const fakeEvent = { preventDefault: () => {} } as React.FormEvent; handleSave(fakeEvent); }} disabled={saving} loading={saving}>
              {saving ? 'Saving...' : editing ? 'Update About' : 'Add About'}
            </AdminActionButton>
          </div>
          </form>
        </AdminFormSection>
      ) : null}

      <AdminDataTable headers={[ 'Name', 'Title', 'Email', 'Phone', 'Address', 'Summary', 'Actions' ]} loading={loading} emptyMessage="No about entries found.">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-800/20 transition-colors">
            <td className="py-3 px-4"><span className="text-foreground font-medium">{item.full_name}</span></td>
            <td className="py-3 px-4"><span className="text-muted-foreground">{item.title || '—'}</span></td>
            <td className="py-3 px-4"><span className="text-muted-foreground">{item.email || '—'}</span></td>
            <td className="py-3 px-4"><span className="text-muted-foreground">{item.phone_number || '—'}</span></td>
            <td className="py-3 px-4"><span className="text-muted-foreground">{item.address || '—'}</span></td>
            <td className="py-3 px-4"><span className="text-muted-foreground line-clamp-2 max-w-xs">{item.summary}</span></td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                <AdminActionButton variant="outline" size="sm" icon={Edit} onClick={() => handleEdit(item)}>Edit</AdminActionButton>
                <AdminActionButton variant="outline" size="sm" icon={Trash2} onClick={() => handleDelete(item.id!)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">Delete</AdminActionButton>
              </div>
            </td>
          </tr>
        ))}
      </AdminDataTable>

      <ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete About Entry" message="Are you sure you want to delete this entry?" confirmText="Delete" cancelText="Cancel" variant="destructive" />
    </AdminLayout>
  );
};

export default EditAbout;
