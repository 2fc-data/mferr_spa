import { api } from './api';

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  changes: Record<string, { old: any; new: any }>;
  user_id: number;
  user?: { id: number; name: string };
  created_at: string;
}

export const auditService = {
  getByEntity: async (entityType: string, entityId: number): Promise<AuditLog[]> => {
    const response = await api.get(`/audit-logs/${entityType}/${entityId}`);
    return response.data;
  },
};
