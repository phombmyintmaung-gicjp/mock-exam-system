import api from './api';
import type { ExamSession, Question, ExamMode } from '@/types/exam';

export const fetchExamQuestions = async (category: string): Promise<Question[]> => {
  const res = await api.get('/exams/questions', { params: { category } });
  return res.data.data;
};

export const startExamSession = async (
  category: string,
  mode: ExamMode,
): Promise<ExamSession> => {
  const res = await api.post('/exams/sessions', { category, mode });
  const { session, questions } = res.data.data as {
    session: Record<string, unknown>;
    questions: Record<string, unknown>[];
  };

  return {
    sessionId: session.id as number,
    timeLimitSeconds: session.time_limit_seconds as number,
    mode: session.mode as ExamMode,
    questions: questions.map((q) => ({
      id: q.id as number,
      text: q.text as string,
      difficulty: q.difficulty as Question['difficulty'],
      category: q.category as string,
      explanation: q.explanation as string | undefined,
      choices: ((q.choices ?? []) as Record<string, unknown>[]).map((c) => ({
        id: c.id as number,
        text: c.text as string,
        isCorrect: c.is_correct as boolean | undefined,
      })),
    })),
  };
};

export const submitExam = async (
  sessionId: number,
  answers: Record<number, number>,
  questionIds: number[],
): Promise<{ id: number }> => {
  const formatted = questionIds.map((qid) => ({
    question_id: qid,
    choice_id: answers[qid] ?? null,
  }));
  const res = await api.post(`/exams/sessions/${sessionId}/submit`, { answers: formatted });
  return { id: (res.data.data as { id: number }).id };
};
