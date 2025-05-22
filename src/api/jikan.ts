import axios from "axios";

const BASE_URL = "https://api.jikan.moe/v4";

export const searchManga = async (query: string) => {
  const response = await axios.get(`${BASE_URL}/manga`, {
    params: { q: query, limit: 10 },
  });
  return response.data.data;
};

export const getTopManga = async (limit = 10) => {
  const response = await axios.get(`${BASE_URL}/top/manga`, {
    params: { limit },
  });
  return response.data.data;
};

export const getMangaDetails = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/manga/${id}/full`);
  return response.data.data;
};