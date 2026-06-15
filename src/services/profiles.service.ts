import { api } from './api';
import type { Rule } from './rules.service';

export interface Profile {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  rules?: Rule[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateProfileData {
  name: string;
  description?: string;
  is_active?: boolean;
  rule_ids?: number[];
}

export const profilesService = {
  getAll: async (): Promise<Profile[]> => {
    const response = await api.get<Profile[]>('/profiles');
    return response.data;
  },

  getById: async (id: number): Promise<Profile> => {
    const response = await api.get<Profile>(`/profiles/${id}`);
    return response.data;
  },

  create: async (data: CreateProfileData): Promise<Profile> => {
    const response = await api.post<Profile>('/profiles', data);
    return response.data;
  },

  update: async (params: { id: number; data: Partial<CreateProfileData> }): Promise<Profile> => {
    const response = await api.patch<Profile>(`/profiles/${params.id}`, params.data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/profiles/${id}`);
  }
};
