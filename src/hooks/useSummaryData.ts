import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import type { PeriodType } from "../components/dashboard/filters/Filters.component";

interface UseSummaryDataProps {
  selectedYear: string;
  selectedOption: string;
  filterOptions?: Record<string, string>;
  periodType?: PeriodType;
  periodValue?: string;
  selectedCityId?: string;
  selectedStatusId?: string;
  selectedStageId?: string;
  selectedStatusTaskId?: string;
  selectedOutcomeId?: string;
}


export const useSummaryData = ({
  selectedYear,
  selectedOption,
  filterOptions,
  periodType = "ano",
  periodValue = "0",
  selectedCityId = "",
  selectedStatusId = "",
  selectedStageId = "",
  selectedStatusTaskId = "",
  selectedOutcomeId = "",
}: UseSummaryDataProps) => {
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics", selectedYear, selectedOption, periodType, periodValue, selectedCityId, selectedStatusId, selectedStageId, selectedStatusTaskId, selectedOutcomeId],
    queryFn: () => dashboardService.getMetrics({
      year: selectedYear,
      groupBy: selectedOption,
      periodType,
      periodValue,
      city_id: selectedCityId || undefined,
      status_id: selectedStatusId || undefined,
      stage_id: selectedStageId || undefined,
      status_task_id: selectedStatusTaskId || undefined,
      outcome_id: selectedOutcomeId || undefined,
    }),
  });

  const actionCount = metrics?.actionCount || 0;
  const legalFeesCount = metrics?.legalFeesCount || 0;
  const honoraryCount = metrics?.honoraryCount || 0;
  const clientFeesCount = metrics?.clientFeesCount || 0;
  const onTable = legalFeesCount - clientFeesCount;

  const meanValue = metrics?.meanValue || 0;
  const medianValue = metrics?.medianValue || 0;
  const meanLeadTime = metrics?.meanLeadTime || 0;
  const medianLeadTime = metrics?.medianLeadTime || 0;
  const histogramData = metrics?.histogramData || [];
  const boxplotData = metrics?.boxplotData || { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
  const bivariateData = metrics?.bivariateData || [];

  const lineGraphDataRaw = metrics?.lineGraphData || [];
  const records = metrics?.records || [];

  const friendlyLabel = useMemo(() => {
    return (filterOptions ? filterOptions[selectedOption] : undefined) ?? selectedOption;
  }, [filterOptions, selectedOption]);

  const { peakMonth, peakValue } = useMemo(() => {
    if (!lineGraphDataRaw.length) return { peakMonth: "", peakValue: 0 };
    let max = -1;
    let month = "";
    for (const item of lineGraphDataRaw) {
      if (item.total > max) {
        max = item.total;
        month = item.month;
      }
    }
    return { peakMonth: month, peakValue: max };
  }, [lineGraphDataRaw]);

  return {
    actionCount,
    legalFeesCount,
    honoraryCount,
    clientFeesCount,
    onTable,
    meanValue,
    medianValue,
    meanLeadTime,
    medianLeadTime,
    histogramData,
    boxplotData,
    bivariateData,
    lineGraphData: lineGraphDataRaw,
    records,
    friendlyLabel,
    peakMonth,
    peakValue,
    isLoading,
    filtros: metrics?.filtros || [],
    trends: metrics?.trends || { volume: 0, ticket: 0, value: 0 },
    campo: selectedOption,
  };
};
