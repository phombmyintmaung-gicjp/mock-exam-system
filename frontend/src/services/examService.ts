import api from './api';
import type { ExamSession, Passage, Question, ExamMode } from '@/types/exam';
import type { ViolationEntry } from '@/types/result';

export const fetchExamQuestions = async (category: string): Promise<Question[]> => {
  const res = await api.get('/exams/questions', { params: { category } });
  return res.data.data;
};

export const countQuestionsByTypes = async (
  category: string,
  questionTypes: string[],
): Promise<number> => {
  const res = await api.get('/exams/questions', { params: { category, per_page: 500 } });
  const raw = res.data.data as Array<{ question_type?: string }>;
  return raw.filter((q) => questionTypes.includes(q.question_type ?? '')).length;
};

export const countByQuestionType = async (category: string): Promise<Record<string, number>> => {
  const res = await api.get('/exams/questions', { params: { category, per_page: 500 } });
  const raw = res.data.data as Array<{ question_type?: string }>;
  const counts: Record<string, number> = {};
  for (const q of raw) {
    const type = q.question_type ?? '';
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
};

export const startExamSession = async (
  category: string,
  mode: ExamMode,
  questionTypes?: string[],
  questionCount?: number,
  linkedSessionId?: number,
): Promise<ExamSession> => {
  const body: Record<string, unknown> = { category, mode };
  if (questionTypes && questionTypes.length > 0) body.question_types = questionTypes;
  if (questionCount !== undefined) body.question_count = questionCount;
  if (linkedSessionId !== undefined) body.linked_session_id = linkedSessionId;
  const res = await api.post('/exams/sessions', body);
  const { session, questions } = res.data.data as {
    session: Record<string, unknown>;
    questions: Record<string, unknown>[];
  };

  return {
    sessionId: session.id as number,
    linkedSessionId: session.linked_session_id as number | undefined,
    timeLimitSeconds: session.time_limit_seconds as number,
    mode: session.mode as ExamMode,
    questions: questions.map((q) => {
      const raw = q as Record<string, unknown>;
      const passageRaw = raw.passage as Record<string, unknown> | null | undefined;
      const passage: Passage | undefined = passageRaw
        ? { id: passageRaw.id as number, title: passageRaw.title as string, content: passageRaw.content as string, level: passageRaw.level as Passage['level'] }
        : undefined;
      return {
        id: raw.id as number,
        text: raw.text as string,
        category: raw.category as string,
        questionType: raw.question_type as string | undefined,
        explanation: raw.explanation as string | undefined,
        passage,
        choices: ((raw.choices ?? []) as Record<string, unknown>[]).map((c) => ({
          id: c.id as number,
          text: c.text as string,
          isCorrect: c.is_correct as boolean | undefined,
        })),
      };
    }),
  };
};

export interface CombinedResult {
  totalScore: number;
  totalQuestions: number;
  percentage: number;
  status: 'pass' | 'fail';
  passingScore: number;
  part1ResultId: number | null;
  part2ResultId: number | null;
  part1Score: number | null;
  part1Total: number | null;
  part2Score: number | null;
  part2Total: number | null;
}

export const getCombinedResult = async (resultId: number): Promise<CombinedResult> => {
  const res = await api.get(`/results/${resultId}/combined`);
  const d = res.data.data as Record<string, unknown>;
  return {
    totalScore:     d.total_score as number,
    totalQuestions: d.total_questions as number,
    percentage:     d.percentage as number,
    status:         d.status as 'pass' | 'fail',
    passingScore:   d.passing_score as number,
    part1ResultId:  d.part1_result_id as number | null,
    part2ResultId:  d.part2_result_id as number | null,
    part1Score:     d.part1_score as number | null,
    part1Total:     d.part1_total as number | null,
    part2Score:     d.part2_score as number | null,
    part2Total:     d.part2_total as number | null,
  };
};

export const submitExam = async (
  sessionId: number,
  answers: Record<number, number>,
  questionIds: number[],
  timings?: Record<number, number>,
  submittedBy?: string,
  violationLog?: ViolationEntry[],
): Promise<{ id: number }> => {
  const formatted = questionIds.map((qid) => ({
    question_id: qid,
    choice_id: answers[qid] ?? null,
    time_taken_seconds: timings?.[qid] ?? null,
  }));
  const res = await api.post(`/exams/sessions/${sessionId}/submit`, {
    answers: formatted,
    submitted_by: submittedBy ?? 'manual',
    violation_log: violationLog ?? [],
  });
  return { id: (res.data.data as { id: number }).id };
};
