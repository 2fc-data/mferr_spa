/**
 * Outcome Analytics Utilities
 * 
 * Normalização, estilização e cálculo de KPIs para a dimensão Resultado (Outcome)
 * no Dashboard CRM. Todos os cálculos são feitos no frontend a partir dos records
 * já disponíveis via useSummaryData.
 */

// --- Normalização de nomes de Outcome ---

const OUTCOME_MAP: Record<string, string> = {
  ganho: "Ganho",
  procedente: "Ganho",
  "procedente para a defesa": "Ganho",
  perdido: "Perdido",
  improcedente: "Perdido",
  acordo: "Acordo",
  "parcialmente procedente": "Acordo",
  acórdão: "Acordo",
  "em aberto": "Pendente",
  pendente: "Pendente",
};

export const normalizeOutcome = (name?: string): string => {
  if (!name) return "Pendente";
  const normalized = name.trim().toLowerCase();
  return OUTCOME_MAP[normalized] || "Outro";
};

// --- Estilização por tipo de Outcome ---

interface OutcomeStyle {
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

const OUTCOME_STYLES: Record<string, OutcomeStyle> = {
  Ganho: {
    icon: "🟢",
    color: "#059669",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  Perdido: {
    icon: "🔴",
    color: "#dc2626",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-400",
  },
  Acordo: {
    icon: "🟡",
    color: "#ca8a04",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  Pendente: {
    icon: "⚪",
    color: "#64748b",
    bgColor: "bg-slate-100 dark:bg-slate-800/50",
    textColor: "text-slate-600 dark:text-slate-400",
  },
  Outro: {
    icon: "⚫",
    color: "#6b7280",
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
    textColor: "text-gray-600 dark:text-gray-400",
  },
};

export const getOutcomeStyle = (name?: string): OutcomeStyle => {
  const normalized = normalizeOutcome(name);
  return OUTCOME_STYLES[normalized] || OUTCOME_STYLES["Outro"];
};

// --- Chart colors for Recharts ---
export const OUTCOME_CHART_COLORS: Record<string, string> = {
  Ganho: "#059669",
  Perdido: "#dc2626",
  Acordo: "#ca8a04",
  Pendente: "#64748b",
  Outro: "#6b7280",
};

// --- Cálculo de KPIs de Outcome ---

export interface OutcomeDistributionItem {
  name: string;
  count: number;
  value: number;
  fill: string;
  pct: number;
}

export interface OutcomeKPIs {
  successRate: number;
  totalGanho: number;
  totalPerdido: number;
  totalAcordo: number;
  distribution: OutcomeDistributionItem[];
  dimensionalOutcomeData: { name: string; Ganho: number; Perdido: number; Acordo: number }[];
}

/**
 * Computa todos os KPIs e dados de gráfico para Outcomes
 * a partir dos records do dashboard (frontend-only, zero custo de rede).
 */
export const computeOutcomeAnalytics = (
  records: any[],
  groupByResolver?: (r: any) => string
): OutcomeKPIs => {
  // 1. Agrupar por tipo de outcome
  const groups: Record<string, any[]> = {
    Ganho: [],
    Perdido: [],
    Acordo: [],
    Pendente: [],
    Outro: [],
  };

  records.forEach((r) => {
    const key = normalizeOutcome(r.outcome?.name);
    if (groups[key]) {
      groups[key].push(r);
    } else {
      groups["Outro"].push(r);
    }
  });

  const total = records.length || 1;
  const sumValue = (items: any[]) =>
    items.reduce((s, r) => s + parseFloat(r.total_value || "0"), 0);

  // 2. Distribuição para Donut Chart
  const distribution: OutcomeDistributionItem[] = Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([name, items]) => ({
      name,
      count: items.length,
      value: sumValue(items),
      fill: OUTCOME_CHART_COLORS[name] || "#6b7280",
      pct: parseFloat(((items.length / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Taxa de sucesso
  const successRate = parseFloat(((groups["Ganho"].length / total) * 100).toFixed(1));

  // 4. Dados dimensionais (Outcome × Dimensão selecionada) para Stacked Bar
  let dimensionalOutcomeData: { name: string; Ganho: number; Perdido: number; Acordo: number }[] = [];

  if (groupByResolver) {
    const dimensionGroups: Record<string, any[]> = {};
    records.forEach((r) => {
      const dim = groupByResolver(r);
      if (!dimensionGroups[dim]) dimensionGroups[dim] = [];
      dimensionGroups[dim].push(r);
    });

    dimensionalOutcomeData = Object.entries(dimensionGroups)
      .map(([name, items]) => ({
        name,
        Ganho: items.filter((r) => normalizeOutcome(r.outcome?.name) === "Ganho").length,
        Perdido: items.filter((r) => normalizeOutcome(r.outcome?.name) === "Perdido").length,
        Acordo: items.filter((r) => normalizeOutcome(r.outcome?.name) === "Acordo").length,
      }))
      .sort((a, b) => (b.Ganho + b.Perdido + b.Acordo) - (a.Ganho + a.Perdido + a.Acordo))
      .slice(0, 10);
  }

  return {
    successRate,
    totalGanho: sumValue(groups["Ganho"]),
    totalPerdido: sumValue(groups["Perdido"]),
    totalAcordo: sumValue(groups["Acordo"]),
    distribution,
    dimensionalOutcomeData,
  };
};
