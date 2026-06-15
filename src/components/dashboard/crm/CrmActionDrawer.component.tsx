import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { useCrmActionDrawer } from "./hooks/useCrmActionDrawer";
import { CrmDrawerHeader } from "./sub-components/CrmDrawerHeader";
import { CrmDrawerStatusGroup } from "./sub-components/CrmDrawerStatusGroup";
import { CrmDrawerChecklist } from "./sub-components/CrmDrawerChecklist";
import type { Cause } from "@/services/causes.service";
import { labelCls, glassCardCls } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

interface CrmActionDrawerProps {
  cause: Cause | null;
  isOpen: boolean;
  onClose: () => void;
  statuses: any[];
  stages: any[];
}

export const CrmActionDrawer: React.FC<CrmActionDrawerProps> = ({
  cause,
  isOpen,
  onClose,
  statuses,
  stages
}) => {
  const {
    currentCause,
    isLoadingCause,
    selectedStage,
    setSelectedStage,
    selectedStatus,
    setSelectedStatus,
    availableStatuses,
    tasks,
    isLoadingTasks,
    isTasksError,
    updateMutation,
    toggleTaskMutation,
    hasPendingMandatory,
  } = useCrmActionDrawer({ cause, isOpen, onClose, statuses });

  if (!cause || !currentCause) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col pt-4 border-l border-border/50 bg-card/95 backdrop-blur-md">
        
        {/* 1. Header & Summary */}
        <CrmDrawerHeader cause={currentCause} isLoading={isLoadingCause} />

        <Separator className="mt-4 mb-2 opacity-20" />

        <ScrollArea className="flex-1 min-h-0 overscroll-contain">
          <div className="space-y-8 px-6 pb-8">
            
            {/* 2. Situational Diagnosis (Story) */}
            <section className="space-y-4 mt-2">
              <div className="flex items-center gap-2 text-primary">
                <AlertCircle className="w-4 h-4" />
                <h3 className={labelCls}>Diagnóstico Situacional</h3>
              </div>
              <div className="space-y-4">
                <div className={cn("p-5 rounded-3xl space-y-3", glassCardCls)}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                    {(currentCause as any).story?.headline || "Diagnóstico"}
                  </p>
                  <p className="text-sm font-semibold text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                    "{(currentCause as any).story?.body || "Análise dos indicadores de prioridade em andamento."}"
                  </p>
                </div>
                <div className="p-5 rounded-3xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-amber-700 dark:text-amber-500/90">Plano de Ação Sugerido</p>
                  <p className="text-sm font-black leading-relaxed tracking-tight text-amber-950 dark:text-amber-100">
                    {(currentCause as any).story?.action || "Monitorar evolução conforme cronograma padrão."}
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Status Management */}
            <CrmDrawerStatusGroup
              stages={stages}
              availableStatuses={availableStatuses}
              selectedStage={selectedStage}
              onStageChange={(val) => {
                setSelectedStage(val);
                setSelectedStatus("");
              }}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />

            {/* 4. Checklist (Tasks) */}
            <CrmDrawerChecklist
              tasks={tasks}
              isLoading={isLoadingTasks}
              isError={isTasksError}
              onToggleTask={(taskId, checked) => toggleTaskMutation.mutate({ taskId, is_completed: checked })}
              selectedStatusName={availableStatuses.find(s => s.id.toString() === selectedStatus)?.name}
            />

          </div>
        </ScrollArea>

        {/* 5. Footer Actions */}
        <SheetFooter className="mt-auto px-6 py-8 border-t border-white/5 bg-background/50 backdrop-blur-xl">
          <div className="flex gap-4 w-full">
            <Button variant="ghost" className="flex-1 h-12 text-[10px] font-extrabold uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-white/5 text-foreground/80 dark:text-white" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className={cn(
                "flex-1 h-12 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl active:scale-95 transition-all",
                hasPendingMandatory 
                  ? 'bg-muted text-muted-foreground/30 grayscale cursor-not-allowed shadow-none border border-white/10' 
                  : 'bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30'
              )}
              onClick={() => updateMutation.mutate({
                current_status_id: parseInt(selectedStatus),
                current_stage_id: parseInt(selectedStage)
              })}
              disabled={updateMutation.isPending || hasPendingMandatory}
            >
              {updateMutation.isPending 
                ? "Processando…" 
                : hasPendingMandatory 
                  ? "Ativ. Pendentes" 
                  : "Salvar"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
