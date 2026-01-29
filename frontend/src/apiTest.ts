// Quick test to verify getApiUrl is working
import { getApiUrl } from './utils/apiHelper';

// Test the function
console.log('🔍 API URL Test:');
console.log('getApiUrl("/exams/test"):', getApiUrl('/exams/test'));
console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
