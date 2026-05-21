import { useState, useEffect } from 'react';
import type { WeakArea } from '@/types/analytics';
import { getWeakAreas } from '@/services/analyticsService';

const useWeakAreas = () => {
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getWeakAreas()
      .then((areas) => { if (!cancelled) setWeakAreas(areas); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { weakAreas, isLoading, error };
};

export default useWeakAreas;
