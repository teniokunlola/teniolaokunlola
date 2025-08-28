// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Fallback to relative /api when API_BASE_URL is not defined
  if (!API_BASE_URL) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `/api/${cleanEndpoint}`;
  }
  // If API_BASE_URL is a relative path (starts with /), use it directly
  if (API_BASE_URL.startsWith('/')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // For absolute URLs (like localhost), remove /api suffix if present to avoid duplication
  const baseUrl = API_BASE_URL.endsWith('/api') || API_BASE_URL.endsWith('/api/')
    ? API_BASE_URL.replace(/\/api\/?$/, '')
    : API_BASE_URL.replace(/\/$/, '');

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${baseUrl}/api/${cleanEndpoint}`;
};

