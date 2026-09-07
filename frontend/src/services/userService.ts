import api from './api';
import type { UserProfile } from '../types';

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
  },

  async getAll(): Promise<UserProfile[]> {
    const { data } = await api.get<UserProfile[]>('/users');
    return data;
  },

  async create(data: CreateUserRequest): Promise<UserProfile> {
    const { data: user } = await api.post<UserProfile>('/users', data);
    return user;
  },

  async getById(id: string): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>(`/users/${id}`);
    return data;
  },

  async updateRole(id: string, role: string): Promise<UserProfile> {
    const { data } = await api.put<UserProfile>(`/users/${id}/role`, { role });
    return data;
  },

  async toggleActive(id: string): Promise<UserProfile> {
    const { data } = await api.put<UserProfile>(`/users/${id}/toggle-active`);
    return data;
  },
};
