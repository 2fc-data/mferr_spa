import React, { useMemo, useState } from "react";
import { Filters } from "../../components/dashboard/filters/Filters.component";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Navigate } from "react-router-dom";
import { useSummaryData } from "../../hooks/useSummaryData";
import { AlertCircle, TrendingUp } from "lucide-react";
import { CrmActionDrawer } from "../../components/dashboard/crm/CrmActionDrawer.component";
import { TaskAnalyticsPanel } from "../../components/dashboard/crm/TaskAnalyticsPanel.component";
import { OutcomeAnalyticsPanel } from "../../components/dashboard/crm/OutcomeAnalyticsPanel.component";
import { useDashboardFilters } from "../../hooks/useDashboardFilters";
import { useOperationalData } from "../../hooks/useOperationalData";
import { computeOutcomeAnalytics } from "./utils/outcome-analytics.utils";
import { DashboardExpertInsight } from "../../components/dashboard/jurimetrics/DashboardExpertInsight";

// New modular components and utils
import { KpiGrid } from "../../components/dashboard/crm/KpiGrid.component";
import { ChartsSection } from "../../components/dashboard/crm/ChartsSection.component";
import { PriorityTable } from "../../components/dashboard/crm/PriorityTable.component";
import { 
  processScoredRecords, 
  calculateBottlenecks, 
  calculateDimensionalVolume, 
  orchestrateStorytelling 
} from "./utils/crm-processing.utils";

const FILTER_OPTIONS: Record<string, string> = {
  area_atuacao: "Especialidade (Área)",
  status_processo: "Evolução (Status)",
  estagio_atual: "Fase Processual",
  tribunal: "Comarca / Tribunal",
  tipo_litigio: "Perfil do Cliente",
  assunto: "Assunto (TPU)"
};

