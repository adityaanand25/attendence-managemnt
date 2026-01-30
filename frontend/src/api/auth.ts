import { api } from './client';
import { AuthResponse, User } from '../types/api';

type SignInPayload = { email: string; password: string };
type SignUpPayload = { email: string; password: string; full_name?: string; role?: 'member' | 'admin' };

export const signIn = async (payload: SignInPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/signin', payload);
  return data;
};

export const signUp = async (payload: SignUpPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/signup', payload);
  return data;
};

export const fetchProfile = async (): Promise<User> => {
  const { data } = await api.get<User>('/api/profile');
  return data;
};

export const signOut = async (): Promise<void> => {
  await api.post('/auth/signout');
};
