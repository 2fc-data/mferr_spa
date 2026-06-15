import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { ClipboardCheck, Clock, AlertCircle, Trophy } from "lucide-react";
import type { OperationalData } from "../../../hooks/useOperationalData";

interface TaskAnalyticsPanelProps {
  data: OperationalData;
  isLoading: boolean;
  statusLabel?: string;
  taskLabel?: string;
}

const BOTTLENECK_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
];

/**
 * Painel condicional de Gestão de Tarefas.
 * Aparece quando o filtro "Por Status" ou "Por Tarefa" está ativo.
 */
export const TaskAnalyticsPanel: React.FC<TaskAnalyticsPanelProps> = ({
  data,
  isLoading,
  statusLabel,
  taskLabel,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="ml-3 text-muted-foreground text-sm">Carregando métricas operacionais...</span>
      </div>
    );
  }

  if (!data || data.totalTasks === 0) {
    return (
      <Card className="animate-in fade-in slide-in-from-top-4 duration-700 border-dashed border-amber-300/50">
        <CardContent className="p-8 text-center text-muted-foreground italic text-sm">
          <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Nenhuma tarefa encontrada para os filtros selecionados.
        </CardContent>
      </Card>
    );
  }

  const contextLabel = taskLabel || statusLabel || "Filtros Ativos";
  const topAdvogado = data.productivity[0];

  // Chart config
  const bottleneckConfig: ChartConfig = { avgDays: { label: "Dias (Média)" } };
  const bottleneckData = data.bottlenecks.map((b, i) => ({
    ...b,
    fill: BOTTLENECK_COLORS[i % BOTTLENECK_COLORS.length],
  }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground/80">
          Gestão Operacional de Tarefas
        </h3>
        <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
          {contextLabel}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniKPI
          title="Taxa de Conclusão"
          value={`${data.completionRate}%`}
          icon={<ClipboardCheck className="w-4 h-4" />}
          accent={data.completionRate >= 70 ? "emerald" : data.completionRate >= 40 ? "amber" : "rose"}
        />
        <MiniKPI
          title="Lead-Time Médio"
          value={`${data.avgLeadTime} dias`}
          icon={<Clock className="w-4 h-4" />}
          accent={data.avgLeadTime <= 7 ? "emerald" : data.avgLeadTime <= 21 ? "amber" : "rose"}
        />
        <MiniKPI
          title="Pendentes"
          value={`${data.pendingTasks} tarefas`}
          icon={<AlertCircle className="w-4 h-4" />}
          accent={data.pendingTasks === 0 ? "emerald" : data.pendingTasks <= 5 ? "amber" : "rose"}
        />
        <MiniKPI
          title="Top Advogado"
          value={topAdvogado ? topAdvogado.userName.split(" ")[0] : "–"}
          subtitle={topAdvogado ? `${topAdvogado.tasksCompleted} tarefas` : ""}
          icon={<Trophy className="w-4 h-4" />}
          accent="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bottleneck Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Gargalo por Tarefa (Lead-Time)</CardTitle>
            <CardDescription className="text-xs">Tempo médio de conclusão por tipo de tarefa</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {bottleneckData.length > 0 ? (
              <div
                style={{ height: `${Math.max(120, bottleneckData.length * 35 + 10)}px` }}
                className="w-full"
              >
                <ChartContainer config={bottleneckConfig} className="h-full w-full aspect-auto">
                  <BarChart
                    data={bottleneckData}
                    layout="vertical"
                    margin={{ top: 0, right: 50, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={140}
                      className="text-[10px] font-semibold"
                      tickFormatter={(v) => (v.length > 22 ? v.substring(0, 22) + "..." : v)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="avgDays"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                      label={{ position: "right", fontSize: 10, fontWeight: 700, formatter: (v: number) => `${v}d` }}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground italic text-xs py-6">
                Sem dados de gargalo.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Productivity Ranking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Produtividade por Advogado</CardTitle>
            <CardDescription className="text-xs">Ranking de tarefas concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {data.productivity.length > 0 ? (
                data.productivity.slice(0, 8).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          i === 0
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                            : i === 1
                            ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            : i === 2
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {p.userName}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          Média: {p.avgDays} dias/tarefa
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-primary font-mono font-bold text-sm">
                        {p.tasksCompleted}
                      </span>
                      <span className="text-[8px] text-muted-foreground italic">concluídas</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground italic text-xs py-6">
                  Nenhum advogado completou tarefas neste filtro.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Mini KPI Card (compact) ---

const MiniKPI = ({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
}) => {
  const accentClasses: Record<string, string> = {
    emerald: "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
    amber: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
    rose: "border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20",
    primary: "border-l-primary bg-primary/5",
  };

  return (
    <Card className={`border-l-4 ${accentClasses[accent] || accentClasses.primary} shadow-sm`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <div className="p-1.5 bg-muted/30 rounded-md">{icon}</div>
        </div>
        <p className="text-lg font-black tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground font-medium">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