export const DashboardCRMScreen: React.FC = () => {
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.profiles?.some((p: any) => p.id === 1);

  const {
    years,
    cities,
    stages,
    statuses,
    statusTasks,
    outcomes,
    selectedYear,
    selectedCityId,
    selectedOption,
    periodType,
    periodValue,
    selectedStatusId,
    selectedStatusTaskId,
    selectedOutcomeId,
    selectedStageId,
    setSelectedYear,
    setSelectedCityId,
    setSelectedOption,
    setPeriodType,
    setPeriodValue,
    setSelectedStatusId,
    setSelectedStatusTaskId,
    setSelectedOutcomeId,
    setSelectedStageId,
  } = useDashboardFilters("area_atuacao");

  const [selectedCause, setSelectedCause] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const selectedCityName = useMemo(() => 
    cities.find(c => String(c.id) === selectedCityId)?.name || "Todas as Comarcas"
  , [cities, selectedCityId]);

  const { records, isLoading, actionCount, bivariateData, trends, friendlyLabel } = useSummaryData({
    selectedYear,
    selectedOption,
    filterOptions: FILTER_OPTIONS,
    periodType,
    periodValue,
    selectedCityId,
    selectedStatusId,
    selectedStageId,
    selectedStatusTaskId,
    selectedOutcomeId,
  });

  const crmAnalysis = useMemo(() => {
    if (!records || records.length === 0) return null;

    const scoredRecords = processScoredRecords(records);
    const bottlenecks = calculateBottlenecks(scoredRecords);
    const dimensionalData = calculateDimensionalVolume(records, selectedOption);
    const story = orchestrateStorytelling({ 
      records, 
      scoredRecords, 
      trends, 
      stageData: bottlenecks.stageData, 
      statusData: bottlenecks.statusData 
    });

    return {
      scoredRecords: scoredRecords.slice(0, 10),
      ...bottlenecks,
      story,
      dimensionalData,
      friendlyLabel
    };
  }, [records, selectedYear, currentUser, selectedCityName, actionCount, trends, selectedOption, bivariateData, friendlyLabel]);

  const isTaskFilterActive = !!selectedStatusId || !!selectedStatusTaskId;
  const isOutcomeFilterActive = !!selectedOutcomeId;

  const { operationalData, isLoadingOps } = useOperationalData({
    enabled: isTaskFilterActive,
    selectedYear,
    selectedStatusId,
    selectedStatusTaskId,
    selectedCityId,
    selectedStageId,
    periodType,
    periodValue,
  });

  const outcomeAnalysis = useMemo(() => {
    if (!records || records.length === 0 || !isOutcomeFilterActive) return null;
    
    const resolveGroupKey = (r: any): string => {
      switch (selectedOption) {
        case 'tipo_litigio':   return r.litigation_type || 'Não Informado';
        case 'area_atuacao':   return r.area?.name || 'Não Informado';
        case 'status_processo': return r.current_status?.name || 'Não Informado';
        case 'estagio_atual':  return r.current_stage?.name || 'Não Informado';
        case 'tribunal':       return r.court?.name || 'Não Informado';
        case 'assunto':        return r.subject || 'Não Informado';
        default:               return r.litigation_type || 'Não Informado';
      }
    };

    return computeOutcomeAnalytics(records, resolveGroupKey);
  }, [records, selectedOption, isOutcomeFilterActive]);

  const handleRowClick = (cause: any) => {
    setSelectedCause(cause);
    setIsDrawerOpen(true);
  };

  if (!isAdmin) return <Navigate to="/Dashboard/users" replace />;

  return (
    <div className="w-full flex-1 h-full overflow-y-auto p-4 space-y-6">
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
        selectedStatusId={selectedStatusId}
        onStatusChange={setSelectedStatusId}
        selectedStatusTaskId={selectedStatusTaskId}
        onStatusTaskChange={setSelectedStatusTaskId}
        selectedOutcomeId={selectedOutcomeId}
        onOutcomeChange={setSelectedOutcomeId}
        selectedStageId={selectedStageId}
        onStageChange={setSelectedStageId}
        years={years}
        cities={cities}
        statuses={statuses}
        stages={stages}
        statusTasks={statusTasks}
        outcomes={outcomes}
        filterOptions={FILTER_OPTIONS}
        hideFilterOption={false}
      />

      <DashboardExpertInsight 
        object={crmAnalysis?.story.expertInsight.object}
        purpose={crmAnalysis?.story.expertInsight.purpose}
        conclusion={crmAnalysis?.story.expertInsight.conclusion}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Sincronizando dados históricos e filtros...</p>
        </div>
      ) : !crmAnalysis ? (
        <div className="text-center p-12 text-muted-foreground bg-card rounded-lg border">
          Sem dados suficientes para gerar o CRM nesta combinação de filtros.
        </div>
      ) : (
        <>
          {/* --- OPERATIONAL ALERTS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
             {crmAnalysis.story.priority.headline !== '0 Casos Críticos' ? (
               <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-rose-900 font-bold text-sm">Atenção Operacional</p>
                    <p className="text-rose-700 text-xs leading-relaxed">
                      {crmAnalysis.story.priority.story} Recomenda-se revisão imediata para evitar bloqueios judiciais.
                    </p>
                  </div>
               </div>
             ) : <div className="hidden" />}

             <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-900 font-bold text-sm">Diagnóstico de Performance</p>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    {crmAnalysis.story.volume.story} {crmAnalysis.story.timing.story}
                  </p>
                </div>
             </div>
          </div>

          <KpiGrid story={crmAnalysis.story} />

          <ChartsSection 
            dimensionalData={crmAnalysis.dimensionalData}
            stageData={crmAnalysis.stageData}
            statusData={crmAnalysis.statusData}
            dynamicStageConfig={crmAnalysis.dynamicStageConfig}
            dynamicStatusConfig={crmAnalysis.dynamicStatusConfig}
            friendlyLabel={crmAnalysis.friendlyLabel}
            timingStory={crmAnalysis.story.timing.story}
            priorityStory={crmAnalysis.story.priority.story}
          />

          {isTaskFilterActive ? (
            <TaskAnalyticsPanel
              data={operationalData!}
              isLoading={isLoadingOps}
              statusLabel={statuses.find(s => String(s.id) === selectedStatusId)?.name}
              taskLabel={statusTasks.find(st => String(st.id) === selectedStatusTaskId)?.name}
            />
          ) : null}

          {isOutcomeFilterActive && outcomeAnalysis ? (
            <OutcomeAnalyticsPanel
              data={outcomeAnalysis}
              dimensionLabel={crmAnalysis?.friendlyLabel}
            />
          ) : null}

          <PriorityTable 
            scoredRecords={crmAnalysis.scoredRecords}
            selectedCityName={selectedCityName}
            onRowClick={handleRowClick}
          />
        </>
      )}

      <CrmActionDrawer
        cause={selectedCause}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        statuses={statuses}
        stages={stages}
      />
    </div>
  );
};
