import React, { useMemo } from "react";
import { FilterField } from "./FilterField.component";

export type PeriodType = "ano" | "semestre" | "trimestre" | "mes";
export interface FilterProps {
  selectedYear: string;
  onYearChange: (year: string) => void;

  selectedOption: string;
  onFilterOptionChange: (filterOption: string) => void;

  periodType: PeriodType;
  onPeriodTypeChange: (type: PeriodType) => void;

  periodValue: string;
  onPeriodValueChange: (val: string) => void;

  selectedCityId: string;
  onCityChange: (cityId: string) => void;

  selectedStageId?: string;
  onStageChange?: (stageId: string) => void;

  selectedStatusId?: string;
  onStatusChange?: (statusId: string, resetOutcome?: boolean) => void;

  selectedStatusTaskId?: string;
  onStatusTaskChange?: (statusTaskId: string) => void;

  selectedOutcomeId?: string;
  onOutcomeChange?: (outcomeId: string) => void;

  years: string[];
  cities: { id: number; name: string }[];
  stages?: { id: number; name: string }[];
  statuses?: { id: number; name: string; stage_id?: number }[];
  statusTasks?: { id: number; name: string; status_id?: number }[];
  outcomes?: { id: number; name: string; status_id?: number }[];
  filterOptions: Record<string, string>;
  hideFilterOption?: boolean;
}

