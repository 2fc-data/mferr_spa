import { api } from './api';

export interface Rule {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateRuleData = Omit<Rule, 'id' | 'created_at' | 'updated_at'>;

export const rulesService = {
  getAll: async (): Promise<Rule[]> => {
    const response = await api.get<Rule[]>('/rules');
    return response.data;
  },

  create: async (data: CreateRuleData): Promise<Rule> => {
    const response = await api.post<Rule>('/rules', data);
    return response.data;
  },

  update: async (params: { id: number; data: Partial<CreateRuleData> }): Promise<Rule> => {
    const response = await api.patch<Rule>(`/rules/${params.id}`, params.data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/rules/${id}`);
  }
};
