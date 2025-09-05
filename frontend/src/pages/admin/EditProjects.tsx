import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Project } from '@/api/adminAPI';
import { buildApiUrl } from '@/api/config';
import { authFetch } from '@/api/authFetch';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

import ImageUpload from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { 
  validateAndSanitizeName,
  validateAndSanitizeUrl,
  validateAndSanitizeMessage,
  RateLimiter 
} from '@/lib/security';
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
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Calendar,

} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

const EditProjects: React.FC = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Project | null>(null);
  const [form, setForm] = React.useState<Partial<Project>>({ title: '', description: '', image: '', url: '' });
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<number | null>(null);
  
  // Rate limiting for project operations
  const rateLimiter = React.useMemo(() => new RateLimiter(10, 60000), []); // 10 attempts per minute

  const fetchProjects = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.projects.list()
      .then((data) => setProjects(data))
      .catch((err) => setError(err.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEdit = (project: Project) => {
    setEditing(project);
    setForm({ ...project });
    setShowForm(true);
    setUrlError(null);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ title: '', description: '', image: '', url: '' });
    setShowForm(true);
    setUrlError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Apply length limits to prevent excessive input
    let sanitizedValue = value;
    if (name === 'title' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'description' && value.length > 2000) sanitizedValue = value.slice(0, 2000);
    if (name === 'url' && value.length > 500) sanitizedValue = value.slice(0, 500);
    
    setForm({ ...form, [name]: sanitizedValue });
    if (name === 'url') {
      setUrlError(null);
    }
  };



  const validateUrl = (url: string) => {
    try {
      // Throws if invalid
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setUrlError(null);
    
    // Check rate limiting
    if (!rateLimiter.isAllowed('project-operation')) {
      setError('Too many project operations. Please wait a minute before trying again.');
      return;
    }
    
    // Validate required fields
    if (!form.title || !form.description) {
      setError('Title and description are required.');
      setSaving(false);
      return;
    }
    
    // Validate and sanitize inputs
    const titleValidation = validateAndSanitizeName(form.title);
    if (!titleValidation.isValid) {
      setError(titleValidation.error || 'Invalid project title');
      setSaving(false);
      return;
    }
    
    const descriptionValidation = validateAndSanitizeMessage(form.description);
    if (!descriptionValidation.isValid) {
      setError(descriptionValidation.error || 'Invalid project description');
      setSaving(false);
      return;
    }
    
    if (form.url && !validateUrl(form.url)) {
      setUrlError('Please enter a valid URL (e.g. https://example.com)');
      setSaving(false);
      return;
    }
    
    // Validate URL format if provided
    if (form.url) {
      const urlValidation = validateAndSanitizeUrl(form.url);
      if (!urlValidation.isValid) {
        setUrlError(urlValidation.error || 'Invalid URL format');
        setSaving(false);
        return;
      }
    }
    
    try {
      const formData = new FormData();
      formData.append('title', titleValidation.value);
      formData.append('description', descriptionValidation.value);
      if (form.url) formData.append('url', validateAndSanitizeUrl(form.url).value);
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.image && typeof form.image === 'string' && form.image.trim() !== '') {
        // If we have an image URL but no new file, we can proceed
        // The backend will handle the existing image
      } else {
        setError('Project image is required.');
        setSaving(false);
        return;
      }
      if (editing) {
        await AdminAPI.projects.update(editing.id!, formData);
      } else {
        await AdminAPI.projects.create(formData);
      }
      
      // Reset rate limiter on successful save
      rateLimiter.reset('project-operation');
      fetchProjects();
      setEditing(null);
      setForm({ title: '', description: '', image: '', url: '' });
      setShowForm(false);
      setImageFile(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to save project', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setProjectToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    setDeletingId(projectToDelete);
    try {
      await AdminAPI.projects.delete(projectToDelete);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
      if (editing && editing.id === projectToDelete) {
        setEditing(null);
        setForm({ title: '', description: '', image: '', url: '' });
        setShowForm(false);
        setImageFile(null);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete project', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setProjectToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ title: '', description: '', image: '', url: '' });
    setShowForm(false);
    setImageFile(null);
    setUrlError(null);
    setError(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Projects">
        <AdminLoadingState message="Loading projects..." />
      </AdminLayout>
    );
  }

  if (error && projects.length === 0) {
    return (
      <AdminLayout title="Projects">
        <AdminErrorState message={error} onRetry={fetchProjects} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Projects">
      <AdminPageHeader
        title="Manage Projects"
        subtitle="Add, edit, and manage your portfolio projects"
        icon={FolderOpen}
      >
        <AdminActionButton
          variant="primary"
          icon={Plus}
          onClick={handleAdd}
        >
          Add Project
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
        <AdminFormSection title={editing ? 'Edit Project' : 'Add New Project'}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Project Title <span className="text-red-500">*</span>
                </label>
              <Input
                id="title"
                name="title"
                value={form.title || ''}
                onChange={handleChange}
                placeholder="Enter project title"
                maxLength={200}
                className="admin-form-input"
                required
              />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium text-foreground">
                  Project URL
                </label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  value={form.url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  maxLength={500}
                  className="admin-form-input"
                />
                {urlError && (
                  <p className="text-sm text-red-500">{urlError}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Project Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                placeholder="Enter project description"
                rows={4}
                maxLength={2000}
                className="admin-form-input resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Project Image <span className="text-red-500">*</span>
              </label>
                              <ImageUpload
                  value={form.image}
                  onChange={(url, file) => {
                    setForm({ ...form, image: url });
                    setImageFile(file || null);
                  }}
                  className="admin-form-input"
                  disabled={false}
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-500/20">
              <AdminActionButton
                variant="outline"
                icon={FolderOpen}
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
                {saving ? 'Saving...' : editing ? 'Update Project' : 'Add Project'}
              </AdminActionButton>
            </div>
          </form>
        </AdminFormSection>
      ) : (
        <AdminDataTable
          headers={['Project', 'Description', 'Image', 'URL', 'Date', 'Actions']}
          loading={loading}
          emptyMessage="No projects found. Add your first project to get started."
        >
            {projects && Array.isArray(projects) && projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-800/20 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-500/30"
                    />
                  )}
                  <div>
                    <div className="font-medium text-foreground">{project.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.description.length > 50 
                        ? `${project.description.substring(0, 50)}...` 
                        : project.description
                      }
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </td>
              <td className="py-3 px-4">
                {project.image ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-green-500" />
                    <AdminStatusBadge status="success">Has Image</AdminStatusBadge>
                  </div>
                ) : (
                  <AdminStatusBadge status="warning">No Image</AdminStatusBadge>
                )}
              </td>
              <td className="py-3 px-4">
                {project.url ? (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 text-sm"
                    >
                      View Project
                    </a>
          </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No URL</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {project.created_at 
                    ? new Date(project.created_at).toLocaleDateString()
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
                    onClick={() => handleEdit(project)}
                    disabled={deletingId === project.id}
                  >
                    Edit
                  </AdminActionButton>
                  
                  <AdminActionButton
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(project.id!)}
                    disabled={deletingId === project.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {deletingId === project.id ? 'Deleting...' : 'Delete'}
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
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default EditProjects;
