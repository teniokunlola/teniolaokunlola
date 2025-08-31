import { buildApiUrl } from './config';

// Types for public API responses (same as backend models but for public consumption)
export interface PublicProject {
  id: number;
  title: string;
  description: string;
  image?: string;
  url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PublicSkill {
  id: number;
  name: string;
  proficiency: number;
  created_at: string;
}

export interface PublicExperience {
  id: number;
  job_title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
  created_at: string;
}

export interface PublicEducation {
  id: number;
  degree: string;
  institution: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface PublicAbout {
  id: number;
  full_name: string;
  title? : string;
  profile_picture?: string;
  summary: string;
  email?: string;
  phone_number?: string;
  address?: string;
  resume?: string;
}

export interface PublicTestimonial {
  id: number;
  name: string;
  feedback: string;
  image?: string;
  created_at: string;
  company?: string;
  position?: string;
  rating?: number;
}

export interface PublicSocialLink {
  id: number;
  platform: string;
  url: string;
  created_at: string;
}

export interface PublicSetting {
  id: number;
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
  created_at: string;
  updated_at: string;
}

export interface PublicService {
  id: number;
  name: string;
  description: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Helper to ensure trailing slash
function withSlash(url: string): string {
  return url.endsWith('/') ? url : url + '/';
}

// Public API class for client-side consumption
export class PublicAPI {
  // Generic fetch method for public endpoints
  private static async fetchPublic<T>(endpoint: string): Promise<T> {
    const response = await fetch(buildApiUrl(withSlash(endpoint)));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  // Generic post method (for contact form)
  private static async postPublic<T>(endpoint: string, data: ContactFormData): Promise<T> {
    const response = await fetch(buildApiUrl(withSlash(endpoint)), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to submit to ${endpoint}`);
    }
    return response.json();
  }

  // Public API endpoints (read-only, no authentication required)
  static projects = {
    list: () => this.fetchPublic<PublicProject[]>('projects'),
  };

  static skills = {
    list: () => this.fetchPublic<PublicSkill[]>('skills'),
  };

  static experience = {
    list: () => this.fetchPublic<PublicExperience[]>('experiences'),
  };

  static education = {
    list: () => this.fetchPublic<PublicEducation[]>('educations'),
  };

  static about = {
    list: () => this.fetchPublic<PublicAbout[]>('about'),
  };

  static testimonials = {
    list: () => this.fetchPublic<PublicTestimonial[]>('testimonials'),
  };

  static socialLinks = {
    list: () => this.fetchPublic<PublicSocialLink[]>('sociallinks'),
  };

  static settings = {
    list: () => this.fetchPublic<PublicSetting[]>('settings'),
  };

  static services = {
    list: () => this.fetchPublic<PublicService[]>('services'),
  };

  // Contact form submission
  static contact = {
    create: (data: ContactFormData) => this.postPublic<{ message: string }>('contacts', data),
  };
}

export default PublicAPI;