export const Filters = React.memo(({
  selectedYear,
  onYearChange,
  selectedOption,
  onFilterOptionChange,
  periodType,
  onPeriodTypeChange,
  periodValue,
  onPeriodValueChange,
  selectedCityId,
  onCityChange,
  selectedStatusId,
  onStatusChange,
  selectedStatusTaskId,
  onStatusTaskChange,
  selectedOutcomeId,
  onOutcomeChange,
  selectedStageId,
  onStageChange,
  years,
  cities,
  statuses = [],
  stages = [],
  statusTasks = [],
  outcomes = [],
  filterOptions,
  hideFilterOption,
}: FilterProps) => {
  const yearOptions = useMemo(() => 
    (years.length > 0 ? years : [String(new Date().getFullYear())]).map(y => ({ value: y, label: y }))
  , [years]);

  const cityOptions = useMemo(() => [
    { value: "all", label: "Todas as Cidades" },
    ...cities.map(c => ({ value: String(c.id), label: c.name }))
  ], [cities]);

  const stageOptions = useMemo(() => [
    { value: "all", label: "Todas as Fases" },
    ...stages.map(s => ({ value: String(s.id), label: s.name }))
  ], [stages]);

  const filteredStatuses = useMemo(() => {
    const list = (!selectedStageId || selectedStageId === "all") 
      ? statuses 
      : statuses.filter(s => s.stage_id === Number(selectedStageId));
    
    return [
      { value: "all", label: "Todos os Status" },
      ...list.map(s => ({ value: String(s.id), label: s.name }))
    ];
  }, [statuses, selectedStageId]);

  const filteredTasks = useMemo(() => {
    const list = (!selectedStatusId || selectedStatusId === "all")
      ? statusTasks
      : statusTasks.filter(t => t.status_id === Number(selectedStatusId));

    return [
      { value: "all", label: "Todas as Tarefas" },
      ...list.map(t => ({ value: String(t.id), label: t.name }))
    ];
  }, [statusTasks, selectedStatusId]);

  const filteredOutcomes = useMemo(() => {
    const list = (!selectedStatusId || selectedStatusId === "all")
      ? outcomes
      : outcomes.filter(o => !o.status_id || o.status_id === Number(selectedStatusId));

    return [
      { value: "all", label: "Todos os Resultados" },
      ...list.map(o => ({ value: String(o.id), label: o.name }))
    ];
  }, [outcomes, selectedStatusId]);

  const periodTypeOptions = [
    { value: "ano", label: "Ano Completo" },
    { value: "semestre", label: "Semestre" },
    { value: "trimestre", label: "Trimestre" },
    { value: "mes", label: "Mês" },
  ];

  const currentPeriodOptions = useMemo(() => {
    switch (periodType) {
      case "semestre":
        return [
          { value: "0", label: "1º Semestre" },
          { value: "1", label: "2º Semestre" },
        ];
      case "trimestre":
        return [
          { value: "0", label: "1º Trimestre" },
          { value: "1", label: "2º Trimestre" },
          { value: "2", label: "3º Trimestre" },
          { value: "3", label: "4º Trimestre" },
        ];
      case "mes":
        return [
          { value: "0", label: "Janeiro" }, { value: "1", label: "Fevereiro" },
          { value: "2", label: "Março" }, { value: "3", label: "Abril" },
          { value: "4", label: "Maio" }, { value: "5", label: "Junho" },
          { value: "6", label: "Julho" }, { value: "7", label: "Agosto" },
          { value: "8", label: "Setembro" }, { value: "9", label: "Outubro" },
          { value: "10", label: "Novembro" }, { value: "11", label: "Dezembro" },
        ];
      default:
        return [];
    }
  }, [periodType]);

  const groupingOptions = useMemo(() => 
    Object.entries(filterOptions).map(([value, label]) => ({ value, label }))
  , [filterOptions]);

  return (
    <div className="flex flex-wrap gap-4 px-6 py-6 items-end rounded-2xl bg-card border border-border/50 shadow-elegant transition-elegant hover-glow w-full">
      <FilterField
        id="filter-ano-base"
        label="Ano Base"
        value={selectedYear}
        onValueChange={onYearChange}
        options={yearOptions}
        placeholder="Ano"
        className="flex-1 min-w-[120px]"
      />

      <FilterField
        id="filter-localizacao"
        label="Localização"
        value={selectedCityId || "all"}
        onValueChange={(val) => onCityChange(val === "all" ? "" : val)}
        options={cityOptions}
        placeholder="Todas as Cidades"
        className="flex-1 min-w-[180px]"
      />

      <FilterField
        id="filter-recorte"
        label="Recorte"
        value={periodType}
        onValueChange={(val) => onPeriodTypeChange(val as PeriodType)}
        options={periodTypeOptions}
        placeholder="Período"
        className="flex-1 min-w-[160px]"
      />

      {periodType !== "ano" ? (
        <FilterField
          id="filter-intervalo"
          label="Intervalo"
          value={periodValue}
          onValueChange={onPeriodValueChange}
          options={currentPeriodOptions}
          placeholder="Selecione…"
          className="flex-1 min-w-[160px]"
        />
      ) : null}

      <FilterField
        id="filter-fase"
        label="Por Fase"
        value={selectedStageId || "all"}
        onValueChange={(val) => onStageChange?.(val === "all" ? "" : val)}
        options={stageOptions}
        placeholder="Todas as Fases"
        className="flex-1 min-w-[170px]"
      />

      <FilterField
        id="filter-status"
        label="Por Status"
        value={selectedStatusId || "all"}
        onValueChange={(val) => onStatusChange?.(val === "all" ? "" : val, true)}
        options={filteredStatuses}
        placeholder="Todos os Status"
        className="flex-1 min-w-[170px]"
      />

      <FilterField
        id="filter-tarefa"
        label="Por Tarefa"
        value={selectedStatusTaskId || "all"}
        onValueChange={(val) => onStatusTaskChange?.(val === "all" ? "" : val)}
        options={filteredTasks}
        placeholder="Todas as Tarefas"
        className="flex-1 min-w-[170px]"
      />

      <FilterField
        id="filter-resultado"
        label="Por Resultado"
        value={selectedOutcomeId || "all"}
        onValueChange={(val) => onOutcomeChange?.(val === "all" ? "" : val)}
        options={filteredOutcomes}
        placeholder="Todos os Resultados"
        className="flex-1 min-w-[170px]"
      />

      {!hideFilterOption ? (
        <FilterField
          id="filter-agrupar"
          label="Agrupar por"
          value={selectedOption}
          onValueChange={onFilterOptionChange}
          options={groupingOptions}
          placeholder="Dimensão"
          className="flex-1 min-w-[170px]"
        />
      ) : null}
    </div>
  );
});
