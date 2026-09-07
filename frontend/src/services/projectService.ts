import api from './api';
import type { Project } from '../types';

export const projectService = {
  async getAll(): Promise<Project[]> {
    const { data } = await api.get<Project[]>('/projects');
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(name: string, description: string): Promise<Project> {
    const { data } = await api.post<Project>('/projects', { name, description });
    return data;
  },

  async update(id: string, name: string, description: string): Promise<Project> {
    const { data } = await api.put<Project>(`/projects/${id}`, { name, description });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getMemberIds(id: string): Promise<string[]> {
    const { data } = await api.get<string[]>(`/projects/${id}/members`);
    return data;
  },

  async replaceMemberAssignments(id: string, userIds: string[]): Promise<string[]> {
    const { data } = await api.put<string[]>(`/projects/${id}/members`, { userIds });
    return data;
  },
};
