import { api } from './api';

export interface User {
  id: number | string;
  name: string;
  username: string;
  document: string;
  email: string;
  password?: string;
  phone1?: string;
  phone2?: string;
  is_active: boolean;
  profile_ids?: number[];
  profiles?: { id: number; name: string }[];
  nationality?: string;
  birth_state?: string;
  profession?: string;
  birth_date?: string;
  mother_name?: string;
  father_name?: string;
  rg?: string;
  pis?: string;
  ctps?: string;
  responsible_id?: number;
  responsible_relation?: string;
  is_minor?: boolean;
  lgpd_date?: string;
  lgpd_doc_path?: string;
  print_lgpd_consent?: boolean;
  print_lgpd_minor_consent?: boolean;
  lgpd_minor_doc_path?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  addresses?: any[];
  deleted?: boolean;
}

export const usersService = {
  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getAllIncludingDeleted: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users', {
      params: { includeDeleted: 'true' },
    });
    return response.data;
  },

  getById: async (id: number | string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: number | string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  restore: async (id: number | string): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/restore`);
    return response.data;
  },

  getCollaborators: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/collaborators');
    return response.data;
  },

  getClients: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/clients');
    return response.data;
  },

  uploadLgpdDoc: async (id: number | string, file: File): Promise<{ lgpd_doc_path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ lgpd_doc_path: string }>(`/users/${id}/lgpd-doc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadLgpdMinorDoc: async (id: number | string, file: File): Promise<{ lgpd_minor_doc_path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ lgpd_minor_doc_path: string }>(`/users/${id}/lgpd-minor-doc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
