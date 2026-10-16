import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Tokens live in the Zustand persist store; read/write them there so the in-memory
// store and localStorage never disagree (a mismatch is what caused the login-page flicker).
function readAuth(): { accessToken?: string; refreshToken?: string } {
  try {
    return JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state ?? {};
  } catch {
    return {};
  }
}

function hardLogout() {
  try {
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('access_token');
  } catch { /* ignore */ }
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login?expired=1';
  }
}

// One refresh at a time: if several requests fail with 401 together (the dashboard
// fires two), they all wait for the same refresh instead of each redirecting.
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    refreshing = (async () => {
      const { refreshToken } = readAuth();
      if (!refreshToken) throw new Error('no refresh token');
      const { data } = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh: refreshToken });
      // Rotation is on server-side: store the new refresh token too, or the next refresh fails.
      useAuthStore.setState({ accessToken: data.access, refreshToken: data.refresh ?? refreshToken });
      return data.access as string;
    })().finally(() => { refreshing = null; });
  }
  return refreshing;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    if (typeof window === 'undefined') return Promise.reject(error);
    // Don't try to refresh a failed login or a failed refresh itself.
    if (original.url?.includes('/auth/login') || original.url?.includes('/auth/token/refresh')) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      const access = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch {
      hardLogout();
      return Promise.reject(error);
    }
  }
);
