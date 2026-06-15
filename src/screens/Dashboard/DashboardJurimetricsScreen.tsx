import React, { useMemo } from "react";
import { Filters } from "../../components/dashboard/filters/Filters.component";
import { useSummaryData } from "../../hooks/useSummaryData";
import { SEO } from "../../components/SEO/SEO";
import { useDashboardFilters } from "../../hooks/useDashboardFilters";
import { DashboardGuard } from "../../components/dashboard/DashboardGuard";
import { DashboardPageHeader } from "../../components/dashboard/DashboardPageHeader";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Activity, Scale, Clock } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

// --- Custom Components ---
import { JurimetricsOverview } from "../../components/dashboard/jurimetrics/JurimetricsOverview.component";
import { JurimetricsBenchmarking } from "../../components/dashboard/jurimetrics/JurimetricsBenchmarking.component";
import { JurimetricsSurvival } from "../../components/dashboard/jurimetrics/JurimetricsSurvival.component";
import { JurimetricsTriage } from "../../components/dashboard/jurimetrics/JurimetricsTriage.component";

// --- Utilities ---
import { processJurimetricsData } from "./utils/jurimetrics-processing.utils";

const FILTER_OPTIONS: Record<string, string> = {
  area_atuacao: "Especialidade (Área)",
  status_processo: "Evolução (Status)",
  estagio_atual: "Fase Processual",
  desfecho: "Resultado da Sentença",
  tribunal: "Comarca / Tribunal",
  assunto: "Assunto (TPU)",
  tipo_litigio: "Perfil do Cliente"
};

const RISK_PIE_CONFIG = {
  value: { label: "Processos" },
  "Provável": { label: "Provável", color: "#e11d48" },
  "Possível": { label: "Possível", color: "#ca8a04" },
  "Remota": { label: "Remota", color: "#2563eb" },
} satisfies ChartConfig;

export const DashboardJurimetricsScreen: React.FC = () => {
  const {
    years, cities, stages, statuses, statusTasks, outcomes,
    selectedYear, selectedCityId, selectedOption, periodType,
    periodValue, selectedStatusId, selectedStatusTaskId,
    selectedOutcomeId, selectedStageId,
    setSelectedYear, setSelectedCityId, setSelectedOption,
    setPeriodType, setPeriodValue, setSelectedStatusId,
    setSelectedStatusTaskId, setSelectedOutcomeId, setSelectedStageId,
  } = useDashboardFilters("area_atuacao");

  const { records, isLoading } = useSummaryData({
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

  const analysis = useMemo(() => 
    processJurimetricsData(records, RISK_PIE_CONFIG)
  , [records]);

  return (
    <DashboardGuard>
      <div className="w-full flex-1 h-full overflow-y-auto p-4 space-y-6">
        <SEO 
          title="Hub de Inteligência Jurimétrica" 
          description="Central de análise preditiva, benchmarking e sobrevivência processual."
        />

        <Filters
          selectedYear={selectedYear} onYearChange={setSelectedYear}
          selectedOption={selectedOption} onFilterOptionChange={setSelectedOption}
          periodType={periodType} onPeriodTypeChange={setPeriodType}
          periodValue={periodValue} onPeriodValueChange={setPeriodValue}
          selectedCityId={selectedCityId} onCityChange={setSelectedCityId}
          selectedStatusId={selectedStatusId} onStatusChange={setSelectedStatusId}
          selectedStageId={selectedStageId} onStageChange={setSelectedStageId}
          selectedStatusTaskId={selectedStatusTaskId} onStatusTaskChange={setSelectedStatusTaskId}
          selectedOutcomeId={selectedOutcomeId} onOutcomeChange={setSelectedOutcomeId}
          years={years} cities={cities}
          stages={stages} statuses={statuses}
          statusTasks={statusTasks} outcomes={outcomes}
          filterOptions={FILTER_OPTIONS}
        />

        <DashboardPageHeader 
          title="Legal Intelligence Hub"
          description="Visão consolidada da carteira jurídica sob a ótica de risco, celeridade e benchmarking."
          subtitle="Análise Multivariada"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-muted-foreground animate-pulse">Processando modelos estatísticos...</p>
          </div>
        ) : !analysis ? (
          <div className="text-center p-20 bg-card border border-dashed rounded-xl text-muted-foreground">
            Dados insuficientes para gerar a análise.
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="w-4 h-4" /> Panorama de Risco
              </TabsTrigger>
              <TabsTrigger value="benchmarking" className="gap-2">
                <Scale className="w-4 h-4" /> Benchmarking
              </TabsTrigger>
              <TabsTrigger value="survival" className="gap-2">
                <Clock className="w-4 h-4" /> Ciclo de Vida
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <JurimetricsOverview 
                stats={analysis.stats}
                pieData={analysis.pieData}
                areaRiskData={analysis.areaRiskData}
                riskPieConfig={RISK_PIE_CONFIG}
              />
              <div className="mt-6">
                <JurimetricsTriage topCases={analysis.topCases} />
              </div>
            </TabsContent>

            <TabsContent value="benchmarking">
              <JurimetricsBenchmarking 
                mwResult={analysis.mwResult}
                cityRanking={analysis.cityRanking}
              />
            </TabsContent>

            <TabsContent value="survival">
              <JurimetricsSurvival 
                kmData={analysis.kmData}
                cityRanking={analysis.cityRanking}
                top2Names={analysis.top2Names}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardGuard>
  );
};
