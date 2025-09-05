import { authFetch } from './authFetch';
import { buildApiUrl } from './config';

// Import types from Dashboard component
interface DashboardStats {
  overview: {
    total_projects: number;
    total_skills: number;
    total_experiences: number;
    total_contacts: number;
    total_testimonials: number;
  };
  recent_activity: {
    recent_contacts: number;
    recent_projects: number;
  };
  growth: {
    contacts_growth: string;
    projects_growth: string;
  };
}

// Types based on Django models
export interface Project {
  id?: number;
  title: string;
  description: string;
  image?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id?: number;
  name: string;
  proficiency: number; // 0-100 scale
  created_at?: string;
}

export interface Experience {
  id?: number;
  job_title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
  created_at?: string;
}

export interface Education {
  id?: number;
  degree: string;
  institution: string;
  start_date: string;
  end_date?: string;
  created_at?: string;
  url?: string;
  certificate?: string;
}

export interface About {
  id?: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  profile_picture?: string;
  summary: string;
  email?: string;
  phone_number?: string;
  address?: string;
  resume?: string;
}

export interface Contact {
  id?: number;
  name: string;
  email: string;
  message: string;
  created_at?: string;
}

export interface Testimonial {
  id?: number;
  name: string;
  feedback: string;
  company?: string;
  position: string;
  rating: number;
  image?: string;
  created_at?: string;
}

export interface SocialLink {
  id?: number;
  platform: string;
  url: string;
  created_at?: string;
}

export interface Setting {
  id?: number;
  site_name: string;
  site_logo?: string;
  site_favicon?: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  site_city: string;
  site_state: string;
  site_zip: string;
  site_country: string;
  site_copyright: string;
  site_github?: string;
  site_linkedin?: string;
  site_twitter?: string;
  site_instagram?: string;
  site_facebook?: string;
  site_youtube?: string;
  site_tiktok?: string;
  site_pinterest?: string;
  site_reddit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id?: number;
  name: string;
  description: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: number;
  firebase_uid: string;
  email: string;
  display_name: string;
  role: {
    id: number;
    name: string;
    description: string;
    permissions: { permissions: string[] };
  };
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

// Helper to ensure trailing slash
function withSlash(url: string): string {
  return url.endsWith('/') ? url : url + '/';
}

// Generic CRUD operations
export class AdminAPI {
  // Generic CRUD methods
  static async list<T>(endpoint: string): Promise<T[]> {
    const response = await authFetch(buildApiUrl(withSlash(endpoint)));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }
    const data = await response.json();
    // Django returns paginated data with {count, next, previous, results}
    // Extract the results array for list operations
    return data.results || data;
  }

