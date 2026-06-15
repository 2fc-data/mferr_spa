export interface City {
  id: number;
  name: string;
  uf: string;
  created_at?: string;
  updated_at?: string;
}

export type CityFormData = Omit<City, 'id' | 'created_at' | 'updated_at'>;

import { createCrudService } from './crud.service';

export const cityService = createCrudService<City, CityFormData>('/cities');
