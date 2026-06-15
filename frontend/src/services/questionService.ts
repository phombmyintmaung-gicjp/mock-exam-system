import api from './api';
import type { AdminQuestion, Question } from '@/types/exam';
import type { PaginatedResponse } from '@/types/api';

export const getAdminQuestions = async (
  params?: Record<string, string>,
): Promise<PaginatedResponse<AdminQuestion>> => {
  const res = await api.get('/admin/questions', { params });
  return res.data;
};

export const getAdminQuestion = async (id: number): Promise<Question> => {
  const res = await api.get(`/admin/questions/${id}`);
  return res.data.data;
};

export const createQuestion = async (payload: unknown): Promise<Question> => {
  const res = await api.post('/admin/questions', payload);
  return res.data.data;
};

export const updateQuestion = async (id: number, payload: unknown): Promise<Question> => {
  const res = await api.put(`/admin/questions/${id}`, payload);
  return res.data.data;
};

export const deleteQuestion = async (id: number): Promise<void> => {
  await api.delete(`/admin/questions/${id}`);
};

export interface ImportResult {
  imported: number;
  duplicates: number;
  skipped: number;
  errors: string[];
}

export const importQuestions = async (file: File): Promise<ImportResult> => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'xlsx' && ext !== 'xls') {
    throw new Error('Only .xlsx and .xls files are supported.');
  }
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/admin/questions/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data as ImportResult;
};
