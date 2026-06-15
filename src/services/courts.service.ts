export interface Court {
  id: number;
  name: string;
  description: string;
  state: string;
  is_federal: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CourtFormData = Omit<Court, 'id' | 'created_at' | 'updated_at'>;

import { createCrudService } from './crud.service';

export const courtsService = createCrudService<Court, CourtFormData>('/courts');
