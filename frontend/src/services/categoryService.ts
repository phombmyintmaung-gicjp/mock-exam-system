import api from './api';
import type { ApiResponse } from '@/types/api';
import type { Category } from '@/types/category';

export async function getCategories(): Promise<Category[]> {
  const res = await api.get<ApiResponse<Category[]>>('/admin/categories');
  return res.data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const res = await api.post<ApiResponse<Category>>('/admin/categories', { name });
  return res.data.data;
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const res = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, { name });
  return res.data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}
