import api from './api';
import type { User } from '@/types/user';

export const fetchMe = async (): Promise<User> => {
  const res = await api.get('/profile');
  return res.data.data as User;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<{ message: string }> => {
  const res = await api.post('/auth/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  return res.data.data;
};

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const res = await api.post('/auth/login/', { email, password });
  return res.data.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout/');
};

export const refreshToken = async (): Promise<{ token: string }> => {
  const res = await api.post('/auth/refresh/');
  return res.data.data;
};
