import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Testimonial } from '@/api/adminAPI';

import ImageUpload from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { 
  validateAndSanitizeName,
  validateAndSanitizeMessage,
  validateAndSanitizeNumber,
  RateLimiter 
} from '@/lib/security';
import { 
  AdminPageHeader,
  AdminDataTable,
  AdminActionButton,
  AdminFormSection,
  AdminLoadingState,
  AdminErrorState,

} from '@/components/admin/AdminComponents';
import { 
  Star,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const EditTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [form, setForm] = React.useState<Partial<Testimonial>>({ 
    name: '', 
    feedback: '', 
    company: '', 
    position: '', 
    rating: 5, 
    image: '' 
  });
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = React.useState<number | null>(null);
  
  // Rate limiting for testimonial operations
  const rateLimiter = React.useMemo(() => new RateLimiter(10, 60000), []); // 10 attempts per minute

  const fetchTestimonials = React.useCallback(() => {
    setLoading(true);
    setError(null);
    AdminAPI.testimonials.list()
      .then((data) => setTestimonials(data))
      .catch((err) => setError(err.message || 'Failed to load testimonials'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setForm({ ...testimonial });
    setShowForm(true);
    setImageFile(null);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ 
      name: '', 
      feedback: '', 
      company: '', 
      position: '', 
      rating: 5, 
      image: '' 
    });
    setShowForm(true);
    setImageFile(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Apply length limits to prevent excessive input
    let sanitizedValue = value;
    if (name === 'name' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'feedback' && value.length > 2000) sanitizedValue = value.slice(0, 2000);
    if (name === 'company' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'position' && value.length > 100) sanitizedValue = value.slice(0, 100);
    
    setForm({ ...form, [name]: sanitizedValue });
  };

  const handleImageUpload = (url: string, file?: File) => {
    setForm((prev) => ({ ...prev, image: url }));
    if (file) setImageFile(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Check rate limiting
    if (!rateLimiter.isAllowed('testimonial-operation')) {
      setError('Too many testimonial operations. Please wait a minute before trying again.');
      return;
    }
    
    // Validate required fields
    if (!form.name || !form.feedback) {
      setError('Name and feedback are required.');
      setSaving(false);
      return;
    }
    
    // Validate and sanitize inputs
    const nameValidation = validateAndSanitizeName(form.name);
    if (!nameValidation.isValid) {
      setError(nameValidation.error || 'Invalid name');
      setSaving(false);
      return;
    }
    
    const feedbackValidation = validateAndSanitizeMessage(form.feedback);
    if (!feedbackValidation.isValid) {
      setError(feedbackValidation.error || 'Invalid feedback');
      setSaving(false);
      return;
    }
    
    const companyValidation = form.company ? validateAndSanitizeName(form.company) : { isValid: true, value: form.company, error: undefined };
    if (form.company && !companyValidation.isValid) {
      setError(companyValidation.error || 'Invalid company name');
      setSaving(false);
      return;
    }
    
    const positionValidation = form.position ? validateAndSanitizeName(form.position) : { isValid: true, value: form.position, error: undefined };
    if (form.position && !positionValidation.isValid) {
      setError(positionValidation.error || 'Invalid position');
      setSaving(false);
      return;
    }
    
    const ratingValidation = validateAndSanitizeNumber(form.rating?.toString() || '5', 1, 5);
    if (!ratingValidation.isValid) {
      setError(ratingValidation.error || 'Invalid rating');
      setSaving(false);
      return;
    }
    
    try {
      const testimonialData: Partial<Testimonial> = {
        name: nameValidation.value,
        feedback: feedbackValidation.value,
        company: companyValidation.value || '',
        position: positionValidation.value || '',
        rating: ratingValidation.value,
      };
      
      if (imageFile) {
        // For now, we'll handle image upload separately
        // In a real implementation, you'd upload the image first and get a URL
        testimonialData.image = imageFile.name; // This is a placeholder
      } else if (editing && typeof form.image === 'string' && form.image) {
        // If editing and no new file, keep the existing image
        testimonialData.image = form.image;
      } else {
        setError('Testimonial image is required.');
        setSaving(false);
        return;
      }
      
      if (editing) {
        await AdminAPI.testimonials.update(editing.id!, testimonialData);
      } else {
        await AdminAPI.testimonials.create(testimonialData);
      }
      
      // Reset rate limiter on successful save
      rateLimiter.reset('testimonial-operation');
      fetchTestimonials();
      setEditing(null);
      setForm({ 
        name: '', 
        feedback: '', 
        company: '', 
        position: '', 
        rating: 5, 
        image: '' 
      });
      setShowForm(false);
      setImageFile(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to save testimonial', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setTestimonialToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!testimonialToDelete) return;
    
    setDeletingId(testimonialToDelete);
    try {
      await AdminAPI.testimonials.delete(testimonialToDelete);
      fetchTestimonials();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to delete testimonial', { error: err });
      setError(errorMessage);
    } finally {
      setDeletingId(null);
      setTestimonialToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ 
      name: '', 
      feedback: '', 
      company: '', 
      position: '', 
      rating: 5, 
      image: '' 
    });
    setShowForm(false);
    setImageFile(null);
    setError(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Testimonials">
        <AdminLoadingState message="Loading testimonials..." />
      </AdminLayout>
    );
  }

  if (error && testimonials.length === 0) {
    return (
      <AdminLayout title="Edit Testimonials">
        <AdminErrorState message={error} onRetry={fetchTestimonials} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Testimonials">
      <AdminPageHeader
        title="Testimonial Management"
        subtitle="Manage client testimonials and feedback"
        icon={MessageSquare}
      >
        <AdminActionButton
          variant="primary"
          icon={Plus}
          onClick={handleAdd}
        >
          Add Testimonial
        </AdminActionButton>
      </AdminPageHeader>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-500">
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AdminFormSection title={editing ? 'Edit Testimonial' : 'Add New Testimonial'}>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name || ''}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="position" className="text-sm font-medium text-foreground">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="position"
                    name="position"
                    value={form.position || ''}
                    onChange={handleChange}
                    placeholder="Enter client position"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-foreground">
                    Company
                  </label>
                  <Input
                    id="company"
                    name="company"
                    value={form.company || ''}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="rating" className="text-sm font-medium text-foreground">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={form.rating || 5}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                    placeholder="Rating out of 5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium text-foreground">
                  Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={form.feedback || ''}
                  onChange={handleChange}
                  placeholder="Enter client feedback"
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Client Image <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  value={form.image}
                  onChange={handleImageUpload}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                <AdminActionButton
                  variant="outline"
                  icon={MessageSquare}
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
                  {saving ? 'Saving...' : editing ? 'Update Testimonial' : 'Add Testimonial'}
                </AdminActionButton>
              </div>
            </form>
          </AdminFormSection>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <AdminDataTable
            headers={['Client', 'Position/Company', 'Rating', 'Feedback', 'Image', 'Date Added', 'Actions']}
            loading={loading}
            emptyMessage="No testimonials found. Add your first testimonial to get started."
          >
            {testimonials.map((testimonial) => (
              <motion.tr
                key={testimonial.id}
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
                      <p className="font-medium text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {formatDate(testimonial.created_at || null)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-foreground">{testimonial.position}</p>
                    {testimonial.company && (
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (testimonial.rating || 0)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({testimonial.rating || 0}/5)
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="max-w-xs">
                    <p className="text-sm text-foreground line-clamp-2">
                      "{testimonial.feedback}"
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {testimonial.image ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(testimonial.created_at || null)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <AdminActionButton
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEdit(testimonial)}
                      disabled={deletingId === testimonial.id}
                    >
                      Edit
                    </AdminActionButton>
                    
                    <AdminActionButton
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(testimonial.id!)}
                      disabled={deletingId === testimonial.id}
                      loading={deletingId === testimonial.id}
                    >
                      Delete
                    </AdminActionButton>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AdminDataTable>
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AdminLayout>
  );
};

export default EditTestimonials;
