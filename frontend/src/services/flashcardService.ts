import publicApi from './publicApi';
import api from './api';
import type { Flashcard, FlashcardType, FlashcardLevel } from '@/types/flashcard';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

// Public — no auth required
export async function getFlashcards(
  type?: FlashcardType,
  level?: FlashcardLevel,
): Promise<Flashcard[]> {
  const params: Record<string, string> = {};
  if (type)  params.type  = type;
  if (level) params.level = level;
  const res = await publicApi.get<PaginatedResponse<Flashcard>>('/study/flashcards', { params });
  return res.data.data;
}

// Admin — requires JWT
export async function getAdminFlashcards(
  type?: FlashcardType,
  level?: FlashcardLevel,
): Promise<PaginatedResponse<Flashcard>> {
  const params: Record<string, string> = {};
  if (type)  params.type  = type;
  if (level) params.level = level;
  const res = await api.get<PaginatedResponse<Flashcard>>('/admin/flashcards', { params });
  return res.data;
}

export async function createFlashcard(data: Omit<Flashcard, 'id'>): Promise<Flashcard> {
  const res = await api.post<ApiResponse<Flashcard>>('/admin/flashcards', data);
  return res.data.data;
}

export async function updateFlashcard(id: number, data: Partial<Omit<Flashcard, 'id'>>): Promise<Flashcard> {
  const res = await api.put<ApiResponse<Flashcard>>(`/admin/flashcards/${id}`, data);
  return res.data.data;
}

export async function deleteFlashcard(id: number): Promise<void> {
  await api.delete(`/admin/flashcards/${id}`);
}

export interface FlashcardImportResult {
  imported: number;
  duplicates: number;
  skipped: number;
  errors: string[];
}

export async function importFlashcards(file: File): Promise<FlashcardImportResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<ApiResponse<FlashcardImportResult>>('/admin/flashcards/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
