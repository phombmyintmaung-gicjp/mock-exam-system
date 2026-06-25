import api from './api';
import type {
  AdminCustomExamResult,
  AdminCustomExamResultDetail,
  CustomExamLandingInfo,
  CustomExamResult,
  CustomSetDetail,
  CustomSetImportResult,
  CustomSetSummary,
  MyCustomExamAttempt,
  ViolationEntry,
} from '@/types/customSet';
import type { Question } from '@/types/exam';

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function listCustomSets(): Promise<CustomSetSummary[]> {
  const res = await api.get('/admin/custom-sets');
  return res.data.data.map(mapSummary);
}

export async function getCustomSet(id: number): Promise<CustomSetDetail> {
  const res = await api.get(`/admin/custom-sets/${id}`);
  return mapDetail(res.data.data);
}

export async function createCustomSet(data: {
  name: string;
  description?: string;
  time_limit_seconds: number;
  passing_score: number;
}): Promise<CustomSetSummary> {
  const res = await api.post('/admin/custom-sets', data);
  return res.data.data;
}

export async function updateCustomSet(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    time_limit_seconds?: number;
    passing_score?: number;
    is_active?: boolean;
  },
): Promise<CustomSetSummary> {
  const res = await api.put(`/admin/custom-sets/${id}`, data);
  return res.data.data;
}

export async function deleteCustomSet(id: number): Promise<void> {
  await api.delete(`/admin/custom-sets/${id}`);
}

export async function addQuestionToSet(setId: number, questionId: number): Promise<CustomSetDetail> {
  const res = await api.post(`/admin/custom-sets/${setId}/questions`, { question_id: questionId });
  return mapDetail(res.data.data);
}

export async function removeQuestionFromSet(setId: number, questionId: number): Promise<void> {
  await api.delete(`/admin/custom-sets/${setId}/questions/${questionId}`);
}

export async function createQuestionInSet(
  setId: number,
  data: {
    text: string;
    explanation?: string;
    choices: { text: string; is_correct: boolean }[];
  },
): Promise<void> {
  await api.post(`/admin/custom-sets/${setId}/questions/create`, data);
}

export async function reorderSetQuestions(setId: number, questionIds: number[]): Promise<void> {
  await api.put(`/admin/custom-sets/${setId}/reorder`, { question_ids: questionIds });
}

export async function importCustomSetFromExcel(formData: FormData): Promise<CustomSetImportResult> {
  const res = await api.post('/admin/custom-sets/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const d = res.data.data;
  return {
    set:      mapDetail(d.set),
    imported: d.imported,
    skipped:  d.skipped,
    errors:   d.errors,
  };
}

export async function getSetResults(setId: number): Promise<AdminCustomExamResult[]> {
  const res = await api.get(`/admin/custom-sets/${setId}/results`);
  return res.data.data.map(
    (r: Record<string, unknown>): AdminCustomExamResult => ({
      id: r.id as number,
      user: r.user as AdminCustomExamResult['user'],
      score: r.score as number,
      totalQuestions: r.total_questions as number,
      passingScore: r.passing_score as number,
      status: r.status as 'pass' | 'fail',
      submittedBy: (r.submitted_by as string) ?? 'manual',
      completedAt: r.completed_at as string,
    }),
  );
}

export async function getSetResultDetail(setId: number, resultId: number): Promise<AdminCustomExamResultDetail> {
  const res = await api.get(`/admin/custom-sets/${setId}/results/${resultId}`);
  const d = res.data.data;
  return {
    id: d.id,
    setId: d.set_id,
    submittedBy: (d.submitted_by as string) ?? 'manual',
    violationLog: (d.violation_log as ViolationEntry[]) ?? [],
    user: d.user as AdminCustomExamResult['user'],
    score: d.score,
    totalQuestions: d.total_questions,
    passingScore: d.passing_score,
    status: d.status as 'pass' | 'fail',
    completedAt: d.completed_at,
    answerRecords: (d.answer_records as Record<string, unknown>[]).map((ar) => ({
      questionId: ar.question_id as number,
      questionText: ar.question_text as string,
      explanation: ar.explanation as string | null,
      isCorrect: ar.is_correct as boolean,
      selectedChoiceId: ar.selected_choice_id as number | null,
      choices: (ar.choices as Record<string, unknown>[]).map((c) => ({
        id: c.id as number,
        text: c.text as string,
        isCorrect: c.is_correct as boolean,
      })),
    })),
  };
}

// ─── Employee ─────────────────────────────────────────────────────────────────

export async function getCustomSetBySlug(slug: string): Promise<CustomExamLandingInfo> {
  const res = await api.get(`/custom-exams/${slug}`);
  const d = res.data.data;
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    slug: d.slug,
    timeLimitSeconds: d.time_limit_seconds,
    passingScore: d.passing_score,
    questionCount: d.question_count,
  };
}

