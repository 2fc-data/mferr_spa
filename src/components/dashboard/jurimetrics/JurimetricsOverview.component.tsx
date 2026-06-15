import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "../../dashboard/KPICard";
import { AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { DashboardExpertInsight } from "../../dashboard/jurimetrics/DashboardExpertInsight";

interface JurimetricsOverviewProps {
  stats: {
    avgRisk: number;
    totalProvision: number;
    totalExposed: number;
  };
  pieData: any[];
  areaRiskData: any[];
  riskPieConfig: any;
}

export const JurimetricsOverview = React.memo(({
  stats,
  pieData,
  areaRiskData,
  riskPieConfig,
}: JurimetricsOverviewProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          label="Risco Médio" 
          value={`${(stats.avgRisk * 100).toFixed(1)}%`} 
          icon={AlertCircle} 
          variant="danger" 
        />
        <KPICard 
          label="Provisionamento (CPC 25)" 
          value={formatCompactCurrency(stats.totalProvision)} 
          icon={DollarSign} 
        />
        <KPICard 
          label="Exposição Nominal" 
          value={formatCompactCurrency(stats.totalExposed)} 
          icon={TrendingUp} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Distribuição CPC 25</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer config={riskPieConfig} className="h-full w-full">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value">
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Risco por Natureza Jurídica</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer 
              config={{
                RiscoMedio: {
                  label: "Risco Médio",
                  color: "var(--primary)",
                }
              }} 
              className="h-full w-full"
            >
              <BarChart data={areaRiskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis unit="%" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="RiscoMedio" fill="var(--color-RiscoMedio)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <DashboardExpertInsight
        object="Análise de exposição financeira segmentada por probabilidade de perda."
        purpose="Garantir que o provisionamento contábil esteja aderente às normas CPC 25, reduzindo surpresas em balanço."
        conclusion="O foco de negociação deve ser nos processos 'Prováveis'. Casos com risco > 80% devem ter tese revista ou proposta de acordo priorizada."
      />
    </div>
  );
});
