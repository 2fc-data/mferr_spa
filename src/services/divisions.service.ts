export interface Division {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DivisionFormData = Omit<Division, 'id' | 'created_at' | 'updated_at'>;

import { createCrudService } from './crud.service';

export const divisionsService = createCrudService<Division, DivisionFormData>('/divisions');
