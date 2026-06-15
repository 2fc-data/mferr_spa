import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCompactCurrency } from "@/lib/utils";

interface JurimetricsTriageProps {
  topCases: any[];
}

export const JurimetricsTriage = React.memo(({
  topCases,
}: JurimetricsTriageProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold">Triagem de Casos Críticos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processo</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Provisionamento</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCases.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-xs font-mono">{c.number}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      c.riskScore > 0.6 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {(c.riskScore * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold">{formatCompactCurrency(c.expectedValue)}</TableCell>
                  <TableCell className="text-[10px] font-black uppercase text-primary">
                    {c.recommendation}
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
