import { useState, useEffect } from 'react';
import type { ExamResult } from '@/types/result';
import { getResult } from '@/services/resultService';

const useResults = (resultId: number) => {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getResult(resultId)
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [resultId]);

  return { result, isLoading, error };
};

export default useResults;
