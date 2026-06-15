import { api } from "./api";

export interface DashboardMetricsParams {
  year?: string;
  periodType?: string;
  periodValue?: string;
  city_id?: string;
  groupBy?: string;
  subject?: string;
  litigation_type?: string;
  outcome_id?: string;
  status_id?: string;
  stage_id?: string;
  status_task_id?: string;
}

export interface DashboardMetrics {
  actionCount: number;
  legalFeesCount: number;
  honoraryCount: number;
  clientFeesCount: number;
  meanValue: number;
  medianValue: number;
  meanLeadTime: number;
  medianLeadTime: number;
  histogramData: { range: string; count: number }[];
  boxplotData: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];
  };
  bivariateData: any[];
  lineGraphData: { month: string; total: number; [key: string]: any }[];
  filtros: string[];
  records: any[];
  trends?: {
    volume: number;
    ticket: number;
    value: number;
  };
}

export const dashboardService = {
  getMetrics: async (params: DashboardMetricsParams): Promise<DashboardMetrics> => {
    const response = await api.get('/dashboard/metrics', { params });
    return response.data;
  },

  getOperationalMetrics: async (params: DashboardMetricsParams): Promise<any> => {
    const response = await api.get('/dashboard/operations', { params });
    return response.data;
  },
};
