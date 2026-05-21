import api from './api';
import type { ApiResponse } from '@/types/api';
import type { CategoryExamSetting } from '@/types/exam';

export async function fetchExamSettings(): Promise<CategoryExamSetting[]> {
  const res = await api.get<ApiResponse<CategoryExamSetting[]>>('/admin/exam-settings');
  return res.data.data;
}

export async function updateExamSetting(
  category: string,
  data: Omit<CategoryExamSetting, 'category'>,
): Promise<CategoryExamSetting> {
  const res = await api.put<ApiResponse<CategoryExamSetting>>(
    `/admin/exam-settings/${encodeURIComponent(category)}`,
    data,
  );
  return res.data.data;
}
