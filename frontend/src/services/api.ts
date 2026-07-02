import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_PATH, APP_BASE_PATH } from '@/constants';

const api = axios.create({
  baseURL: `${API_BASE_PATH}/`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.href = `${APP_BASE_PATH}/login`;
    }
    return Promise.reject(error);
  }
);

export default api;
