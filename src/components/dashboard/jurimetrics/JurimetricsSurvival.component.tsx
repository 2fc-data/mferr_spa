import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { DashboardExpertInsight } from "../../dashboard/jurimetrics/DashboardExpertInsight";

const CHART_COLORS = [
  "#2563eb", "#e11d48", "#16a34a", "#ca8a04", "#9333ea",
  "#0891b2", "#ea580c", "#4f46e5", "#059669", "#dc2626"
];

interface JurimetricsSurvivalProps {
  kmData: any[];
  cityRanking: any[];
  top2Names: string[];
}

export const JurimetricsSurvival = React.memo(({
  kmData,
  cityRanking,
  top2Names,
}: JurimetricsSurvivalProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Probabilidade de Sobrevivência (Celeridade)</CardTitle>
          <CardDescription>Percentual de processos ainda em aberto ao longo do tempo (dias).</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer config={{}} className="h-full w-full">
            <LineChart data={kmData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                label={{ value: "Dias decorridos", position: "insideBottom", offset: -5, fontSize: 10 }} 
              />
              <YAxis unit="%" hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {top2Names.map((name, i) => (
                <Line 
                  key={name} 
                  type="stepAfter" 
                  dataKey={name} 
                  stroke={CHART_COLORS[i % CHART_COLORS.length]} 
                  dot={false} 
                  strokeWidth={2} 
                />
              ))}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardExpertInsight
          title="Previsibilidade de Ciclo"
          object="Cálculo matricial Kaplan-Meier para tempo estimado de encerramento."
          purpose="Gestão de expectativa do cliente e planejamento de contingência de custos de juros e correção."
          conclusion="As curvas mais 'horizontais' indicam lentidão crítica. O jurídico deve priorizar peticionamentos de impulso processual nessas regiões."
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Média de Dias para Encerramento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cityRanking.slice(0, 5).map((c, i) => (
                <div key={i} className="flex justify-between items-center p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                  <span className="text-xs font-medium">{c.city}</span>
                  <span className="text-xs font-bold font-mono">{Math.round(c.meanAging)} dias</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
