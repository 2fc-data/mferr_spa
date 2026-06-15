import { api } from "./api";

export interface StatusTask {
  id: number;
  status_id: number;
  description: string;
  is_required: boolean;
  order_index: number;
}

export interface CreateStatusTaskData {
  status_id: number;
  description: string;
  is_required?: boolean;
  order_index?: number;
}

const statusTasksService = {
  findAll: async (): Promise<StatusTask[]> => {
    const response = await api.get<StatusTask[]>("/status-tasks");
    return response.data;
  },

  create: async (data: CreateStatusTaskData): Promise<StatusTask> => {
    const response = await api.post<StatusTask>("/status-tasks", data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateStatusTaskData>): Promise<void> => {
    await api.patch(`/status-tasks/${id}`, data);
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/status-tasks/${id}`);
  },
};

export default statusTasksService;
