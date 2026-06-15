import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

interface FinancialHistogramProps {
  data: any[];
}

const chartConfig = {
  count: {
    label: "Frequência",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const FinancialHistogram: React.FC<FinancialHistogramProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Dispersão Financeira</CardTitle>
          <CardDescription>Distribuição do Valor da Causa (Massificação vs Estratégico)</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Sem dados para exibição</p>
            <p className="text-xs mt-1">Ajuste os filtros para visualizar a dispersão financeira.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate 75th percentile index for color thresholding
  const p75Index = Math.ceil(data.length * 0.75) - 1;

  return (
    <Card className="shadow-sm h-[400px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Dispersão Financeira</CardTitle>
        <CardDescription>Distribuição do Valor da Causa (Massificação vs Estratégico)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis
              dataKey="range"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              height={60}
              label={{
                value: "Faixa de Valor (R$)",
                position: 'insideBottom',
                offset: -5,
                style: { fill: 'var(--foreground)', fontWeight: 'bold', fontSize: '13px' }
              }}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Frequência",
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'var(--foreground)', fontWeight: 'bold', fontSize: '13px' }
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index > p75Index ? "var(--destructive)" : "var(--primary)"}
                  opacity={0.8 + (index * (0.2 / Math.max(data.length - 1, 1)))}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <div className="px-6 pb-4">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Metodologia OPC:</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">O Quê:</span> Concentração de valores em faixas específicas. <br/>
            <span className="font-bold text-foreground">Por Quê:</span> Causas de alto valor (Outliers) aumentam o risco de provisão. <br/>
            <span className="font-bold text-foreground">Como:</span> Designar sócios seniores para as faixas vermelhas (acima do P75).
          </p>
        </div>
      </div>
    </Card>
  );
};
