import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  // Try sessionStorage first (for logged-in state), then localStorage as fallback
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
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
