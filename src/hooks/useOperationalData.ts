import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import type { PeriodType } from "../components/dashboard/filters/Filters.component";

interface UseOperationalDataProps {
  enabled: boolean;
  selectedYear: string;
  selectedStatusId?: string;
  selectedStatusTaskId?: string;
  selectedCityId?: string;
  selectedStageId?: string;
  periodType?: PeriodType;
  periodValue?: string;
}

export interface OperationalData {
  bottlenecks: { name: string; avgDays: number }[];
  productivity: { userName: string; tasksCompleted: number; avgDays: number }[];
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  avgLeadTime: number;
}

/**
 * Hook condicional para dados operacionais de tarefas.
 * Chama GET /dashboard/operations SOMENTE quando `enabled` é true
 * (i.e., quando filtro de status ou tarefa está ativo).
 */
export const useOperationalData = ({
  enabled,
  selectedYear,
  selectedStatusId = "",
  selectedStatusTaskId = "",
  selectedCityId = "",
  selectedStageId = "",
  periodType = "ano",
  periodValue = "0",
}: UseOperationalDataProps) => {
  const { data, isLoading } = useQuery<OperationalData>({
    queryKey: [
      "dashboard-operations",
      selectedYear,
      selectedStatusId,
      selectedStatusTaskId,
      selectedCityId,
      selectedStageId,
      periodType,
      periodValue,
    ],
    queryFn: () =>
      dashboardService.getOperationalMetrics({
        year: selectedYear,
        status_id: selectedStatusId || undefined,
        status_task_id: selectedStatusTaskId || undefined,
        city_id: selectedCityId || undefined,
        stage_id: selectedStageId || undefined,
        periodType,
        periodValue,
      }),
    enabled,
  });

  return {
    operationalData: data || null,
    isLoadingOps: isLoading && enabled,
  };
};
