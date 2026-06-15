import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";
import { HUB_CATEGORIES } from "../../../screens/Dashboard/utils/network-processing.utils";

interface NetworkHubsAnalysisProps {
  hubCategory: string;
  onCategoryChange: (category: string) => void;
  filteredHubs: any[];
}

export const NetworkHubsAnalysis = React.memo(({
  hubCategory,
  onCategoryChange,
  filteredHubs,
}: NetworkHubsAnalysisProps) => {
  return (
    <Card className="bg-card border-border shadow-sm h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex flex-col gap-3">
          <CardTitle className="text-xs uppercase text-primary tracking-widest font-bold flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Análise de Hubs
          </CardTitle>
          <select 
            value={hubCategory} 
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-secondary/50 border-border border rounded-md p-1.5 text-[10px] text-foreground focus:ring-1 focus:ring-primary outline-none transition-elegant cursor-pointer"
            aria-label="Filtrar visualização por categoria de Hub (Advogados, Tribunais, Cidades, etc)"
          >
            {HUB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-6 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredHubs.length > 0 ? (
            filteredHubs.slice(0, 15).map((n: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                <div className="flex flex-col">
                  <span className="text-foreground font-bold text-xs truncate w-32 group-hover:text-primary transition-colors">{n.label}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">{n.category}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-primary font-mono font-bold text-sm">{n.connections}</span>
                   <span className="text-[8px] text-muted-foreground italic truncate">links</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-muted-foreground italic py-10">Nenhum hub encontrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
