import axios from 'axios';
import type { AxiosInstance } from 'axios';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

console.log('🔧 API Configuration:');
console.log('  VITE_API_URL env:', import.meta.env.VITE_API_URL);
console.log('  Backend URL:', BACKEND_BASE_URL);
console.log('  Using API base URL:', API_BASE_URL);

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  // Use sessionStorage only for tab-specific auth
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  superAdminLogin: (email: string, password: string) =>
    apiClient.post('/auth/superadmin/login', { email, password }),

  adminLogin: (email: string, password: string, organizationName: string) =>
    apiClient.post('/auth/login', {
      email,
      password,
      organizationName,
    }),

  createAdmin: (data: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
    subscriptionPlan: string;
  }) => apiClient.post('/auth/superadmin/create-admin', data),
};

export default apiClient;
