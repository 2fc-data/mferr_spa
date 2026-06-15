import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Scale, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils";
import type { OutcomeKPIs } from "../../../screens/Dashboard/utils/outcome-analytics.utils";
import { OUTCOME_CHART_COLORS } from "../../../screens/Dashboard/utils/outcome-analytics.utils";

interface OutcomeAnalyticsPanelProps {
  data: OutcomeKPIs;
  dimensionLabel?: string;
  trends?: { volume: number; ticket: number; value: number };
}

/**
 * Painel condicional de Análise de Resultados.
 * Aparece quando o filtro "Por Resultado" está ativo.
 * Dados 100% frontend (sem custo de rede adicional).
 */
export const OutcomeAnalyticsPanel: React.FC<OutcomeAnalyticsPanelProps> = ({
  data,
  dimensionLabel,
}) => {
  if (!data || data.distribution.length === 0) {
    return (
      <Card className="animate-in fade-in slide-in-from-top-4 duration-700 border-dashed border-emerald-300/50">
        <CardContent className="p-8 text-center text-muted-foreground italic text-sm">
          <Scale className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Nenhum resultado para análise nos filtros selecionados.
        </CardContent>
      </Card>
    );
  }

  const donutConfig: ChartConfig = {
    count: { label: "Processos" },
    ...Object.fromEntries(
      data.distribution.map((d) => [
        d.name,
        { label: d.name, color: d.fill },
      ])
    ),
  };

  const stackedConfig: ChartConfig = {
    Ganho: { label: "Ganho", color: OUTCOME_CHART_COLORS.Ganho },
    Perdido: { label: "Perdido", color: OUTCOME_CHART_COLORS.Perdido },
    Acordo: { label: "Acordo", color: OUTCOME_CHART_COLORS.Acordo },
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scale className="w-5 h-5 text-emerald-500" />
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground/80">
          Análise de Resultados Judiciais
        </h3>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <OutcomeKPICard
          title="Taxa de Sucesso"
          value={`${data.successRate}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          accent={data.successRate >= 60 ? "emerald" : data.successRate >= 40 ? "amber" : "rose"}
        />
        <OutcomeKPICard
          title="Valor Ganho"
          value={formatCompactCurrency(data.totalGanho)}
          icon={<DollarSign className="w-4 h-4" />}
          accent="emerald"
        />
        <OutcomeKPICard
          title="Valor Perdido"
          value={formatCompactCurrency(data.totalPerdido)}
          icon={<TrendingDown className="w-4 h-4" />}
          accent="rose"
        />
        <OutcomeKPICard
          title="Valor Acordo"
          value={formatCompactCurrency(data.totalAcordo)}
          icon={<Scale className="w-4 h-4" />}
          accent="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Distribuição de Resultados</CardTitle>
            <CardDescription className="text-xs">
              Proporção de desfechos na carteira filtrada
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={donutConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={data.distribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="var(--background)"
                  label={({ name, pct }) => `${name} ${pct}%`}
                >
                  {data.distribution.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-[10px] font-semibold text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Stacked Bar: Outcome × Dimensão */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              Resultado × {dimensionLabel || "Dimensão"}
            </CardTitle>
            <CardDescription className="text-xs">
              Taxa de sucesso cruzada com a dimensão de agrupamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.dimensionalOutcomeData.length > 0 ? (
              <ChartContainer config={stackedConfig} className="h-[260px] w-full">
                <BarChart
                  data={data.dimensionalOutcomeData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 600 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    formatter={(value) => (
                      <span className="text-[10px] font-semibold">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="Ganho"
                    stackId="outcome"
                    fill={OUTCOME_CHART_COLORS.Ganho}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="Perdido"
                    stackId="outcome"
                    fill={OUTCOME_CHART_COLORS.Perdido}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="Acordo"
                    stackId="outcome"
                    fill={OUTCOME_CHART_COLORS.Acordo}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center">
                <p className="text-muted-foreground italic text-xs">
                  Selecione uma dimensão de agrupamento para visualizar o cruzamento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Outcome KPI Card ---

const OutcomeKPICard = ({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) => {
  const accentClasses: Record<string, string> = {
    emerald: "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
    amber: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
    rose: "border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20",
  };

  return (
    <Card className={`border-l-4 ${accentClasses[accent] || ""} shadow-sm`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <div className="p-1.5 bg-muted/30 rounded-md">{icon}</div>
        </div>
        <p className="text-lg font-black tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
};
