import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, AlertCircle, CheckSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CauseTask } from "@/services/causes.service";
import { labelCls } from "@/components/ui/FormField";

interface CrmDrawerChecklistProps {
  tasks: CauseTask[];
  isLoading: boolean;
  isError: boolean;
  onToggleTask: (taskId: number, checked: boolean) => void;
  selectedStatusName?: string;
}

export const CrmDrawerChecklist: React.FC<CrmDrawerChecklistProps> = React.memo(({
  tasks,
  isLoading,
  isError,
  onToggleTask,
  selectedStatusName,
}) => {
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return <p className="text-xs text-muted-foreground italic animate-pulse">Carregando atividades sugeridas…</p>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-destructive/5 border border-destructive/20 text-center shadow-inner">
        <AlertCircle className="w-6 h-6 text-destructive mb-3" />
        <p className="text-[10px] font-black text-destructive uppercase tracking-widest">Sincronização Falhou</p>
        <p className="text-[11px] text-muted-foreground mt-2 px-4 leading-relaxed font-semibold">Não foi possível carregar as atividades. Verifique sua conexão.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <ClipboardList className="w-4 h-4" />
          <h3 className={labelCls}>Atividades Sugeridas</h3>
        </div>
        {totalCount > 0 && (
          <Badge variant="outline" className="text-[10px] font-black tabular-nums bg-primary/10 text-primary border border-primary/20 rounded-xl px-2.5 py-1">
            {completedCount}/{totalCount} <span className="opacity-50 ml-1">Concluídas</span>
          </Badge>
        )}
      </div>

      {totalCount > 0 ? (
        <div className="space-y-4">
          <Progress value={progress} className="h-1.5 bg-primary/10 shadow-inner" />
          
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 group shadow-sm",
                  task.is_completed 
                    ? "bg-muted/5 border-white/5 opacity-60" 
                    : "bg-primary/5 border-white/5 hover:bg-primary/10 hover:border-primary/20"
                )}
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.is_completed}
                  onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
                  className="mt-0.5 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={cn(
                      "text-[13px] font-bold leading-relaxed cursor-pointer block transition-colors tracking-tight",
                      task.is_completed ? "text-muted-foreground line-through" : "text-foreground/90 group-hover:text-foreground"
                    )}
                  >
                    {task.status_task?.description}
                  </label>
                  {task.is_completed && task.completer && (
                    <div className="flex items-center gap-1.5 mt-2.5 opacity-60">
                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shadow-sm" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {task.completer.name} • {new Date(task.completed_at!).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>
                {task.status_task?.is_required && !task.is_completed && (
                  <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-tighter h-5 px-1.5 rounded-lg animate-pulse shadow-sm">
                    Requerido
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 px-6 text-center bg-primary/5 rounded-[2rem] border-2 border-dashed border-white/5">
          <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-inner opacity-70">
            <CheckSquare className="w-6 h-6 text-primary/40" />
          </div>
          <h3 className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">Sem atividades</h3>
          <p className="text-[11px] text-muted-foreground/40 font-semibold leading-relaxed max-w-[240px] mx-auto">
            Não há atividades pendentes para o status <span className="text-primary/60 font-black">{selectedStatusName || "selecionado"}</span>.
          </p>
        </div>
      )}
    </section>
  );
});

CrmDrawerChecklist.displayName = "CrmDrawerChecklist";
