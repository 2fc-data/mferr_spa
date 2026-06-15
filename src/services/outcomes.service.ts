export interface Outcome {
  id: number;
  name: string;
  description: string;
  status_id?: number;
  status?: {
    id: number;
    name: string;
  };
  is_active: boolean;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type OutcomeFormData = Omit<Outcome, 'id' | 'created_at' | 'updated_at'>;

import { createCrudService } from './crud.service';

export const outcomesService = createCrudService<Outcome, OutcomeFormData>('/outcomes');
