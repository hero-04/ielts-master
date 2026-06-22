import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = authData?.state?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    if (typeof window === 'undefined') return Promise.reject(error);
    const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const refresh = authStorage?.state?.refreshToken;
    if (!refresh) {
      window.location.href = '/login';
      return Promise.reject(error);
    }
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh });
      const authStorage2 = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      if (authStorage2.state) authStorage2.state.accessToken = data.access;
      localStorage.setItem('auth-storage', JSON.stringify(authStorage2));
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch {
      const authStorage3 = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      if (authStorage3.state) authStorage3.state.isAuthenticated = false;
      localStorage.setItem('auth-storage', JSON.stringify(authStorage3));
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);
