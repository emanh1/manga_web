import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';
import type { TManga, TMangaRecommendation } from "../types/manga";
import { axiosWithRetry } from "./axios";

const BASE_URL = "https://api.jikan.moe/v4";

const api = setupCache(axios.create({ baseURL: BASE_URL }), {
  ttl: 1000 * 60 * 15,
  methods: ['get'],
  cacheTakeover: false,
  generateKey: (request) => {
    const params = new URLSearchParams(request.params);
    return `${request.url}?${params.toString()}`;
  },
});

export const searchManga = async (query: string, limit = 10): Promise<TManga[]> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/manga', {
      params: { q: query, limit: limit },
    });
    return response.data.data;
  });
};

export const getTopManga = async (limit = 20): Promise<TManga[]> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/top/manga', {
      params: { limit },
    });
    return response.data.data;
  });
};

export const getMangaDetails = async (id: number): Promise<TManga> => {
  return axiosWithRetry(async () => {
    const response = await api.get(`/manga/${id}/full`);
    return response.data.data;
  });
};

export const getMangaRecommendations = async (limit = 20): Promise<TMangaRecommendation[]> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/recommendations/manga');
    return response.data.data.slice(0, limit);
  });
};

export const getRandomManga = async (): Promise<TManga> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/random/manga');
    return response.data.data;
  });
};