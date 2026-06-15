import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import type { PeriodType } from '../components/dashboard/filters/Filters.component';

interface UseOperationsDataProps {
  selectedYear: string;
  selectedOption: string;
  filterOptions?: Record<string, string>;
  periodType?: PeriodType;
  periodValue?: string;
  selectedCityId?: string;
  selectedStatusId?: string;
  selectedStageId?: string;
}

export const useOperationsData = (filters: UseOperationsDataProps) => {
  return useQuery({
    queryKey: ['dashboard-operations', filters],
    queryFn: async () => {
      // Assuming api from dashboard.service is exposed or we just call the endpoint.
      // Wait, dashboard.service.ts already has methods. I should probably add getOperationalMetrics there.
      // Let's add the fetch directly to dashboard.service.ts instead of inline fetch to maintain structure.
      return dashboardService.getOperationalMetrics(filters);
    }
  });
};
