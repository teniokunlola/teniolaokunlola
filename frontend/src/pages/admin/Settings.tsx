import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI, { type Setting } from '@/api/adminAPI';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { 
  validateAndSanitizeName,
  validateAndSanitizeEmail,
  validateAndSanitizeUrl,

  RateLimiter 
} from '@/lib/security';
import { 
  AdminPageHeader,
  AdminFormSection,
  AdminActionButton,
  AdminLoadingState,
  AdminErrorState,
  AdminStatusBadge
} from '@/components/admin/AdminComponents';
import { 
   
  Save,
  Edit3,
  X,

  Settings as SettingsIcon,
  Upload,

} from 'lucide-react';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const Settings: React.FC = () => {
  const [currentSetting, setCurrentSetting] = React.useState<Setting | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Setting>>({
    site_name: '',
    site_description: '',
    site_keywords: '',
    site_author: '',
    site_email: '',
    site_phone: '',
    site_address: '',
    site_city: '',
    site_state: '',
    site_zip: '',
    site_country: '',
    site_copyright: '',
    site_github: '',
    site_linkedin: '',
    site_twitter: '',
    site_instagram: '',
    site_facebook: '',
    site_youtube: '',
    site_tiktok: '',
    site_pinterest: '',
    site_reddit: ''
  });
  
  // Rate limiting for settings updates
  const rateLimiter = React.useMemo(() => new RateLimiter(5, 60000), []); // 5 attempts per minute

  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.settings.list();
      if (data.length > 0) {
        setCurrentSetting(data[0]);
        setForm(data[0]);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to load settings', { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Apply length limits to prevent excessive input
    let sanitizedValue = value;
    if (name === 'site_name' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'site_description' && value.length > 500) sanitizedValue = value.slice(0, 500);
    if (name === 'site_keywords' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_author' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'site_email' && value.length > 254) sanitizedValue = value.slice(0, 254);
    if (name === 'site_phone' && value.length > 20) sanitizedValue = value.slice(0, 20);
    if (name === 'site_address' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_city' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'site_state' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'site_zip' && value.length > 20) sanitizedValue = value.slice(0, 20);
    if (name === 'site_country' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'site_copyright' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_github' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_linkedin' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_twitter' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_instagram' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_facebook' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_youtube' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_tiktok' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_pinterest' && value.length > 200) sanitizedValue = value.slice(0, 200);
    if (name === 'site_reddit' && value.length > 200) sanitizedValue = value.slice(0, 200);
    
    setForm(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'site_logo' | 'site_favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the image first
      const uploadResult = await AdminAPI.uploadFile(`admin/settings/${currentSetting?.id || ''}/`, file, form);
      
      // Update the form with the new image URL
      setForm(prev => ({ ...prev, [field]: uploadResult.url || '' }));
      
      // Refresh settings to get updated data
      await fetchSettings();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Failed to upload ${field}: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Check rate limiting
    if (!rateLimiter.isAllowed('settings-update')) {
      setError('Too many update attempts. Please wait a minute before trying again.');
      return;
    }
    
    try {
      // Validate and sanitize critical fields
      const validatedForm = { ...form };
      
      if (form.site_name) {
        const nameValidation = validateAndSanitizeName(form.site_name);
        if (!nameValidation.isValid) {
          setError(nameValidation.error || 'Invalid site name');
          return;
        }
        validatedForm.site_name = nameValidation.value;
      }
      
      if (form.site_email) {
        const emailValidation = validateAndSanitizeEmail(form.site_email);
        if (!emailValidation.isValid) {
          setError(emailValidation.error || 'Invalid email address');
          return;
        }
        validatedForm.site_email = emailValidation.value;
      }
      
      if (form.site_github) {
        const githubValidation = validateAndSanitizeUrl(form.site_github);
        if (!githubValidation.isValid) {
          setError(githubValidation.error || 'Invalid GitHub URL');
          return;
        }
        validatedForm.site_github = githubValidation.value;
      }
      
      if (form.site_linkedin) {
        const linkedinValidation = validateAndSanitizeUrl(form.site_linkedin);
        if (!linkedinValidation.isValid) {
          setError(linkedinValidation.error || 'Invalid LinkedIn URL');
          return;
        }
        validatedForm.site_linkedin = linkedinValidation.value;
      }
      
      if (currentSetting) {
        await AdminAPI.settings.update(currentSetting.id!, validatedForm);
      } else {
        await AdminAPI.settings.create(validatedForm);
      }
      
      // Reset rate limiter on successful save
      rateLimiter.reset('settings-update');
      await fetchSettings();
      setShowForm(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to save settings', { error: err });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(currentSetting || {});
    setShowForm(false);
    setError(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <AdminLoadingState message="Loading settings..." />
      </AdminLayout>
    );
  }

  if (error && !currentSetting) {
    return (
      <AdminLayout title="Settings">
        <AdminErrorState message={error} onRetry={fetchSettings} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <AdminPageHeader
        title="Site Settings"
        subtitle="Configure your portfolio website settings and branding"
        icon={SettingsIcon}
      >
        {!showForm && (
          <AdminActionButton
            variant="primary"
            icon={Edit3}
            onClick={() => setShowForm(true)}
          >
            Edit Settings
          </AdminActionButton>
        )}
      </AdminPageHeader>

        {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Site Information */}
          <AdminFormSection title="Basic Site Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name" className="text-sm font-medium text-foreground">
                  Site Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="site_name"
                  name="site_name"
                  value={form.site_name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter site name"
                  className="admin-form-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_author" className="text-sm font-medium text-foreground">
                  Site Author <span className="text-red-500">*</span>
                </Label>
              <Input
                  id="site_author"
                  name="site_author"
                  value={form.site_author || ''}
                  onChange={handleInputChange}
                  placeholder="Enter author name"
                  className="admin-form-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description" className="text-sm font-medium text-foreground">
                Site Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="site_description"
                name="site_description"
                value={form.site_description || ''}
                onChange={handleInputChange}
                placeholder="Enter site description"
                rows={3}
                className="admin-form-input resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_keywords" className="text-sm font-medium text-foreground">
                Site Keywords
              </Label>
              <Input
                id="site_keywords"
                name="site_keywords"
                value={form.site_keywords || ''}
                onChange={handleInputChange}
                placeholder="Enter keywords separated by commas"
                className="admin-form-input"
              />
            </div>
          </AdminFormSection>

          {/* Contact Information */}
          <AdminFormSection title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_email" className="text-sm font-medium text-foreground">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="site_email"
                  name="site_email"
                  type="email"
                  value={form.site_email || ''}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="admin-form-input"
                required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_phone" className="text-sm font-medium text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="site_phone"
                  name="site_phone"
                  value={form.site_phone || ''}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="admin-form-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_address" className="text-sm font-medium text-foreground">
                Address
              </Label>
              <Input
                id="site_address"
                name="site_address"
                value={form.site_address || ''}
                onChange={handleInputChange}
                placeholder="Enter street address"
                className="admin-form-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_city" className="text-sm font-medium text-foreground">
                  City
                </Label>
                <Input
                  id="site_city"
                  name="site_city"
                  value={form.site_city || ''}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_state" className="text-sm font-medium text-foreground">
                  State/Province
                </Label>
                <Input
                  id="site_state"
                  name="site_state"
                  value={form.site_state || ''}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_zip" className="text-sm font-medium text-foreground">
                  ZIP/Postal Code
                </Label>
                <Input
                  id="site_zip"
                  name="site_zip"
                  value={form.site_zip || ''}
                  onChange={handleInputChange}
                  placeholder="Enter ZIP code"
                  className="admin-form-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_country" className="text-sm font-medium text-foreground">
                Country
              </Label>
              <Input
                id="site_country"
                name="site_country"
                value={form.site_country || ''}
                onChange={handleInputChange}
                placeholder="Enter country"
                className="admin-form-input"
              />
            </div>
          </AdminFormSection>

          {/* Branding & Images */}
          <AdminFormSection title="Branding & Images">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Site Logo</Label>
                  <div className="flex items-center gap-3">
                    {form.site_logo && (
                      <img
                        src={form.site_logo}
                        alt="Site Logo"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-500/30"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'site_logo')}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="admin-form-input cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-800/20 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {form.site_logo ? 'Change Logo' : 'Upload Logo'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Site Favicon</Label>
                  <div className="flex items-center gap-3">
                    {form.site_favicon && (
                      <img
                        src={form.site_favicon}
                        alt="Site Favicon"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-500/30"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'site_favicon')}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <label
                        htmlFor="favicon-upload"
                        className="admin-form-input cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-800/20 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {form.site_favicon ? 'Change Favicon' : 'Upload Favicon'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AdminFormSection>

          {/* Social Media Links */}
          <AdminFormSection title="Social Media Links">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_github" className="text-sm font-medium text-foreground">
                  GitHub URL
                </Label>
                <Input
                  id="site_github"
                  name="site_github"
                  type="url"
                  value={form.site_github || ''}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_linkedin" className="text-sm font-medium text-foreground">
                  LinkedIn URL
                </Label>
                <Input
                  id="site_linkedin"
                  name="site_linkedin"
                  type="url"
                  value={form.site_linkedin || ''}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_twitter" className="text-sm font-medium text-foreground">
                  Twitter URL
                </Label>
                <Input
                  id="site_twitter"
                  name="site_twitter"
                  type="url"
                  value={form.site_twitter || ''}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_instagram" className="text-sm font-medium text-foreground">
                  Instagram URL
                </Label>
                <Input
                  id="site_instagram"
                  name="site_instagram"
                  type="url"
                  value={form.site_instagram || ''}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_facebook" className="text-sm font-medium text-foreground">
                  Facebook URL
                </Label>
                <Input
                  id="site_facebook"
                  name="site_facebook"
                  type="url"
                  value={form.site_facebook || ''}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_youtube" className="text-sm font-medium text-foreground">
                  YouTube URL
                </Label>
                <Input
                  id="site_youtube"
                  name="site_youtube"
                  type="url"
                  value={form.site_youtube || ''}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/@username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_tiktok" className="text-sm font-medium text-foreground">
                  TikTok URL
                </Label>
                <Input
                  id="site_tiktok"
                  name="site_tiktok"
                  type="url"
                  value={form.site_tiktok || ''}
                  onChange={handleInputChange}
                  placeholder="https://tiktok.com/@username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_pinterest" className="text-sm font-medium text-foreground">
                  Pinterest URL
                </Label>
                <Input
                  id="site_pinterest"
                  name="site_pinterest"
                  type="url"
                  value={form.site_pinterest || ''}
                  onChange={handleInputChange}
                  placeholder="https://pinterest.com/username"
                  className="admin-form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_reddit" className="text-sm font-medium text-foreground">
                  Reddit URL
                </Label>
                <Input
                  id="site_reddit"
                  name="site_reddit"
                  type="url"
                  value={form.site_reddit || ''}
                  onChange={handleInputChange}
                  placeholder="https://reddit.com/u/username"
                  className="admin-form-input"
                />
              </div>
            </div>
          </AdminFormSection>

          {/* Legal & Copyright */}
          <AdminFormSection title="Legal & Copyright">
            <div className="space-y-2">
              <Label htmlFor="site_copyright" className="text-sm font-medium text-foreground">
                Copyright Text
              </Label>
              <Input
                id="site_copyright"
                name="site_copyright"
                value={form.site_copyright || ''}
                onChange={handleInputChange}
                placeholder="© 2024 Your Name. All rights reserved."
                className="admin-form-input"
              />
            </div>
          </AdminFormSection>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-500/20">
            <AdminActionButton
              variant="outline"
              icon={X}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </AdminActionButton>
            
            <AdminActionButton
              variant="primary"
              icon={Save}
              onClick={() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleSave(fakeEvent);
              }}
              loading={saving}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </AdminActionButton>
          </div>
        </form>
      ) : (
        /* Display Current Settings */
        <div className="space-y-6">
          {/* Basic Info Display */}
          <AdminFormSection title="Current Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Site Name</Label>
                  <p className="text-foreground font-medium">{currentSetting?.site_name || 'Not set'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Site Author</Label>
                  <p className="text-foreground font-medium">{currentSetting?.site_author || 'Not set'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-foreground font-medium">{currentSetting?.site_email || 'Not set'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-foreground font-medium">{currentSetting?.site_phone || 'Not set'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-foreground font-medium">
                    {currentSetting?.site_city && currentSetting?.site_state 
                      ? `${currentSetting.site_city}, ${currentSetting.site_state}`
                      : 'Not set'
                    }
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Social Links</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentSetting?.site_github && (
                      <AdminStatusBadge status="info">GitHub</AdminStatusBadge>
                    )}
                    {currentSetting?.site_linkedin && (
                      <AdminStatusBadge status="info">LinkedIn</AdminStatusBadge>
                    )}
                    {currentSetting?.site_twitter && (
                      <AdminStatusBadge status="info">Twitter</AdminStatusBadge>
                    )}
                    {currentSetting?.site_instagram && (
                      <AdminStatusBadge status="info">Instagram</AdminStatusBadge>
        )}
      </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-foreground font-medium">
                    {currentSetting?.updated_at 
                      ? new Date(currentSetting.updated_at).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
          </AdminFormSection>
        </div>
      )}
    </AdminLayout>
  );
};

export default Settings;





