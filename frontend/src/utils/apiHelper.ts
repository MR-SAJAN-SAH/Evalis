/**
 * Helper function to build API URLs
 * Handles both development (relative paths) and production (full URLs)
 * Tries multiple sources for the backend URL:
 * 1. import.meta.env.VITE_API_URL (set at build time)
 * 2. window.__EVALIS_API_BASE__ (set in index.html)
 * 3. Falls back to http://localhost:3000 for development
 */
export const getApiUrl = (endpoint: string): string => {
  // Try to get backend URL from multiple sources
  const backendUrl = 
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && (window as any).__EVALIS_API_BASE__) ||
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
