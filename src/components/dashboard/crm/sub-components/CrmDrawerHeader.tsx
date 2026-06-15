import React from "react";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Scale, User, Calendar } from "lucide-react";
import type { Cause } from "@/services/causes.service";
import { labelCls } from "@/components/ui/FormField";

interface CrmDrawerHeaderProps {
  cause: Cause;
  isLoading?: boolean;
}

export const CrmDrawerHeader: React.FC<CrmDrawerHeaderProps> = ({ cause, isLoading }) => {
  const priority = (cause as any).priorityScore || 0;
  const breakdown = (cause as any).priorityBreakdown || {};

  return (
    <SheetHeader className="space-y-6 shrink-0 pt-2 px-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-primary flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-xl">
          <Scale className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Processo Judicial</span>
        </Badge>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Prioridade CRM</span>
          <span className="text-2xl font-black text-primary leading-none tracking-tighter shadow-sm">#{Math.round(priority)}</span>
          <div className="flex gap-1.5 mt-1.5">
            {isLoading ? (
              <div className="h-1 w-20 bg-primary/20 animate-pulse rounded-full" />
            ) : (
              <>
                <div className="h-1.5 w-6 rounded-full bg-emerald-500/60 shadow-inner" title={`Financeiro: ${Math.round(breakdown.value || 0)}`} />
                <div className="h-1.5 w-6 rounded-full bg-rose-500/60 shadow-inner" title={`Risco: ${Math.round(breakdown.risk || 0)}`} />
                <div className="h-1.5 w-6 rounded-full bg-amber-500/60 shadow-inner" title={`Tempo: ${Math.round(breakdown.stagnation || 0)}`} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SheetTitle className="text-3xl font-black tracking-tighter text-foreground leading-[1.1] drop-shadow-sm">
          {cause.number}
        </SheetTitle>
        <SheetDescription className="text-sm font-semibold text-muted-foreground/80 leading-relaxed max-w-[90%]">
          {cause.description}
        </SheetDescription>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-primary/5 border border-white/5 shadow-inner group transition-all hover:bg-primary/10">
          <div className="flex items-center gap-2 text-primary mb-2">
            <User className="w-4 h-4" />
            <span className={labelCls}>Cliente</span>
          </div>
          <p className="text-sm font-black truncate text-foreground/90">
            {(cause as any).client_names || "Não Atribuído"}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-primary/5 border border-white/5 shadow-inner group transition-all hover:bg-primary/10">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Calendar className="w-4 h-4" />
            <span className={labelCls}>Protocolo</span>
          </div>
          <p className="text-sm font-black text-foreground/90">
            {new Date(cause.process_date).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </SheetHeader>
  );
};
