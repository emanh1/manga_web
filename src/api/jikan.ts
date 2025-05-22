import axios from "axios";
import type { TManga, TMangaDetails, TMangaRecommendation } from "../types/manga";

const BASE_URL = "https://api.jikan.moe/v4";

export const searchManga = async (query: string): Promise<TManga[]> => {
  const response = await axios.get(`${BASE_URL}/manga`, {
    params: { q: query, limit: 10 },
  });
  return response.data.data;
};

export const getTopManga = async (limit = 10): Promise<TManga[]> => {
  const response = await axios.get(`${BASE_URL}/top/manga`, {
    params: { limit },
  });
  return response.data.data;
};

export const getMangaDetails = async (id: number): Promise<TMangaDetails> => {
  const response = await axios.get(`${BASE_URL}/manga/${id}/full`);
  return response.data.data;
};