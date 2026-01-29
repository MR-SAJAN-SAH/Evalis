/**
 * Get the full API URL for a given endpoint
 * Handles both development (relative paths) and production (full URLs)
 */
export const getApiUrl = (endpoint: string): string => {
  const backend = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // If backend is a full URL (http/https), construct full path
  if (backend.startsWith('http')) {
    // Ensure endpoint starts with /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${backend}/api${path}`;
  }
  
  // For development with relative paths, just return the endpoint
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};
