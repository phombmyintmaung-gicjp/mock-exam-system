import api from './api';
import type { ExamResult, HistoryItem, PassFailStatus } from '@/types/result';

export const getResult = async (resultId: number): Promise<ExamResult> => {
  const res = await api.get(`/results/${resultId}`);
  return mapResult(res.data.data as Record<string, unknown>);
};

export const getResultHistory = async (): Promise<HistoryItem[]> => {
  const res = await api.get('/results');
  return (res.data.data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id as number,
    category: ((d.session as Record<string, unknown> | null)?.category as string) ?? '',
    score: d.score as number,
    totalQuestions: d.total_questions as number,
    status: d.status as PassFailStatus,
    completedAt: d.completed_at as string,
  }));
};

export const exportResultPdf = async (resultId: number): Promise<void> => {
  const res = await api.get(`/results/${resultId}/export`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `result-${resultId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

function mapResult(d: Record<string, unknown>): ExamResult {
  const session = d.session as Record<string, unknown> | null;
  const records = (d.answer_records ?? []) as Record<string, unknown>[];

  return {
    id: d.id as number,
    sessionId: d.session_id as number,
    userId: d.user_id as number,
    category: (session?.category as string) ?? '',
    score: d.score as number,
    totalQuestions: d.total_questions as number,
    passingScore: d.passing_score as number,
    status: d.status as PassFailStatus,
    completedAt: d.completed_at as string,
    answers: records.map((ar) => {
      const q = ar.question as Record<string, unknown> | null;
      const choices = (q?.choices ?? []) as Record<string, unknown>[];
      const correctChoice = choices.find((c) => c.is_correct);
      return {
        questionId: ar.question_id as number,
        questionText: (q?.text as string) ?? '',
        explanation: (q?.explanation as string) ?? '',
        choices: choices.map((c) => ({ id: c.id as number, text: c.text as string })),
        selectedChoiceId: ar.selected_choice_id as number | null,
        correctChoiceId: (correctChoice?.id as number) ?? 0,
        isCorrect: ar.is_correct as boolean,
      };
    }),
  };
}
