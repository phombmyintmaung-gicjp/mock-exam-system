import api from './api';
import type { CategoryStat, WeakArea, ScoreTrend, RetryStats } from '@/types/analytics';

export const getCategoryStats = async (): Promise<CategoryStat[]> => {
  const res = await api.get('/analytics/category-stats');
  return (res.data.data ?? []).map((d: Record<string, unknown>) => ({
    category: d.category as string,
    totalAttempts: d.total as number,
    passCount: d.pass as number,
    failCount: d.fail as number,
    passRate: (d.total as number) > 0
      ? Math.round(((d.pass as number) / (d.total as number)) * 100)
      : 0,
  }));
};

export const getWeakAreas = async (): Promise<WeakArea[]> => {
  const res = await api.get('/analytics/weak-areas');
  return (res.data.data ?? []).map((d: Record<string, unknown>) => ({
    category: d.category as string,
    wrongCount: (d.total as number) - (d.correct as number),
    totalAttempted: d.total as number,
    accuracy: d.accuracy as number,
  }));
};

export const getRetryStats = async (): Promise<RetryStats[]> => {
  const res = await api.get('/analytics/retry-stats');
  return (res.data.data ?? []).map((d: Record<string, unknown>) => ({
    category:     d.category as string,
    attemptCount: d.attempt_count as number,
    bestScore:    d.best_score as number,
    latestScore:  d.latest_score as number,
  }));
};

export const getScoreTrends = async (): Promise<ScoreTrend[]> => {
  const res = await api.get('/analytics/score-trend');
  return (res.data.data ?? []).map((d: Record<string, unknown>) => ({
    date: d.completed_at as string,
    score: d.percentage as number,
    category: '',
  }));
};
