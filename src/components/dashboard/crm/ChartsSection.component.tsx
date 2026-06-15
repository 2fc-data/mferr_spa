import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, Info } from "lucide-react";

interface ChartsSectionProps {
  dimensionalData: any[];
  stageData: any[];
  statusData: any[];
  dynamicStageConfig: any;
  dynamicStatusConfig: any;
  friendlyLabel: string;
  timingStory: string;
  priorityStory: string;
}

const ReusableTooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-border">
      {text}
    </div>
  </div>
);

export const ChartsSection = React.memo(({
  dimensionalData,
  stageData,
  statusData,
  dynamicStageConfig,
  dynamicStatusConfig,
  friendlyLabel,
  timingStory,
  priorityStory
}: ChartsSectionProps) => {
  return (
    <div className="space-y-6">
      {/* MAIN DIMENSIONAL ANALYSIS */}
      <Card className="w-full border-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Análise Dimensional: {friendlyLabel}
          </CardTitle>
          <CardDescription>Volume de processos por {friendlyLabel?.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent className="h-[380px]">
          {dimensionalData && dimensionalData.length > 0 ? (
            <ChartContainer
              config={{ total: { label: "Processos" } }}
              className="h-full w-full"
            >
              <BarChart data={dimensionalData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 10, fontWeight: 700 }}>
                  {dimensionalData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground italic text-sm">Sem dados para esta dimensão.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STAGE BOTTLENECK CHART */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-md font-bold">Gargalo Sistêmico por Fase</CardTitle>
                <CardDescription>Volume de processos em cada etapa macro da justiça.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-auto pb-0">
            <div style={{ height: `${Math.max(100, stageData.length * 35 + 10)}px` }} className="w-full pt-2">
              <ChartContainer config={dynamicStageConfig} className="h-full w-full aspect-auto">
                <BarChart data={stageData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={130}
                    className="text-[11px] font-semibold"
                    tickFormatter={(v) => v.length > 20 ? v.substring(0, 20) + '...' : v}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28} fill="var(--primary)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-relaxed whitespace-pre-wrap text-muted-foreground w-[90%]">
              {timingStory}
            </div>
          </CardFooter>
        </Card>

        {/* STATUS BOTTLENECK CHART */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-md font-bold">Volume por Status (Aprovado)</CardTitle>
                <CardDescription>Entenda onde o trâmite encontra maior lentidão exata.</CardDescription>
              </div>
              <ReusableTooltip text="Mostra a densidade de processos agrupados pelo status final registrado na plataforma.">
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </ReusableTooltip>
            </div>
          </CardHeader>
          <CardContent className="h-auto pb-0">
            <div style={{ height: `${Math.max(100, statusData.length * 35 + 10)}px` }} className="w-full pt-2">
              <ChartContainer config={dynamicStatusConfig} className="h-full w-full aspect-auto">
                <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={130}
                    className="text-[11px] font-semibold"
                    tickFormatter={(v) => v.length > 20 ? v.substring(0, 20) + '...' : v}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28} fill="var(--primary)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-relaxed whitespace-pre-wrap text-muted-foreground w-[90%]">
              {priorityStory}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
});
