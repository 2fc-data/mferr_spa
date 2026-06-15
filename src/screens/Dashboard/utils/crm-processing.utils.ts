import type { ChartConfig } from "@/components/ui/chart";
import { calculateRiskScore, calculateStagnation } from "./jurimetrics.utils";
import { getIndividualPriorityStory, generateDirectStorytelling } from "./crm-storytelling.utils";

export const CHART_COLORS = [
  "#3b82f6", // chart-1 Navy
  "#ca8a04", // chart-2 Gold
  "#059669", // chart-3 Emerald
  "#c2410c", // chart-4 Clay
  "#64748b", // chart-5 Slate
  "#7c3aed", // chart-6 Royal
  "#a3a010", // chart-7 Olive
];

export const processScoredRecords = (records: any[]) => {
  if (!records || records.length === 0) return [];

  return records.map((r: any) => {
    const val = parseFloat(r.total_value || "0");
    const normalizedValue = Math.min(val / 150000, 1);
    const risk = calculateRiskScore(r);
    const stagnation = calculateStagnation(r);
    const normalizedStagnation = Math.min(stagnation / 180, 1);

    const priorityScore = (normalizedValue * 35) + (risk * 35) + (normalizedStagnation * 30);
    const bottleneck = r.current_status?.name || "Sem Status";
    const priorityBreakdown = {
      value: normalizedValue * 35,
      risk: risk * 35,
      stagnation: normalizedStagnation * 30
    };

    return {
      ...r,
      priorityScore,
      priorityBreakdown,
      bottleneck,
      stagnation,
      daysOpen: r.createdAt || r.created_at ? Math.floor((Date.now() - new Date(r.createdAt || r.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      priorityLabel: priorityScore > 70 ? "Crítico" : (priorityScore > 40 ? "Urgente" : "Monitorar"),
      story: getIndividualPriorityStory({ priorityScore, stagnation, priorityBreakdown, totalValue: val }),
      client_names: r.client_names || 'Não Atribuído'
    };
  }).sort((a: any, b: any) => b.priorityScore - a.priorityScore);
};

export const calculateBottlenecks = (scoredRecords: any[]) => {
  const stageCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  scoredRecords.forEach((r: any) => {
    const stageName = r.current_stage?.name || "Sem Fase";
    const statusName = r.current_status?.name || "Sem Status";
    stageCounts[stageName] = (stageCounts[stageName] || 0) + 1;
    statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
  });

  const stageData = Object.entries(stageCounts)
    .map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] }))
    .sort((a, b) => b.value - a.value);

  const statusData = Object.entries(statusCounts)
    .map(([name, value], i) => ({ name, value, fill: CHART_COLORS[(i + 3) % CHART_COLORS.length] }))
    .sort((a, b) => b.value - a.value);

  const dynamicStageConfig: ChartConfig = { value: { label: "Processos" } };
  stageData.forEach(d => { dynamicStageConfig[d.name] = { label: d.name, color: d.fill }; });

  const dynamicStatusConfig: ChartConfig = { value: { label: "Processos" } };
  statusData.forEach(d => { dynamicStatusConfig[d.name] = { label: d.name, color: d.fill }; });

  return { stageData, statusData, dynamicStageConfig, dynamicStatusConfig };
};

export const resolveGroupKey = (r: any, selectedOption: string): string => {
  switch (selectedOption) {
    case 'tipo_litigio': {
      const lt = r.litigation_type;
      if (lt && lt.trim() && lt !== 'Não Informado') return lt;
      const client = r.cause_users?.find((cu: any) => cu.role_type === 'client');
      const doc = (client?.user?.document || '').replace(/\D/g, '');
      if (doc.length === 14) return 'Empresa (PJ)';
      if (doc.length === 11) return 'PF';
      return 'Não Informado';
    }
    case 'area_atuacao':   return r.area?.name || 'Não Informado';
    case 'status_processo': return r.current_status?.name || 'Não Informado';
    case 'estagio_atual':  return r.current_stage?.name || 'Não Informado';
    case 'tribunal':       return r.court?.name || 'Não Informado';
    case 'assunto':        return r.subject || 'Não Informado';
    default:               return r.litigation_type || 'Não Informado';
  }
};

export const calculateDimensionalVolume = (records: any[], selectedOption: string) => {
  const groupCounts: Record<string, number> = {};
  records.forEach((r: any) => {
    const key = resolveGroupKey(r, selectedOption);
    groupCounts[key] = (groupCounts[key] || 0) + 1;
  });

  return Object.entries(groupCounts)
    .map(([name, total], i) => ({ name, total, fill: CHART_COLORS[i % CHART_COLORS.length] }))
    .sort((a, b) => b.total - a.total);
};

export const orchestrateStorytelling = (params: {
  records: any[],
  scoredRecords: any[],
  trends: any,
  stageData: any[],
  statusData: any[]
}) => {
  const { records, scoredRecords, trends, stageData, statusData } = params;
  const totalValue = records.reduce((sum: number, r: any) => sum + parseFloat(r.total_value || "0"), 0);
  const criticalCount = scoredRecords.filter((r: any) => r.priorityScore > 75).length;
  const meanLeadTime = records.reduce((s: number, r: any) => s + (r.daysOpen || 0), 0) / (records.length || 1);

  return generateDirectStorytelling({
    records,
    trends: trends || { volume: 0, ticket: 0, value: 0 },
    totalValue,
    criticalCount,
    meanLeadTime,
    topStage: stageData[0]?.name || "N/A",
    topStatus: statusData[0]?.name || "N/A"
  });
};