  static async get<T>(endpoint: string, id: number): Promise<T> {
    const response = await authFetch(buildApiUrl(withSlash(`${endpoint}/${id}`)));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint} with id ${id}`);
    }
    return response.json();
  }

  static async create<T>(endpoint: string, data: Partial<T>): Promise<T> {
    const response = await authFetch(buildApiUrl(withSlash(endpoint)), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create ${endpoint}`);
    }
    return response.json();
  }

  static async update<T>(endpoint: string, id: number, data: Partial<T>): Promise<T> {
    const response = await authFetch(buildApiUrl(withSlash(`${endpoint}/${id}`)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to update ${endpoint}`);
    }
    return response.json();
  }

  static async patch<T>(endpoint: string, id: number, data: Partial<T>): Promise<T> {
    const response = await authFetch(buildApiUrl(withSlash(`${endpoint}/${id}`)), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to update ${endpoint}`);
    }
    return response.json();
  }

  static async delete(endpoint: string, id: number): Promise<void> {
    const response = await authFetch(buildApiUrl(withSlash(`${endpoint}/${id}`)), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${endpoint} with id ${id}`);
    }
  }

  static async createWithFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await authFetch(buildApiUrl(withSlash(endpoint)), {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create ${endpoint}`);
    }
    return response.json();
  }

  static async updateWithFormData<T>(endpoint: string, id: number, formData: FormData): Promise<T> {
    const response = await authFetch(buildApiUrl(withSlash(`${endpoint}/${id}`)), {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to update ${endpoint}`);
    }
    return response.json();
  }

  // Specific API endpoints
  static projects = {
    // CRUD methods
    list: () => this.list<Project>('admin/projects'),
    get: (id: number) => this.get<Project>('admin/projects', id),
    create: (data: FormData | Partial<Project>) => {
      if (data instanceof FormData) {
        return this.createWithFormData<Project>('admin/projects', data);
      }
      return this.create<Project>('admin/projects', data);
    },
    update: (id: number, data: FormData | Partial<Project>) => {
      if (data instanceof FormData) {
        return this.updateWithFormData<Project>('admin/projects', id, data);
      }
      return this.update<Project>('admin/projects', id, data);
    },
    patch: (id: number, data: Partial<Project>) => this.patch<Project>('admin/projects', id, data),
    // Delete methods
    delete: (id: number) => this.delete('admin/projects', id),
    // File upload methods
    upload: (file: File, additionalData?: Record<string, string | number | boolean>) => this.uploadFile('admin/projects', file, additionalData),
  };

  static skills = {
    list: () => this.list<Skill>('admin/skills'),
    get: (id: number) => this.get<Skill>('admin/skills', id),
    create: (data: Partial<Skill>) => this.create<Skill>('admin/skills', data),
    update: (id: number, data: Partial<Skill>) => this.update<Skill>('admin/skills', id, data),
    patch: (id: number, data: Partial<Skill>) => this.patch<Skill>('admin/skills', id, data),
    delete: (id: number) => this.delete('admin/skills', id),
  };

  static experience = {
    list: () => this.list<Experience>('admin/experiences'),
    get: (id: number) => this.get<Experience>('admin/experiences', id),
    create: (data: Partial<Experience>) => this.create<Experience>('admin/experiences', data),
    update: (id: number, data: Partial<Experience>) => this.update<Experience>('admin/experiences', id, data),
    patch: (id: number, data: Partial<Experience>) => this.patch<Experience>('admin/experiences', id, data),
    delete: (id: number) => this.delete('admin/experiences', id),
  };

  static education = {
    list: () => this.list<Education>('admin/educations'),
    get: (id: number) => this.get<Education>('admin/educations', id),
    create: (data: FormData | Partial<Education>) => {
      if (data instanceof FormData) {
        return this.createWithFormData<Education>('admin/educations', data);
      }
      return this.create<Education>('admin/educations', data);
    },
    update: (id: number, data: FormData | Partial<Education>) => {
      if (data instanceof FormData) {
        return this.updateWithFormData<Education>('admin/educations', id, data);
      }
      return this.update<Education>('admin/educations', id, data);
    },
    patch: (id: number, data: Partial<Education>) => this.patch<Education>('admin/educations', id, data),
    delete: (id: number) => this.delete('admin/educations', id),
  };

  static about = {
    list: () => this.list<About>('admin/about'),
    get: (id: number) => this.get<About>('admin/about', id),
    create: (data: FormData | Partial<About>) => {
      if (data instanceof FormData) {
        return this.createWithFormData<About>('admin/about', data);
      }
      return this.create<About>('admin/about', data);
    },
    update: (id: number, data: FormData | Partial<About>) => {
      if (data instanceof FormData) {
        return this.updateWithFormData<About>('admin/about', id, data);
      }
      return this.update<About>('admin/about', id, data);
    },
    patch: (id: number, data: Partial<About>) => this.patch<About>('admin/about', id, data),
    delete: (id: number) => this.delete('admin/about', id),
  };

  static contacts = {
    list: () => this.list<Contact>('admin/contacts'),
    get: (id: number) => this.get<Contact>('admin/contacts', id),
    delete: (id: number) => this.delete('admin/contacts', id),
  };

  static testimonials = {
    list: () => this.list<Testimonial>('admin/testimonials'),
    get: (id: number) => this.get<Testimonial>('admin/testimonials', id),
    create: (data: FormData | Partial<Testimonial>) => {
      if (data instanceof FormData) {
        return this.createWithFormData<Testimonial>('admin/testimonials', data);
      }
      return this.create<Testimonial>('admin/testimonials', data);
    },
    update: (id: number, data: FormData | Partial<Testimonial>) => {
      if (data instanceof FormData) {
        return this.updateWithFormData<Testimonial>('admin/testimonials', id, data);
      }
      return this.update<Testimonial>('admin/testimonials', id, data);
    },
    patch: (id: number, data: Partial<Testimonial>) => this.patch<Testimonial>('admin/testimonials', id, data),
    delete: (id: number) => this.delete('admin/testimonials', id),
  };

  static socialLinks = {
    list: () => this.list<SocialLink>('admin/sociallinks'),
    get: (id: number) => this.get<SocialLink>('admin/sociallinks', id),
    create: (data: Partial<SocialLink>) => this.create<SocialLink>('admin/sociallinks', data),
    update: (id: number, data: Partial<SocialLink>) => this.update<SocialLink>('admin/sociallinks', id, data),
    patch: (id: number, data: Partial<SocialLink>) => this.patch<SocialLink>('admin/sociallinks', id, data),
    delete: (id: number) => this.delete('admin/sociallinks', id),
  };

  static settings = {
    list: () => this.list<Setting>('admin/settings'),
    get: (id: number) => this.get<Setting>('admin/settings', id),
    create: (data: Partial<Setting>) => this.create<Setting>('admin/settings', data),
    update: (id: number, data: Partial<Setting>) => this.update<Setting>('admin/settings', id, data),
    patch: (id: number, data: Partial<Setting>) => this.patch<Setting>('admin/settings', id, data),
    delete: (id: number) => this.delete('admin/settings', id),
  };

  static services = {
    list: () => this.list<Service>('admin/services'),
    get: (id: number) => this.get<Service>('admin/services', id),
    create: (data: Partial<Service>) => this.create<Service>('admin/services', data),
    update: (id: number, data: Partial<Service>) => this.update<Service>('admin/services', id, data),
    patch: (id: number, data: Partial<Service>) => this.patch<Service>('admin/services', id, data),
    delete: (id: number) => this.delete('admin/services', id),
  };

  static adminUsers = {
    list: () => this.list<AdminUser>('admin-users'),
    get: (id: number) => this.get<AdminUser>('admin-users', id),
    create: (data: Partial<AdminUser>) => this.create<AdminUser>('admin-users', data),
    update: (id: number, data: Partial<AdminUser>) => this.update<AdminUser>('admin-users', id, data),
    patch: (id: number, data: Partial<AdminUser>) => this.patch<AdminUser>('admin-users', id, data),
    delete: (id: number) => this.delete('admin-users', id),
  };

  // File upload method
  static async uploadFile(endpoint: string, file: File, additionalData?: Record<string, string | number | boolean>): Promise<{ success: boolean; message: string; url?: string }> {
    const formData = new FormData();
    formData.append('image', file); // changed from 'file' to 'image'
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        const value = additionalData[key];
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          formData.append(key, value.toString());
        }
      });
    }

    const response = await authFetch(buildApiUrl(withSlash(endpoint)), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file to ${endpoint}`);
    }
    return response.json();
  }

  // Analytics endpoint
  static async getAnalytics(): Promise<DashboardStats> {
    const response = await authFetch(buildApiUrl('analytics'));
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    return response.json();
  }
}

export default AdminAPI;
