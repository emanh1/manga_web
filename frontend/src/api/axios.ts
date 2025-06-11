import axios from 'axios';
import { retryOperation } from '../utils/retry';

export function getbackendUrl() {
  return localStorage.getItem('backendUrl') || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
}

export function setbackendUrl(url: string) {
  localStorage.setItem('backendUrl', url);
}

const BACKEND_URL = getbackendUrl();

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

window.addEventListener('storage', (event) => {
  if (event.key === 'backendUrl') {
    axiosInstance.defaults.baseURL = getbackendUrl();
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      window.location.href = '/';
    }

    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username: string, email: string, password: string) => {
    const response = await axiosInstance.post('/auth/register', { username, email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
};

export const uploadAPI = {
  uploadChapter: async (formData: FormData) => {
    const response = await axiosInstance.post('/manga/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getChapter: async (mangaId: string, chapterId: string) => {
    const response = await axiosInstance.get(`/manga/${mangaId}/${chapterId}`);
    return response.data;
  },
  getChapters: async (mangaId: string) => {
    const response = await axiosInstance.get(`/manga/${mangaId}/chapters`);
    return response.data;
  },
  getAllPendingChapters: async () => {
    const response = await axiosInstance.get('/manga/admin/pending');
    return response.data;
  },
  getAllRejectedChapters: async () => {
    const response = await axiosInstance.get('/manga/admin/rejected');
    return response.data;
  },
  reviewChapter: async (id: number, status: 'approved' | 'rejected', rejectionReason?: string, token?: string) => {
    const response = await axiosInstance.post(
      `/manga/admin/review/${id}`,
      { status, rejectionReason },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },
  previewChapter: async (mangaId: string, chapterId: string) => {
    const response = await axiosInstance.get(`/manga/${mangaId}/${chapterId}/preview`);
    return response.data;
  }
};

export async function axiosWithRetry<T>(requestFn: () => Promise<T>, maxRetries = 3, retryDelay = 1000): Promise<T> {
  return retryOperation(requestFn, maxRetries, retryDelay);
}

export default axiosInstance;
