import { useState, useEffect, useCallback } from 'react';
import type { AdminQuestion } from '@/types/exam';
import { getAdminQuestions } from '@/services/questionService';

const useQuestions = (params?: Record<string, string>) => {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminQuestions(params);
      setQuestions(res.data);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, isLoading, error, refetch: fetchQuestions };
};

export default useQuestions;
