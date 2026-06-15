import React, { useState } from "react";
import { Filters } from "../../components/dashboard/filters/Filters.component";
import { Summary } from "../../pages/dashboard/summary/Summary.component";
import { OperationsDashboard } from "../../pages/dashboard/operations/Operations.component";
import { SEO } from "../../components/SEO/SEO";
import { useDashboardFilters } from "../../hooks/useDashboardFilters";
import { DashboardGuard } from "../../components/dashboard/DashboardGuard";
import { DashboardPageHeader } from "../../components/dashboard/DashboardPageHeader";

export const DashboardScreen: React.FC = () => {
  const {
    years,
    cities,
    statuses,
    stages,
    statusTasks,
    outcomes,
    selectedYear,
    selectedCityId,
    selectedOption,
    periodType,
    periodValue,
    selectedStatusId,
    selectedStatusTaskId,
    selectedStageId,
    selectedOutcomeId,
    setSelectedYear,
    setSelectedCityId,
    setSelectedOption,
    setPeriodType,
    setPeriodValue,
    setSelectedStatusId,
    setSelectedStatusTaskId,
    setSelectedStageId,
    setSelectedOutcomeId,
  } = useDashboardFilters("desfecho");

  const [activeTab, setActiveTab] = useState<"summary" | "operations">("summary");

  return (
    <DashboardGuard>
      <div className="w-full flex-1 h-full overflow-y-auto p-2">
      <SEO 
        title="Análise Jurimétrica Exploratória" 
        description="Mapeamento de padrões e tendências processuais institucionais."
        robots="noindex, nofollow"
      />
      <Filters
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedOption={selectedOption}
        onFilterOptionChange={setSelectedOption}
        periodType={periodType}
        onPeriodTypeChange={setPeriodType}
        periodValue={periodValue}
        onPeriodValueChange={setPeriodValue}
        selectedCityId={selectedCityId}
        onCityChange={setSelectedCityId}
        years={years}
        cities={cities}
        stages={stages}
        statuses={statuses}
        statusTasks={statusTasks}
        outcomes={outcomes}
        selectedStageId={selectedStageId}
        onStageChange={setSelectedStageId}
        selectedStatusId={selectedStatusId}
        onStatusChange={setSelectedStatusId}
        selectedStatusTaskId={selectedStatusTaskId}
        onStatusTaskChange={setSelectedStatusTaskId}
        selectedOutcomeId={selectedOutcomeId}
        onOutcomeChange={setSelectedOutcomeId}
        filterOptions={FILTER_OPTIONS}
      />

      <DashboardPageHeader 
        title="Análise Jurimétrica Descritiva e Exploratória"
        description="Transformar dados brutos em insights acionáveis, mapeando padrões, tendências processuais e revelando gargalos institucionais."
      />

      <div className="flex bg-muted/30 p-1 w-full max-w-sm rounded-[1.5rem] border mx-auto mt-2 mb-4">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex-1 text-[11px] h-9 font-bold uppercase tracking-widest rounded-3xl transition-all duration-300 ${
            activeTab === "summary"
              ? "bg-background text-foreground shadow-sm shadow-black/5"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          Resumo Jurimétrico
        </button>
        <button
          onClick={() => setActiveTab("operations")}
          className={`flex-1 text-[11px] h-9 font-bold uppercase tracking-widest rounded-3xl transition-all duration-300 ${
            activeTab === "operations"
              ? "bg-background text-foreground shadow-sm shadow-black/5"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          Gestão Operacional
        </button>
      </div>

      {activeTab === "summary" ? (
        <Summary
          selectedYear={selectedYear}
          selectedOption={selectedOption}
          filterOptions={FILTER_OPTIONS}
          periodType={periodType}
          periodValue={periodValue}
          selectedCityId={selectedCityId}
        />
      ) : (
        <OperationsDashboard
          selectedYear={selectedYear}
          selectedOption={selectedOption}
          filterOptions={FILTER_OPTIONS}
          periodType={periodType}
          periodValue={periodValue}
          selectedCityId={selectedCityId}
        />
      )}
    </div>
  </DashboardGuard>
  );
};

const FILTER_OPTIONS: Record<string, string> = {
  area_atuacao: "Área de Atuação",
  status_processo: "Status do Processo",
  estagio_atual: "Estágio Atual",
  desfecho: "Resultado da Sentença",
  tribunal: "Tribunal/Comarca",
  cliente_cidade: "Cidade do Cliente",
  assunto: "Assunto (TPU)",
  tipo_litigio: "Tipo de Litígio (PF/Empresa)"
};
