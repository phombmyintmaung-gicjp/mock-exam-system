import api from './api';
import type { User, Department } from '@/types/user';
import type { PaginatedResponse } from '@/types/api';

export const getProfile = async (): Promise<User> => {
  const res = await api.get('/profile');
  return res.data.data;
};

export const updateProfile = async (
  payload: Pick<User, 'name'> & { target_certification?: string | null },
): Promise<User> => {
  const res = await api.patch('/profile', payload);
  return res.data.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
): Promise<void> => {
  await api.patch('/profile/password', {
    current_password: currentPassword,
    password: newPassword,
    password_confirmation: newPasswordConfirmation,
  });
};

export const getAdminUsers = async (
  params?: Record<string, string>,
): Promise<PaginatedResponse<User>> => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const getAdminUser = async (id: number): Promise<User> => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data.data;
};

export const createAdminUser = async (payload: unknown): Promise<User> => {
  const res = await api.post('/admin/users', payload);
  return res.data.data;
};

export const updateAdminUser = async (id: number, payload: unknown): Promise<User> => {
  const res = await api.put(`/admin/users/${id}`, payload);
  return res.data.data;
};

export const getDepartments = async (): Promise<Department[]> => {
  const res = await api.get('/admin/departments');
  return res.data.data;
};

export const toggleUserActive = async (id: number, isActive: boolean): Promise<User> => {
  const res = await api.put(`/admin/users/${id}`, { is_active: isActive });
  return res.data.data;
};

export const deleteAdminUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};

export const approveUser = async (id: number): Promise<User> => {
  const res = await api.post(`/admin/users/${id}/approve`);
  return res.data.data;
};

export const rejectUser = async (id: number): Promise<User> => {
  const res = await api.post(`/admin/users/${id}/reject`);
  return res.data.data;
};
