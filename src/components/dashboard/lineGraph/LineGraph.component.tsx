import React from "react";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import type { PeriodType } from "../filters/Filters.component";

interface LineGraphProps {
  data: any;
  filtros: string[];
  selectedYear?: string;
  filterLabel?: string;
  filterOptions?: Record<string, string>;
  periodType?: PeriodType;
  periodValue?: string;
}

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { ChartConfig } from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  total: {
    label: "Total",
    color: "var(--foreground)",
  },
};

export const LineGraph: React.FC<LineGraphProps> = ({
  data,
  filtros,
  selectedYear,
  filterLabel,
  periodType = "ano",
  periodValue = "0",
}) => {
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
    "var(--chart-9)",
    "var(--chart-10)",
    "var(--chart-11)",
    "var(--chart-12)",
    "var(--chart-13)",
    "var(--chart-14)",
    "var(--chart-15)",
  ];
  const colorFor = (idx: number) => chartColors[idx % chartColors.length];

  const MONTH_FULL_NAMES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const semesterLabels = ["1º Semestre", "2º Semestre"];
  const quarterLabels = ["1º Trimestre", "2º Trimestre", "3º Trimestre", "4º Trimestre"];

  const periodDescription = React.useMemo(() => {
    switch (periodType) {
      case "semestre":
        return `Semestral — ${selectedYear} (${semesterLabels[Number(periodValue) || 0]})`;
      case "trimestre":
        return `Trimestral — ${selectedYear} (${quarterLabels[Number(periodValue) || 0]})`;
      case "mes":
        return `Mensal — ${selectedYear} (${MONTH_FULL_NAMES[Number(periodValue) || 0]})`;
      case "ano":
        return `Ano — ${selectedYear}`;
      default:
        return `Ano — ${selectedYear}`;
    }
  }, [MONTH_FULL_NAMES, periodType, periodValue, quarterLabels, selectedYear, semesterLabels]);

  return (
    <div className="w-full h-fit">
      <h4 className="text-base font-semibold text-foreground">{filterLabel}</h4>
      <p className="text-sm text-muted-foreground mb-4">{periodDescription}</p>

      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            left: 0,
            right: 0,
          }}
          height={150}
        >
          <CartesianGrid vertical={true} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => String(value).slice(0, 3)}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--foreground)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
            name="Total"
          />

          {filtros.map((filtro, i) => (
            <Line
              key={filtro}
              type="monotone"
              dataKey={filtro}
              stroke={colorFor(i)}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ChartContainer>

      <div className="flex w-full items-start mt-4 gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Causas por {filterLabel} ao longo de {periodType === 'ano' ? selectedYear : `${selectedYear} — ${periodType === 'mes' ? MONTH_FULL_NAMES[Number(periodValue) || 0] : (periodType === 'semestre' ? semesterLabels[Number(periodValue) || 0] : quarterLabels[Number(periodValue) || 0])}`} <TrendingUp className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
