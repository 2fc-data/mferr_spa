
export interface Area {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AreaFormData = Omit<Area, 'id' | 'created_at' | 'updated_at'>;
export type CreateAreaData = AreaFormData;

import { createCrudService } from './crud.service';

export const areasService = createCrudService<Area, AreaFormData>('/areas');
