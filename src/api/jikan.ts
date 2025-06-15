import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';
import type { TTitle, TTitleRecommendation } from "../types/titles";
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

export const searchTitle = async (query: string, limit = 10): Promise<TTitle[]> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/manga', {
      params: { q: query, limit: limit },
    });
    return response.data.data;
  });
};

export const getTopTitle = async (limit = 20, page = 1): Promise<TTitle[]> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/top/manga', {
      params: { limit, page },
    });
    return response.data.data;
  });
};

export const getTitleDetails = async (id: number): Promise<TTitle> => {
  return axiosWithRetry(async () => {
    const response = await api.get(`/manga/${id}/full`);
    return response.data.data;
  });
};

export const getTitleRecommendations = async (limit = 20): Promise<TTitleRecommendation[]> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/recommendations/manga');
    return response.data.data.slice(0, limit);
  });
};

export const getRandomTitle = async (): Promise<TTitle> => {
  return axiosWithRetry(async () => {
    const response = await api.get('/random/manga');
    return response.data.data;
  });
};

export const getTitlePictures = async (id: number) => {
  return axiosWithRetry(async () => {
    const response = await api.get(`/manga/${id}/pictures`);
    return response.data.data;
  });
};