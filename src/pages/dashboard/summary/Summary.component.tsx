import React from "react";
import { JurimetricsKPIs } from "../../../components/dashboard/jurimetrics/JurimetricsKPIs";
import { BivariateBarChart } from "../../../components/dashboard/jurimetrics/BivariateBarChart";
import { FinancialHistogram } from "../../../components/dashboard/jurimetrics/FinancialHistogram";
import { LeadTimeBoxplot } from "../../../components/dashboard/jurimetrics/LeadTimeBoxplot";
import { LineGraph } from "../../../components/dashboard/lineGraph";
import { ReportTable } from "../../../components/reportTable/reportTable";

import type { PeriodType } from "../../../components/dashboard/filters/Filters.component";
import { useSummaryData } from "../../../hooks/useSummaryData";

interface SummaryProps {
  selectedYear: string;
  selectedOption: string;
  filterOptions?: Record<string, string>;
  filterLabel?: string;
  periodType?: PeriodType;
  periodValue?: string;
  selectedCityId?: string;
}

export const Summary: React.FC<SummaryProps> = (props) => {
  const {
    actionCount,
    onTable,
    meanValue,
    medianValue,
    meanLeadTime,
    medianLeadTime,
    lineGraphData,
    histogramData,
    boxplotData,
    bivariateData,
    records,
    friendlyLabel,
    filtros,
    isLoading
  } = useSummaryData(props);

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        Carregando motor de Jurimetria...
      </div>
    );
  }

  return (
    <div className="mt-4 w-full flex flex-col gap-6">
      {/* 1. KPIs Layer */}
      <JurimetricsKPIs 
        actionCount={actionCount}
        meanValue={meanValue}
        medianValue={medianValue}
        meanLeadTime={meanLeadTime}
        medianLeadTime={medianLeadTime}
        onTable={onTable}
      />

      {/* 2. Main Analysis Layer (Bivariate & Histogram) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <BivariateBarChart 
           data={bivariateData} 
           title={`Performance por ${friendlyLabel}`} 
        />
        <FinancialHistogram 
           data={histogramData} 
        />
      </div>

      {/* 3. Operational Layer (Boxplot & Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadTimeBoxplot 
           data={boxplotData} 
        />
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-auto flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-foreground">Tendência Histórica (Série Temporal)</h3>
            <div className="flex-1 w-full min-h-0">
                <LineGraph
                    data={lineGraphData}
                    filtros={filtros}
                    selectedYear={props.selectedYear}
                    filterLabel={friendlyLabel}
                    periodType={props.periodType}
                    periodValue={props.periodValue}
                />
            </div>
            <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Metodologia OPC:</p>
                <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">O Quê:</span> Volume de novas distribuições mês a mês. <br/>
                <span className="font-bold text-foreground">Por Quê:</span> Picos de entrada podem indicar novas tendências jurídicas. <br/>
                <span className="font-bold text-foreground">Como:</span> Antecipar contratações de estagiários se a tendência for de alta.
                </p>
            </div>
        </div>
      </div>

      {/* 4. Data Inventory Layer */}
      <div className="w-full mb-6">
        <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Inventário de Processos Recentes</h3>
        </div>
        <ReportTable data={records} />
      </div>
    </div>
  );
};
