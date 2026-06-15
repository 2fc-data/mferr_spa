import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

interface BivariateBarChartProps {
  data: any[];
  title: string;
}

const chartConfig = {
  Ganho: {
    label: "Ganho",
    color: "var(--primary)",
  },
  Acordo: {
    label: "Acordo",
    color: "var(--chart-2)",
  },
  Perdido: {
    label: "Perdido",
    color: "var(--destructive)",
  },
  emAndamento: {
    label: "Em Andamento",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export const BivariateBarChart: React.FC<BivariateBarChartProps> = ({ data, title }) => {
  const transformedData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      emAndamento: item["Em Andamento"] ?? 0,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>Distribuição de êxito por agrupamento</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Sem dados para exibição</p>
            <p className="text-xs mt-1">Ajuste os filtros para visualizar a análise bivariada.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-[400px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Distribuição de êxito por agrupamento</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={transformedData} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="Ganho" fill="var(--color-Ganho)" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Acordo" fill="var(--color-Acordo)" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Perdido" fill="var(--color-Perdido)" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="emAndamento" fill="var(--color-emAndamento)" stackId="a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <div className="px-6 pb-4">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Metodologia OPC:</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">O Quê:</span> Distribuição de êxito por órgão julgador. <br/>
            <span className="font-bold text-foreground">Por Quê:</span> Permite identificar tribunais com maior taxa de improcedência. <br/>
            <span className="font-bold text-foreground">Como:</span> Priorizar acordos em comarcas com histórico desfavorável.
          </p>
        </div>
      </div>
    </Card>
  );
};
