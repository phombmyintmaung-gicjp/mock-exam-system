import publicApi from './publicApi';
import api from './api';
import type { Flashcard, FlashcardType, FlashcardLevel, CustomFlashcardSet } from '@/types/flashcard';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

// Public — no auth required
export async function getFlashcards(
  type?: FlashcardType,
  levels?: FlashcardLevel[],
): Promise<Flashcard[]> {
  const params: Record<string, string> = {};
  if (type)          params.type  = type;
  if (levels?.length) params.level = levels.join(',');
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

// ── SRS (Spaced Repetition) ───────────────────────────────────────────────

export interface ReviewState {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
}

export interface FlashcardWithReview extends Flashcard {
  reviewState: ReviewState | null;
}

/** 0=Again, 1=Hard, 2=Good, 3=Easy */
export type SrsRating = 0 | 1 | 2 | 3;

export async function getDueFlashcards(
  type?: FlashcardType,
  levels?: FlashcardLevel[],
): Promise<FlashcardWithReview[]> {
  const params: Record<string, string> = {};
  if (type)           params.type  = type;
  if (levels?.length) params.level = levels.join(',');
  const res = await api.get('/study/flashcards/due', { params });
  return (res.data.data as Record<string, unknown>[]).map((d) => ({
    ...(d as unknown as Flashcard),
    reviewState: d.review_state
      ? {
          intervalDays:   (d.review_state as Record<string, unknown>).interval_days as number,
          easeFactor:     (d.review_state as Record<string, unknown>).ease_factor as number,
          repetitions:    (d.review_state as Record<string, unknown>).repetitions as number,
          nextReviewAt:   (d.review_state as Record<string, unknown>).next_review_at as string | null,
          lastReviewedAt: (d.review_state as Record<string, unknown>).last_reviewed_at as string | null,
        }
      : null,
  }));
}

export async function submitSrsReview(flashcardId: number, rating: SrsRating): Promise<void> {
  await api.post(`/study/flashcards/${flashcardId}/review`, { rating });
}

// ── Bookmarks ──────────────────────────────────────────────────────────────

export async function getBookmarkedFlashcards(): Promise<Flashcard[]> {
  const res = await api.get<{ data: Flashcard[] }>('/study/flashcards/bookmarked');
  return res.data.data;
}

export async function addBookmark(flashcardId: number): Promise<void> {
  await api.post(`/study/flashcards/${flashcardId}/bookmark`);
}

export async function removeBookmark(flashcardId: number): Promise<void> {
  await api.delete(`/study/flashcards/${flashcardId}/bookmark`);
}

// ── Custom Study Sets ────────────────────────────────────────────────────────

export async function getCustomFlashcardSets(type?: FlashcardType): Promise<CustomFlashcardSet[]> {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  const res = await api.get<{ data: CustomFlashcardSet[] }>('/flashcard-sets', { params });
  return res.data.data;
}

export async function createCustomFlashcardSet(data: {
  name: string;
  type: FlashcardType;
  levels: FlashcardLevel[];
}): Promise<CustomFlashcardSet> {
  const res = await api.post<ApiResponse<CustomFlashcardSet>>('/flashcard-sets', data);
  return res.data.data;
}

export async function deleteCustomFlashcardSet(id: number): Promise<void> {
  await api.delete(`/flashcard-sets/${id}`);
}
