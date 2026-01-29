/**
 * Helper function to build API URLs
 * Handles both development (relative paths) and production (full URLs with VITE_API_URL)
 */
export const getApiUrl = (endpoint: string): string => {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // If backendUrl is a full URL (http/https), use it with the endpoint
  if (backendUrl.startsWith('http')) {
    return `${backendUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }
  
  // Otherwise use relative path for development
  return `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};
