export interface Status {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  is_default?: boolean;
  stage_id?: number;
  stage?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export type StatusFormData = Omit<Status, 'id' | 'created_at' | 'updated_at' | 'stage'>;

import { createCrudService } from './crud.service';

export const statusService = createCrudService<Status, StatusFormData>('/status');
