import { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { cityService } from "../services/city.service";
import { statusTasksService } from "../services/status_tasks.service";
import { statusService } from "../services/status.service";
import { outcomesService } from "../services/outcomes.service";
import { stagesService } from "../services/stages.service";
import type { PeriodType } from "../components/dashboard/filters/Filters.component";

/**
 * Hook customizado para gerenciar todos os filtros e estados compartilhados entre os Dashboards.
 *
 * Cascata hierárquica:
 *   Stage → Status → StatusTask
 *                  → Outcome
 *
 * Mudar Stage reseta Status, StatusTask e Outcome.
 * Mudar Status reseta StatusTask e Outcome.
 */
export const useDashboardFilters = (initialOption: string = "desfecho") => {
  // Unique key suffix based on initialOption to prevent cache sharing between dashboards
  const queryKeySuffix = `dashboard-${initialOption}`;

  // 1. Cálculo de Anos (2020 até o ano atual)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let i = currentYear; i >= 2020; i--) arr.push(String(i));
    return arr;
  }, []);

  const initialYear = useMemo(() => {
    return years[0] ?? String(new Date().getFullYear());
  }, [years]);

  // 2. Busca de dados de referência para os filtros
  const { data: citiesData } = useQuery({
    queryKey: ["cities-dashboard", queryKeySuffix],
    queryFn: () => cityService.getAll(),
  });
  const cities = citiesData || [];

  const { data: stagesData } = useQuery({
    queryKey: ["stages-dashboard", queryKeySuffix],
    queryFn: () => stagesService.getAll(),
  });
  const stages = (stagesData || []).map(s => ({
    id: s.id,
    name: s.name,
  }));

  const { data: statusesData } = useQuery({
    queryKey: ["statuses-dashboard", queryKeySuffix],
    queryFn: () => statusService.getAll(),
  });
  const statuses = (statusesData || []).map(s => ({
    id: s.id,
    name: s.name,
    stage_id: s.stage_id,
  }));

  const { data: tasksData } = useQuery({
    queryKey: ["tasks-dashboard", queryKeySuffix],
    queryFn: async () => {
      const data = await statusTasksService.getAll();
      return data;
    },
  });
  const allStatusTasks = (tasksData || []).map(t => ({
    id: t.id,
    name: t.description,
    status_id: t.status_id,
  }));

  const { data: outcomesData } = useQuery({
    queryKey: ["outcomes-dashboard", queryKeySuffix],
    queryFn: () => outcomesService.getAll(),
  });
  const outcomes = (outcomesData || []).map(o => ({
    id: o.id,
    name: o.name,
    status_id: o.status_id,
  }));

  // 3. Estados dos Filtros
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [selectedStatusTaskId, setSelectedStatusTaskId] = useState<string>("");
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>("");
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>(initialOption);
  const [periodType, setPeriodType] = useState<PeriodType>("ano");
  const [periodValue, setPeriodValue] = useState<string>("0");

  // 4. Efeito para resetar o valor do período quando o tipo mudar
  useEffect(() => {
    setPeriodValue("0");
  }, [periodType]);

  // 5. Cascata: Resetar filtros dependentes quando Stage muda
  const handleStageChange = useCallback((stageId: string) => {
    setSelectedStageId(stageId);
    // Ao mudar o stage, o status selecionado pode não pertencer mais a este stage
    setSelectedStatusId("");
    setSelectedStatusTaskId("");
    setSelectedOutcomeId("");
  }, []);

  // 6. Cascata: Resetar filtros dependentes quando Status muda
  const handleStatusChange = useCallback((statusId: string) => {
    setSelectedStatusId(statusId);
    // StatusTask e Outcome dependem do status — resetar ambos
    setSelectedStatusTaskId("");
    setSelectedOutcomeId("");
  }, []);

  return {
    // Constantes
    years,
    cities,
    stages,
    statuses,
    statusTasks: allStatusTasks,
    outcomes,

    // Estados
    selectedYear,
    selectedCityId,
    selectedStatusId,
    selectedStatusTaskId,
    selectedOutcomeId,
    selectedStageId,
    selectedOption,
    periodType,
    periodValue,

    // Setters
    setSelectedYear,
    setSelectedCityId,
    setSelectedStatusId: handleStatusChange,
    setSelectedStatusTaskId,
    setSelectedOutcomeId,
    setSelectedStageId: handleStageChange,
    setSelectedOption,
    setPeriodType,
    setPeriodValue,
  };
};
