import { api } from './api';

export function createCrudService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>>(endpoint: string) {
  return {
    getAll: async (params?: any): Promise<T[]> => {
      const response = await api.get<T[]>(endpoint, { params });
      return response.data;
    },

    create: async (data: CreateDto): Promise<T> => {
      const response = await api.post<T>(endpoint, data);
      return response.data;
    },

    update: async (params: { id: number; data: UpdateDto }): Promise<T> => {
      const response = await api.patch<T>(`${endpoint}/${params.id}`, params.data);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`${endpoint}/${id}`);
    }
  };
}
