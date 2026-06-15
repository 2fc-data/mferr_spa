import { api } from './api';

export interface StatusTask {
  id: number;
  status_id: number;
  description: string;
  is_required: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export const statusTasksService = {
  getAll: async (): Promise<StatusTask[]> => {
    const response = await api.get<StatusTask[]>('/status-tasks');
    return response.data;
  },
  getByStatus: async (statusId: number | string): Promise<StatusTask[]> => {
    const response = await api.get<StatusTask[]>(`/status-tasks/status/${statusId}`);
    return response.data;
  }
};
