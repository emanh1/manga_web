import { useState, useEffect } from 'react';
import { getTitleDetails } from '../api/jikan';
import type { TTitle } from '../types/titles';
import toast from 'react-hot-toast';

export function useTitleDetails(malId?: number | string) {
  const [title, setTitle] = useState<TTitle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!malId) {
      setTitle(null);
      return;
    }
    setLoading(true);
    setError(null);
    getTitleDetails(Number(malId))
      .then((details) => {
        setTitle(details);
      })
      .catch((err) => {
        setTitle(null);
        setError(err instanceof Error ? err : new Error('Failed to fetch title details'));
        toast.error('Failed to fetch title details');
      })
      .finally(() => setLoading(false));
  }, [malId]);

  return { title, loading, error };
}
