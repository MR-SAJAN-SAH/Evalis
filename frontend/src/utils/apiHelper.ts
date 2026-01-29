/**
 * Helper function to build API URLs
 * Handles both development (relative paths) and production (full URLs with VITE_API_URL)
 */
export const getApiUrl = (endpoint: string): string => {
  // Try to get backend URL from environment variable
  // VITE_API_URL is injected at build time by Vite
  const backendUrl = import.meta.env.VITE_API_URL || 
                     (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) ||
                     'http://localhost:3000';
  
  console.log('🔗 API Helper - Backend URL:', backendUrl, 'Endpoint:', endpoint);
  
  // If backendUrl is a full URL (http/https), use it with the endpoint
  if (backendUrl.startsWith('http')) {
    const fullUrl = `${backendUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    console.log('✅ Full API URL:', fullUrl);
    return fullUrl;
  }
  
  // Otherwise use relative path for development
  const relativeUrl = `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  console.log('📍 Relative API URL:', relativeUrl);
  return relativeUrl;
};
