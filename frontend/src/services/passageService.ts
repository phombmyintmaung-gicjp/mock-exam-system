import api from './api';
import type { Passage, JLPTLevel } from '@/types/exam';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

export const getPassages = async (level?: JLPTLevel): Promise<PaginatedResponse<Passage & { questions_count: number }>> => {
  const res = await api.get('/admin/passages', { params: level ? { level } : {} });
  return res.data;
};

export const getPassage = async (id: number): Promise<ApiResponse<Passage>> => {
  const res = await api.get(`/admin/passages/${id}`);
  return res.data;
};

export const createPassage = async (data: Omit<Passage, 'id'>): Promise<ApiResponse<Passage>> => {
  const res = await api.post('/admin/passages', data);
  return res.data;
};

export const updatePassage = async (id: number, data: Partial<Omit<Passage, 'id'>>): Promise<ApiResponse<Passage>> => {
  const res = await api.put(`/admin/passages/${id}`, data);
  return res.data;
};

export const deletePassage = async (id: number): Promise<void> => {
  await api.delete(`/admin/passages/${id}`);
};
