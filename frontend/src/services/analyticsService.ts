import api from './api';
import type { CategoryStat, WeakArea, ScoreTrend, RetryStats, DifficultyStats, QuestionIncorrectStat } from '@/types/analytics';

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

export const getDifficultQuestions = async (): Promise<DifficultyStats[]> => {
  const res = await api.get('/admin/analytics/difficult-questions');
  return (res.data.data ?? []).map((d: Record<string, unknown>) => ({
    questionId:   d.questionId as number,
    questionText: d.questionText as string,
    category:     d.category as string,
    questionType: (d.questionType as string | null) ?? null,
    attemptCount: d.attemptCount as number,
    correctRate:  d.correctRate as number,
  }));
};

export const getIncorrectCounts = async (): Promise<QuestionIncorrectStat[]> => {
  const res = await api.get('/analytics/incorrect-counts');
  return res.data.data ?? [];
};

export const getScoreTrends = async (): Promise<ScoreTrend[]> => {
  const res = await api.get('/analytics/score-trend');
  return (res.data.data ?? []).map((d: Record<string, unknown>) => ({
    date: d.completed_at as string,
    score: d.percentage as number,
    category: '',
  }));
};
