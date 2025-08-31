// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // If API_BASE_URL is a relative path (starts with /), use it directly
  if (API_BASE_URL.startsWith('/')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // For absolute URLs, ensure clean endpoint
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${baseUrl}/${cleanEndpoint}`;
};

