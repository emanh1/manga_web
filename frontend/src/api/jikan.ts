import axios, { AxiosError } from "axios";
import { setupCache } from 'axios-cache-interceptor';
import type { TManga, TMangaDetails, TMangaRecommendation } from "../types/manga";

const BASE_URL = "https://api.jikan.moe/v4";

const MIN_DELAY_MS = 1000;
const MAX_RETRIES = 3;

const api = setupCache(axios.create({ baseURL: BASE_URL }), {
  ttl: 1000 * 60 * 5,
  methods: ['get'],
  cacheTakeover: false,
  generateKey: (request) => {
    const params = new URLSearchParams(request.params);
    return `${request.url}?${params.toString()}`;
  },
});

let lastRequestTime = 0;

api.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY_MS - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return config;
});

const handleApiRequest = async <T>(requestFn: () => Promise<T>, retryCount = 0): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 429) {
      if (retryCount >= MAX_RETRIES) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return handleApiRequest(requestFn, retryCount + 1);
    }
    throw error;
  }
};

export const searchManga = async (query: string, limit = 10): Promise<TManga[]> => {
  return handleApiRequest(async () => {
    const response = await api.get('/manga', {
      params: { q: query, limit: limit },
    });
    return response.data.data;
  });
};

export const getTopManga = async (limit = 20): Promise<TManga[]> => {
  return handleApiRequest(async () => {
    const response = await api.get('/top/manga', {
      params: { limit },
    });
    return response.data.data;
  });
};

export const getMangaDetails = async (id: number): Promise<TMangaDetails> => {
  return handleApiRequest(async () => {
    const response = await api.get(`/manga/${id}/full`);
    return response.data.data;
  });
};

export const getMangaRecommendations = async (limit = 20): Promise<TMangaRecommendation[]> => {
  return handleApiRequest(async () => {
    const response = await api.get('/recommendations/manga');
    return response.data.data.slice(0, limit);
  });
};

export const getRandomManga = async (): Promise<TMangaDetails> => {
  return handleApiRequest(async () => {
    const response = await api.get('/random/manga');
    return response.data.data;
  });
};