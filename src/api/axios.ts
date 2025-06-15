import axios, { type AxiosRequestConfig } from 'axios';
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
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
  uploadChapter: async (
    formData: FormData,
    onUploadProgress?: AxiosRequestConfig['onUploadProgress']
  ) => {
    const response = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }
};


export const titleAPI = {
  getChapter: async (titleId: string, chapterId: string) => {
    const response = await axiosInstance.get(`/titles/${titleId}/${chapterId}`);
    return response.data;
  },
  getChapters: async (titleId: string) => {
    const response = await axiosInstance.get(`/titles/${titleId}/chapters`);
    return response.data;
  },
  getAllPendingChapters: async () => {
    const response = await axiosInstance.get('/titles/pending_chapters');
    return response.data;
  },
  getAllRejectedChapters: async () => {
    const response = await axiosInstance.get('/titles/rejected_chapters');
    return response.data;
  },
  reviewChapter: async (titleId: string | number, chapterId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    const response = await axiosInstance.post(
      `/titles/${titleId}/${chapterId}/review?status=${status}&rejectionReason=${encodeURIComponent(rejectionReason || '')}`,
    );
    return response.data;
  },
  previewChapter: async (titleId: string, chapterId: string) => {
    const response = await axiosInstance.get(`/titles/${titleId}/${chapterId}/preview`);
    return response.data;
  }
};

export async function axiosWithRetry<T>(requestFn: () => Promise<T>, maxRetries = 3, retryDelay = 1000): Promise<T> {
  return retryOperation(requestFn, maxRetries, retryDelay);
}

export default axiosInstance;
