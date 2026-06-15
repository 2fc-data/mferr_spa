import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Save,
  CheckCircle2
} from 'lucide-react';
import { DashboardPageHeader } from '../dashboard/DashboardPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { stagesService, type Stage as BaseStage } from '@/services/stages.service';
import statusTasksService, { type StatusTask, type CreateStatusTaskData } from '@/services/statusTasks.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FormSection, CheckboxRow, WarningBanner, DialogIconHeader, inputCls } from '@/components/ui/FormField';

interface StatusWithTasks {
  id: number;
  name: string;
  tasks: StatusTask[];
}

interface StageWithStatuses extends BaseStage {
  statuses: StatusWithTasks[];
}

export const Checklists: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StatusTask | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  
  // Form State
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [orderIndex, setOrderIndex] = useState(0);

  // Fetch Stages with Statuses and Tasks (Hierarchy restored for organization)
  const { data: stages = [], isLoading } = useQuery<StageWithStatuses[]>({
    queryKey: ['stages-hierarchy'],
    queryFn: stagesService.getAll as any,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: statusTasksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages-hierarchy'] });
      toast.success('Tarefa criada com sucesso!');
      closeDialog();
    },
    onError: () => toast.error('Erro ao criar tarefa.')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<CreateStatusTaskData> }) => 
      statusTasksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages-hierarchy'] });
      toast.success('Tarefa atualizada com sucesso!');
      closeDialog();
    },
    onError: () => toast.error('Erro ao atualizar tarefa.')
  });

  const deleteMutation = useMutation({
    mutationFn: statusTasksService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages-hierarchy'] });
      toast.success('Tarefa excluída com sucesso!');
    },
    onError: () => toast.error('Erro ao excluir tarefa.')
  });

  const openAddDialog = (statusId: number) => {
    setSelectedStatusId(statusId);
    setEditingTask(null);
    setDescription('');
    setIsRequired(false);
    setOrderIndex(0);
    setIsDialogOpen(true);
  };

  const openEditDialog = (task: StatusTask) => {
    setEditingTask(task);
    setSelectedStatusId(task.status_id);
    setDescription(task.description);
    setIsRequired(task.is_required);
    setOrderIndex(task.order_index);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setSelectedStatusId(null);
  };

  const handleSave = () => {
    if (!description.trim()) {
      toast.error('A descrição é obrigatória.');
      return;
    }

    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        data: { description, is_required: isRequired, order_index: orderIndex }
      });
    } else if (selectedStatusId) {
      createMutation.mutate({
        status_id: selectedStatusId,
        description,
        is_required: isRequired,
        order_index: orderIndex
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteMutation.mutate(id);
    }
  };


  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <DashboardPageHeader 
        title="Checklists por Fase e Status" 
        description="Configure as atividades recomendadas para cada etapa do processo. As tarefas são vinculadas aos Status, mas organizadas por Fases."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Carregando estrutura de processos...</p>
        </div>
      ) : stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-card/30 backdrop-blur-md rounded-2xl border border-dashed border-border/60 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-foreground">Nenhuma Fase Encontrada</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Cadastre as fases e status na gestão de situações para começar a criar os checklists.
          </p>
          <Button asChild variant="default">
            <a href="/Dashboard/stages">Configurar Fluxo</a>
          </Button>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-3">
          {stages.map((stage) => (
            <AccordionItem 
              key={stage.id} 
              value={`stage-${stage.id}`}
              className="group border border-white/10 bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:bg-card/50 transition-all"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4 w-full text-left">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-all shadow-inner">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 group-data-[state=open]:text-primary/90">Fase Processual</span>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">{stage.name}</h3>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="space-y-3">
                  {(stage.statuses || []).length === 0 ? (
                    <div className="p-5 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                      <p className="text-sm text-muted-foreground">Esta fase não possui status vinculados.</p>
                      <Button asChild variant="link" className="mt-2 text-primary">
                        <a href="/Dashboard/status">Vincular Status a esta Fase</a>
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="w-full space-y-2">
                      {stage.statuses.map((status) => (
                        <AccordionItem 
                          key={status.id} 
                          value={`status-${status.id}`}
                          className="border border-white/5 bg-black/20 rounded-xl overflow-hidden shadow-inner"
                        >
                          <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-white/5 transition-all">
                            <div className="flex items-center justify-between w-full pr-4 text-left">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  (status.tasks || []).length > 0 ? "bg-primary" : "bg-muted"
                                )} />
                                <span className="text-sm font-bold text-foreground/90">{status.name}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
                                {status.tasks?.length || 0} Atividades
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-5 pt-3 border-t border-white/5 bg-accent/5">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <h4 className="text-sm font-black uppercase tracking-widest text-primary/80">Checklist do Status</h4>
                                  <p className="text-xs text-muted-foreground">Atividades obrigatórias e recomendadas ao entrar nesta etapa.</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => openAddDialog(status.id)}
                                  className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 font-bold px-4"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Nova Atividade
                                </Button>
                              </div>

                              {(status.tasks || []).length === 0 ? (
                                <div className="p-5 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                                  <p className="text-sm text-muted-foreground italic">Nenhuma atividade configurada para este status.</p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {[...status.tasks]
                                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                                    .map((task) => (
                                    <div 
                                      key={task.id}
                                      className="flex items-center justify-between p-3 bg-card/60 rounded-xl border border-white/10 hover:border-primary/30 transition-all group/task"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center h-5">
                                          <Checkbox 
                                            id={`task-${task.id}`} 
                                            className="mt-0.5 border-dashed bg-muted/20" 
                                            disabled={true}
                                            checked={false}
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                            <span className={cn(
                                              "font-semibold text-sm transition-colors",
                                              task.is_required ? "text-amber-500" : "text-foreground/90"
                                            )}>
                                              {task.description}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/50 font-mono">
                                              #{task.order_index}
                                            </span>
                                          </div>
                                          {task.is_required && (
                                            <span className="text-[9px] uppercase font-black tracking-tighter text-amber-500/80">
                                              Obrigatória para salvar etapa
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          onClick={() => openEditDialog(task)}
                                          className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                          title="Editar"
                                          aria-label="Editar atividade"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          onClick={() => handleDelete(task.id)}
                                          className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                          title="Excluir"
                                          aria-label="Excluir atividade"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-border/50 shadow-2xl bg-card/95 backdrop-blur-xl sm:max-w-[450px]">
        <DialogHeader>
            <DialogIconHeader
              icon={editingTask ? <Pencil className="w-5 h-5" aria-hidden="true" /> : <Plus className="w-5 h-5" aria-hidden="true" />}
              title={editingTask ? 'Editar Atividade' : 'Nova Atividade'}
              description={editingTask ? 'Atualize os detalhes da tarefa compartilhada.' : 'Defina uma nova tarefa recomendada.'}
            />
          </DialogHeader>

          <div className="space-y-5 py-4">
            <FormSection label="Descrição da Atividade" htmlFor="task-description" required>
              <Input
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Anexar guia de custas…"
                className={inputCls}
                autoComplete="off"
                name="task-description"
              />
            </FormSection>

            <div className="grid grid-cols-2 gap-4">
              <FormSection label="Ordem de Exibição" htmlFor="task-order">
                <Input
                  id="task-order"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className={inputCls}
                  name="task-order"
                />
              </FormSection>

              <div className="flex flex-col justify-end">
                <CheckboxRow
                  id="is-required"
                  label="Obrigatória"
                  checked={isRequired}
                  onCheckedChange={setIsRequired}
                />
              </div>
            </div>

            {isRequired && (
              <WarningBanner>
                <span className="font-bold uppercase tracking-widest mr-1">Aviso:</span>
                Esta tarefa impedirá o avanço do processo se não estiver concluída.
              </WarningBanner>
            )}
          </div>

          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" className="flex-1 h-11 font-bold" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 h-11 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-all"
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending ? 'Salvando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
