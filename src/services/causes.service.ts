import { api } from './api';

export interface InvolvedUser {
  user_id: number;
  role_type_id: number;
  party_side_id: number;
  is_primary?: boolean;
}

export interface Cause {
  id: number;
  number: string;
  description: string;
  court_id: number;
  division_id?: number;
  area_id?: number;
  current_stage_id?: number;
  current_status_id?: number;
  outcome_id?: number;
  city_id?: number;
  total_value: number;
  total_fees: number;
  customer_amount: number;
  percentage: number;
  process_date: string;
  is_active: boolean;
  involved_users?: InvolvedUser[];
  collaborator_ids?: number[];
  client_ids?: number[];
  print_contract?: boolean;
  contract_doc_path?: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  court?: { id: number; name: string };
  area?: { id: number; name: string };
  current_stage?: { id: number; name: string };
  current_status?: { id: number; name: string };
  outcome?: { id: number; name: string };
  division?: { id: number; name: string };
  city?: { id: number; name: string; uf: string };
  cause_users?: {
    user?: { id: number; name: string };
    role_type?: string;
    role_type_id?: number;
    party_side_id?: number;
    is_primary?: boolean;
  }[];
}

export type CauseFormData = Omit<Cause, 'id' | 'created_at' | 'updated_at'>;
export interface CreateCauseData extends Omit<CauseFormData, 'client_ids' | 'collaborator_ids'> {
  involved_users: InvolvedUser[];
}

export const causesService = {
  getAll: async (filters?: { city_id?: number; court_id?: number; division_id?: number; includeDeleted?: boolean }): Promise<Cause[]> => {
    const response = await api.get<Cause[]>('/causes', { params: filters });
    return response.data;
  },

  getById: async (id: number): Promise<Cause> => {
    const response = await api.get<Cause>(`/causes/${id}`);
    return response.data;
  },

  create: async (data: CreateCauseData): Promise<Cause> => {
    const response = await api.post<Cause>('/causes', data);
    return response.data;
  },

  update: async (params: { id: number; data: Partial<CreateCauseData> }): Promise<Cause> => {
    const response = await api.patch<Cause>(`/causes/${params.id}`, params.data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/causes/${id}`);
  },

  uploadContractDoc: async (id: number | string, file: File): Promise<{ contract_doc_path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ contract_doc_path: string }>(`/causes/${id}/contract-doc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTasks: async (id: number, statusId?: number): Promise<CauseTask[]> => {
    const response = await api.get<CauseTask[]>(`/causes/${id}/tasks`, {
      params: { status_id: statusId }
    });
    return response.data;
  },

  toggleTask: async (params: { causeId: number; taskId: number; is_completed: boolean }): Promise<CauseTask> => {
    const response = await api.patch<CauseTask>(`/causes/${params.causeId}/tasks/${params.taskId}`, { 
      is_completed: params.is_completed 
    });
    return response.data;
  }
};

export interface CauseTask {
  id: number;
  cause_id: number;
  status_task_id: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: number;
  status_task: {
    id: number;
    description: string;
    is_required: boolean;
    order_index: number;
  };
  completer?: {
    id: number;
    name: string;
  };
}
