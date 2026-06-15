import { api } from './api';

export interface Address {
  id?: number | string;
  postcode: string;
  city: string;
  state: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
  user_id?: number | string;
  address_type?: string;
  address_type_id?: number;
  is_primary?: boolean;
}

export const addressesService = {
  create: async (data: Address): Promise<Address> => {
    const response = await api.post<Address>('/addresses', data);
    return response.data;
  },

  update: async (id: number | string, data: Partial<Address>): Promise<Address> => {
    const response = await api.patch<Address>(`/addresses/${id}`, data);
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },

  getByUser: async (userId: number | string): Promise<Address[]> => {
    const response = await api.get<Address[]>(`/addresses/user/${userId}`);
    return response.data;
  },
  
  // Helper for CEP auto-complete
  getCEP: async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return null;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (data.erro) return null;
      return {
        street: data.logradouro,
        district: data.bairro,
        city: data.localidade,
        state: data.uf,
      };
    } catch (error) {
      console.error('Error fetching CEP:', error);
      return null;
    }
  }
};
