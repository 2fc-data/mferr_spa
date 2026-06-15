import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils";
import { DashboardExpertInsight } from "../../dashboard/jurimetrics/DashboardExpertInsight";

interface JurimetricsBenchmarkingProps {
  mwResult: any | null;
  cityRanking: any[];
}

export const JurimetricsBenchmarking = React.memo(({
  mwResult,
  cityRanking,
}: JurimetricsBenchmarkingProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mwResult ? (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Teste de Hipótese (Mann-Whitney)
              </CardTitle>
              <CardDescription>
                Comparativo de condenação: {mwResult.cityA} vs {mwResult.cityB}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold">{mwResult.cityA}</p>
                  <p className="text-lg font-black">{formatCompactCurrency(mwResult.meanA || 0)}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold">{mwResult.cityB}</p>
                  <p className="text-lg font-black">{formatCompactCurrency(mwResult.meanB || 0)}</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg border text-sm ${mwResult.significant ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <p className="font-bold mb-1">
                  {mwResult.significant ? "Diferença Significante Detectada" : "Padrões de Decisão Similares"}
                </p>
                <p className="text-xs text-muted-foreground">
                  O p-valor de {mwResult.pValue.toFixed(4)} indica que a variação entre as comarcas {mwResult.significant ? "NÃO é obra do acaso." : "é puramente aleatória."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center p-10 italic text-muted-foreground text-sm">
            Selecione dados com pelo menos duas comarcas de alto volume para benchmarking.
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Comarcas mais Onerosas (Ticket Médio)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cityRanking.slice(0, 5).map((c, i) => (
                <div key={i} className="flex justify-between items-center p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                  <span className="text-xs font-medium">{c.city}</span>
                  <span className="text-xs font-bold font-mono">{formatCompactCurrency(c.meanValue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardExpertInsight
        title="Estratégia por Comarca"
        object="Benchmark de severidade das decisões entre diferentes jurisdições."
        purpose="Ajustar as teses de defesa e a alocação de advogados conforme o rigor de cada tribunal."
        conclusion="Comarcas com 'Diferença Significante' e ticket superior à média exigem atuação de nível sênior e priorização de acordos judiciais preventivos."
      />
    </div>
  );
});
