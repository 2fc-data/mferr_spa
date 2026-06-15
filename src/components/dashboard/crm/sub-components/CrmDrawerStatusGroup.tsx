import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { labelCls, selectCls, cn } from "@/components/ui/FormField";

interface CrmDrawerStatusGroupProps {
  stages: any[];
  availableStatuses: any[];
  selectedStage: string;
  onStageChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
}

export const CrmDrawerStatusGroup: React.FC<CrmDrawerStatusGroupProps> = ({
  stages,
  availableStatuses,
  selectedStage,
  onStageChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <section className="space-y-5 bg-primary/5 p-6 rounded-3xl border border-white/5 shadow-inner">
      <div className="flex items-center gap-2 text-primary">
        <ArrowRight className="w-4 h-4" />
        <h3 className={labelCls}>Gestão de Situação</h3>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className={labelCls}>Mover a Fase</Label>
          <Select
            value={selectedStage}
            onValueChange={onStageChange}
          >
            <SelectTrigger className={cn(selectCls, "h-12 font-bold shadow-sm transition-colors duration-300", selectedStage && "text-primary dark:text-primary dark:border-primary/30 dark:bg-primary/5")}>
              <SelectValue placeholder="Selecione a Fase…" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/10 shadow-2xl">
              {stages.map(st => (
                <SelectItem 
                  key={st.id} 
                  value={st.id.toString()} 
                  className="rounded-xl focus:bg-primary/10 data-[state=checked]:bg-primary/15 data-[state=checked]:text-primary data-[state=checked]:font-extrabold"
                >
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={labelCls}>Alterar Status</Label>
          <Select 
            value={selectedStatus} 
            onValueChange={onStatusChange} 
            disabled={!selectedStage}
          >
            <SelectTrigger className={cn(selectCls, "h-12 shadow-inner border-white/5 font-bold transition-colors duration-300", selectedStatus && "text-primary dark:text-primary dark:border-primary/30 dark:bg-primary/5")}>
              <SelectValue placeholder="Selecione o Status…" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/10 shadow-2xl">
              {availableStatuses.map(s => (
                <SelectItem 
                  key={s.id} 
                  value={s.id.toString()} 
                  className="rounded-xl focus:bg-primary/10 data-[state=checked]:bg-primary/15 data-[state=checked]:text-primary data-[state=checked]:font-extrabold"
                >
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
};
