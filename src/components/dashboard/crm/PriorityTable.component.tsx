import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils";
import { getOutcomeStyle } from "../../../screens/Dashboard/utils/outcome-analytics.utils";

interface PriorityTableProps {
  scoredRecords: any[];
  selectedCityName: string;
  onRowClick: (cause: any) => void;
}

export const PriorityTable = React.memo(({
  scoredRecords,
  selectedCityName,
  onRowClick
}: PriorityTableProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-md font-bold">Resumo Individual de Prioridades</CardTitle>
            <CardDescription>Lista filtrada para a jurisdição: {selectedCityName}.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nível</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Principal Gargalo</TableHead>
                <TableHead className="text-right">Valor em Risco</TableHead>
                <TableHead>Inércia (Dias)</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Tarefas</TableHead>
                <TableHead>Ação Sugerida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoredRecords.map((r, i) => (
                <TableRow
                  key={r.id || i}
                  className="cursor-pointer hover:bg-accent/5 transition-colors"
                  onClick={() => onRowClick(r)}
                >
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${r.priorityLabel === 'Crítico' ? 'bg-red-500 text-white' :
                        (r.priorityLabel === 'Urgente' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white')
                      }`}>
                      {r.priorityLabel}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{r.number || `ID: ${r.id}`}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-medium text-xs bg-muted/30 px-2 py-1 rounded">
                      {r.bottleneck}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCompactCurrency(parseFloat(r.total_value || "0"))}</TableCell>
                  <TableCell className="text-sm font-mono flex items-center gap-1.5">
                    {r.stagnation > 30 ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> : <Clock className="w-3.5 h-3.5 text-emerald-500" />}
                    {r.stagnation} d
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const style = getOutcomeStyle(r.outcome?.name);
                      return (
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.bgColor} ${style.textColor}`}>
                          {style.icon} {r.outcome?.name || 'Pendente'}
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const tasks = r.cause_tasks || [];
                      const total = tasks.length;
                      const completed = tasks.filter((t: any) => t.is_completed).length;
                      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                      if (total === 0) return <span className="text-[10px] text-muted-foreground italic">–</span>;
                      return (
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                            {completed}/{total}
                          </span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground italic">
                    {typeof r.story === 'object' ? r.story.headline : r.story}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