export async function startCustomExamSession(slug: string): Promise<{
  session: { id: number; setId: number; setName: string; timeLimitSeconds: number; passingScore: number };
  questions: Question[];
}> {
  const res = await api.post(`/custom-exams/${slug}/sessions`);
  const { session, questions } = res.data.data;
  return {
    session: {
      id: session.id,
      setId: session.set_id,
      setName: session.set_name,
      timeLimitSeconds: session.time_limit_seconds,
      passingScore: session.passing_score,
    },
    questions: (questions as Record<string, unknown>[]).map((q) => ({
      id: q.id as number,
      text: q.text as string,
      category: q.category as string,
      explanation: q.explanation as string | undefined,
      choices: (q.choices as Record<string, unknown>[]).map((c) => ({
        id: c.id as number,
        text: c.text as string,
      })),
    })),
  };
}

export async function submitCustomExamSession(
  sessionId: number,
  answers: Record<number, number>,
  questionIds: number[],
  submittedBy?: string,
  violationLog?: ViolationEntry[],
): Promise<{ id: number }> {
  const formatted = questionIds.map((qid) => ({
    question_id: qid,
    choice_id: answers[qid] ?? null,
  }));
  const res = await api.post(`/custom-exams/sessions/${sessionId}/submit`, {
    answers: formatted,
    submitted_by: submittedBy ?? 'manual',
    violation_log: violationLog ?? [],
  });
  return { id: res.data.data.id };
}

export async function getMyCustomExamHistory(slug: string): Promise<MyCustomExamAttempt[]> {
  const res = await api.get(`/custom-exams/${slug}/my-results`);
  return (res.data.data as Record<string, unknown>[]).map((r) => ({
    id: r.id as number,
    score: r.score as number,
    totalQuestions: r.total_questions as number,
    passingScore: r.passing_score as number,
    status: r.status as 'pass' | 'fail',
    completedAt: r.completed_at as string,
  }));
}

export async function getCustomExamResult(resultId: number): Promise<CustomExamResult> {
  const res = await api.get(`/custom-exams/results/${resultId}`);
  const d = res.data.data;
  return {
    id: d.id,
    setId: d.set_id,
    setName: d.set_name,
    score: d.score,
    totalQuestions: d.total_questions,
    passingScore: d.passing_score,
    status: d.status,
    completedAt: d.completed_at,
    answerRecords: d.answer_records?.map((ar: Record<string, unknown>) => ({
      questionId: ar.question_id,
      questionText: ar.question_text,
      explanation: ar.explanation,
      isCorrect: ar.is_correct,
      selectedChoiceId: ar.selected_choice_id,
      choices: ar.choices,
    })),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSummary(d: Record<string, unknown>): CustomSetSummary {
  return {
    id: d.id as number,
    name: d.name as string,
    description: d.description as string | null,
    slug: d.slug as string,
    timeLimitSeconds: d.time_limit_seconds as number,
    passingScore: d.passing_score as number,
    isActive: d.is_active as boolean,
    questionCount: d.question_count as number,
    createdAt: d.created_at as string,
  };
}

function mapDetail(d: Record<string, unknown>): CustomSetDetail {
  return {
    id: d.id as number,
    name: d.name as string,
    description: d.description as string | null,
    slug: d.slug as string,
    timeLimitSeconds: d.time_limit_seconds as number,
    passingScore: d.passing_score as number,
    isActive: d.is_active as boolean,
    createdAt: (d.created_at as string) ?? '',
    questions: ((d.questions as Record<string, unknown>[]) ?? []).map((q) => ({
      id: q.id as number,
      text: q.text as string,
      category: q.category as string,
      explanation: q.explanation as string | null,
      sortOrder: q.sort_order as number,
      choices: ((q.choices as Record<string, unknown>[]) ?? []).map((c) => ({
        id: c.id as number,
        text: c.text as string,
        isCorrect: c.is_correct as boolean,
        order: c.order as number,
      })),
    })),
  };
}
