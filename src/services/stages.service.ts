
export interface Stage {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type StageFormData = Omit<Stage, 'id' | 'created_at' | 'updated_at'>;
export type CreateStageData = StageFormData;

import { createCrudService } from './crud.service';

export const stagesService = createCrudService<Stage, StageFormData>('/stages');
