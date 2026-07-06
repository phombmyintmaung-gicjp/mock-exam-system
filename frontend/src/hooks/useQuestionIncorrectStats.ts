import { useState, useEffect } from 'react';
import type { QuestionIncorrectStat } from '@/types/analytics';
import { getIncorrectCounts } from '@/services/analyticsService';

export interface QuestionIncorrectCategoryGroup {
  category: string;
  questions: QuestionIncorrectStat[];
}

// Fetches cross-user incorrect-answer counts per question and groups them by category.
const useQuestionIncorrectStats = () => {
  const [groups, setGroups]       = useState<QuestionIncorrectCategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getIncorrectCounts()
      .then((stats) => {
        if (cancelled) return;
        const byCategory = new Map<string, QuestionIncorrectStat[]>();
        for (const stat of stats) {
          const list = byCategory.get(stat.category) ?? [];
          list.push(stat);
          byCategory.set(stat.category, list);
        }
        const sorted = [...byCategory.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, questions]) => ({ category, questions }));
        setGroups(sorted);
      })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { groups, isLoading, error };
};

export default useQuestionIncorrectStats;
