import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';
import type { TManga, TMangaDetails, TMangaRecommendation } from "../types/manga";

const BASE_URL = "https://api.jikan.moe/v4";

const api = setupCache(axios.create({ baseURL: BASE_URL }), {
  ttl: 1000 * 60 * 5,
  methods: ['get'],
  cacheTakeover: false,
  generateKey: (request) => {
    const params = new URLSearchParams(request.params);
    return `${request.url}?${params.toString()}`;
  },
});

export const searchManga = async (query: string, limit = 10): Promise<TManga[]> => {
  const response = await api.get('/manga', {
    params: { q: query, limit: limit },
  });
  return response.data.data;
};

export const getTopManga = async (limit = 20): Promise<TManga[]> => {
  const response = await api.get('/top/manga', {
    params: { limit },
  });
  return response.data.data;
};

export const getMangaDetails = async (id: number): Promise<TMangaDetails> => {
  const response = await api.get(`/manga/${id}/full`);
  return response.data.data;
};

export const getMangaRecommendations = async (limit = 20): Promise<TMangaRecommendation[]> => {
  const response = await api.get('/recommendations/manga', {
    params: { limit },
  });
  return response.data.data;
};