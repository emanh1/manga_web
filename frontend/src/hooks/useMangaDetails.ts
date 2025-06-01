import { useState, useEffect } from 'react';
import { getMangaDetails } from '../api/jikan';
import type { TManga } from '../types/manga';
import toast from 'react-hot-toast';

export function useMangaDetails(malId?: number | string) {
  const [manga, setManga] = useState<TManga | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!malId) {
      setManga(null);
      return;
    }
    setLoading(true);
    setError(null);
    getMangaDetails(Number(malId))
      .then((details) => {
        setManga(details);
      })
      .catch((err) => {
        setManga(null);
        setError(err instanceof Error ? err : new Error('Failed to fetch manga details'));
        toast.error('Failed to fetch manga details');
      })
      .finally(() => setLoading(false));
  }, [malId]);

  return { manga, loading, error };
}
