import { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { causesService, type Cause, type CauseTask } from "@/services/causes.service";
import { toast } from "sonner";

export interface UseCrmActionDrawerProps {
  cause: Cause | null;
  isOpen: boolean;
  onClose: () => void;
  statuses: any[];
}

export const useCrmActionDrawer = ({
  cause,
  isOpen,
  onClose,
  statuses,
}: UseCrmActionDrawerProps) => {
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // 1. Fresh Data Fetching
  const { data: freshCause, isLoading: isLoadingCause } = useQuery({
    queryKey: ["cause", cause?.id],
    queryFn: () => causesService.getById(cause!.id),
    enabled: !!cause?.id && isOpen,
  });

  const currentCause = freshCause || cause;

  // Sync internal state with prop/fresh data
  useEffect(() => {
    if (currentCause && isOpen) {
      setSelectedStage(currentCause.current_stage_id?.toString() || "");
      setSelectedStatus(currentCause.current_status_id?.toString() || "");
    }
  }, [currentCause?.id, currentCause?.current_status_id, isOpen]);

  // Derived state
  const availableStatuses = useMemo(() => {
    if (!selectedStage) return [];
    return statuses.filter((s: any) => s.stage_id === parseInt(selectedStage));
  }, [selectedStage, statuses]);

  // 2. Tasks Management
  const { data: tasks = [], isLoading: isLoadingTasks, isError: isTasksError } = useQuery({
    queryKey: ["cause-tasks", currentCause?.id, selectedStatus],
    queryFn: () => causesService.getTasks(currentCause!.id, Number(selectedStatus)),
    enabled: !!currentCause?.id && !!selectedStatus && isOpen,
  });

  // 3. Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => causesService.update({ id: currentCause!.id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["causes"] });
      queryClient.invalidateQueries({ queryKey: ["cause", currentCause?.id] });
      queryClient.invalidateQueries({ queryKey: ["cause-tasks", currentCause?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-operations"] });
      toast.success("Situação atualizada com sucesso!");
      onClose();
    },
    onError: () => toast.error("Erro ao atualizar situação."),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (params: { taskId: number; is_completed: boolean }) =>
      causesService.toggleTask({ causeId: currentCause!.id, ...params }),
    
    // --- OPTIMISTIC UPDATE (PERFORMANCE BEST PRACTICE) ---
    onMutate: async ({ taskId, is_completed }) => {
      await queryClient.cancelQueries({ queryKey: ["cause-tasks", currentCause?.id, selectedStatus] });
      const previousTasks = queryClient.getQueryData<CauseTask[]>(["cause-tasks", currentCause?.id, selectedStatus]);

      queryClient.setQueryData<CauseTask[]>(["cause-tasks", currentCause?.id, selectedStatus], (old) => {
        if (!old) return [];
        return old.map((t) => (t.id === taskId ? { ...t, is_completed } : t));
      });

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["cause-tasks", currentCause?.id, selectedStatus], context.previousTasks);
      }
      toast.error("Erro ao sincronizar atividade.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cause-tasks", currentCause?.id, selectedStatus] });
    },
  });

  const hasPendingMandatory = useMemo(() => {
    if (!currentCause) return false;
    const isChangingStatus = selectedStatus !== "" && selectedStatus !== currentCause.current_status_id?.toString();
    if (!isChangingStatus) return false;
    return tasks.some(t => t.status_task.is_required && !t.is_completed);
  }, [tasks, selectedStatus, currentCause]);

  return {
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
  };
};
