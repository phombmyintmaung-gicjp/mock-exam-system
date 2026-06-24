import { useState, useEffect } from 'react';
import type { WeakArea, RetryStats } from '@/types/analytics';
import { getWeakAreas, getRetryStats } from '@/services/analyticsService';

export interface WeakAreaWithRetry extends WeakArea {
  attemptCount: number;
  bestScore: number;
  latestScore: number;
}

const useWeakAreas = () => {
  const [weakAreas, setWeakAreas] = useState<WeakAreaWithRetry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    Promise.all([getWeakAreas(), getRetryStats()])
      .then(([areas, retryStats]: [WeakArea[], RetryStats[]]) => {
        if (cancelled) return;
        const retryMap = new Map(retryStats.map((r) => [r.category, r]));
        const merged = areas.map((area) => {
          const retry = retryMap.get(area.category);
          return {
            ...area,
            attemptCount: retry?.attemptCount ?? 1,
            bestScore:    retry?.bestScore    ?? area.accuracy,
            latestScore:  retry?.latestScore  ?? area.accuracy,
          };
        });
        setWeakAreas(merged);
      })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { weakAreas, isLoading, error };
};

export default useWeakAreas;
