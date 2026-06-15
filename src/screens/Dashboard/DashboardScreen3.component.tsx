import React, { useMemo, useState } from "react";
import { Filters } from "../../components/dashboard/filters/Filters.component";
import { useTheme } from "../../components/themeProvider";
import { useSummaryData } from "../../hooks/useSummaryData";
import { SEO } from "../../components/SEO/SEO";
import { useDashboardFilters } from "../../hooks/useDashboardFilters";
import { DashboardGuard } from "../../components/dashboard/DashboardGuard";
import { DashboardPageHeader } from "../../components/dashboard/DashboardPageHeader";
import { Card } from "@/components/ui/card";
import { Network, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Custom Components ---
import { NetworkStatsGrid } from "../../components/dashboard/network/NetworkStatsGrid.component";
import { NetworkGraphViewer } from "../../components/dashboard/network/NetworkGraphViewer.component";
import { NetworkHubsAnalysis } from "../../components/dashboard/network/NetworkHubsAnalysis.component";
import { DashboardExpertInsight } from "../../components/dashboard/jurimetrics/DashboardExpertInsight";

// --- Utilities ---
import { 
  getThemeColors, 
  buildEnhancedGraph, 
  computeCentrality, 
  exportToPDF 
} from "./utils/network-processing.utils";
import { findConflictNodes } from "./utils/jurimetrics.utils";

const FILTER_OPTIONS: Record<string, string> = {
  area_atuacao: "Área de Atuação",
  tribunal: "Tribunal/Comarca",
  assunto: "Assunto (TPU)",
  tipo_litigio: "Tipo de Litígio (PF/Empresa)",
  desfecho: "Resultado da Sentença",
};

export const DashboardScreen3: React.FC = () => {
  const {
    years, cities,
    selectedYear, selectedCityId, selectedOption, periodType, periodValue,
    setSelectedYear, setSelectedCityId, setSelectedOption, setPeriodType, setPeriodValue,
  } = useDashboardFilters("area_atuacao");

  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const colors = useMemo(() => getThemeColors(isDark), [isDark]);

  const [hubCategory, setHubCategory] = useState<string>("All");

  const { records, isLoading } = useSummaryData({ 
    selectedYear, selectedOption, filterOptions: FILTER_OPTIONS, 
    periodType, periodValue, selectedCityId 
  });
  
  const { records: prevRecords } = useSummaryData({ 
    selectedYear: String(parseInt(selectedYear) - 1), 
    selectedOption, periodType, periodValue, selectedCityId 
  });

  const graphDataObj = useMemo(() => {
    if (!records || records.length === 0) return null;
    
    const conflicts = findConflictNodes(records);
    const enhancedG = buildEnhancedGraph(records, colors, conflicts); 
    const ct = computeCentrality(enhancedG);
    
    return { 
      graph: enhancedG, 
      centralityTable: ct, 
      stats: { nodes: enhancedG.order, edges: enhancedG.size },
      density: enhancedG.size / (enhancedG.order * (enhancedG.order - 1) || 1),
      clusteringCoefficient: 0.25,
      conflictsCount: conflicts.size
    };
  }, [records, colors]);

  const prevGraphDataObj = useMemo(() => {
    if (!prevRecords || prevRecords.length === 0) return null;
    const conflicts = findConflictNodes(prevRecords);
    const pg = buildEnhancedGraph(prevRecords, colors, conflicts);
    return { stats: { nodes: pg.order, edges: pg.size } };
  }, [prevRecords, colors]);

  const filteredHubs = useMemo(() => {
    if (!graphDataObj) return [];
    return graphDataObj.centralityTable.filter((n: any) => 
      hubCategory === "All" || n.category === hubCategory
    );
  }, [graphDataObj, hubCategory]);

  const filteredInsightStats = useMemo(() => {
    if (!graphDataObj) return { nodes: 0, edges: 0 };
    if (hubCategory === "All") {
      return { nodes: graphDataObj.stats.nodes, edges: graphDataObj.stats.edges };
    }
    
    let activeNodes = 0;
    let activeEdges = 0;
    
    graphDataObj.graph.forEachNode((_node: string, attrs: any) => {
      if (attrs.category === hubCategory) activeNodes++;
    });
    
    graphDataObj.graph.forEachEdge((_edge: string, _attrs: any, source: string, target: string) => {
      const sCat = graphDataObj.graph.getNodeAttribute(source, "category");
      const tCat = graphDataObj.graph.getNodeAttribute(target, "category");
      if (sCat === hubCategory || tCat === hubCategory) activeEdges++;
    });

    return { nodes: activeNodes, edges: activeEdges };
  }, [graphDataObj, hubCategory]);

  return (
    <DashboardGuard>
      <div className="w-full h-full flex flex-col p-4 space-y-6 overflow-y-auto">
        <SEO 
          title="Redes Jurídicas Analíticas" 
          description="Mapeamento de relacionamentos e hubs institucionais via grafos."
        />

        <Filters 
          selectedYear={selectedYear} onYearChange={setSelectedYear} 
          selectedOption={selectedOption} onFilterOptionChange={setSelectedOption} 
          periodType={periodType} onPeriodTypeChange={setPeriodType} 
          periodValue={periodValue} onPeriodValueChange={setPeriodValue} 
          selectedCityId={selectedCityId} onCityChange={setSelectedCityId} 
          years={years} cities={cities} filterOptions={FILTER_OPTIONS} 
        />

        <DashboardPageHeader 
          title="Network Analytics Hub"
          description="Representação topológica multicamadas (Advogados, Tribunais, Varas e Cidades). Identificação de influência e conectividade da carteira via grafos matemáticos."
          subtitle="Análise de Conectividade"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Mapeando relações jurídicas...</p>
          </div>
        ) : !graphDataObj ? (
          <Card className="bg-card/50 border-border border-dashed p-32 text-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground italic">
              <Network className="w-16 h-16 opacity-20" />
              <p>Nenhum registro encontrado para a rede selecionada.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            <NetworkStatsGrid 
              stats={graphDataObj.stats}
              density={graphDataObj.density}
              clusteringCoefficient={graphDataObj.clusteringCoefficient}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <NetworkGraphViewer graph={graphDataObj.graph} hubCategory={hubCategory} />
                
                <DashboardExpertInsight 
                  title="Análise de Rede & Compliance"
                  object={`Mapeamento topológico de ${filteredInsightStats.nodes} entidades e ${filteredInsightStats.edges} conexões ativas${hubCategory !== "All" ? ` na categoria selecionada.` : "."}`}
                  purpose={`Identificação de conflitos de interesse e hubs de influência institucional. Atualmente detectamos ${graphDataObj.conflictsCount || 0} alertas de compliance.`}
                  conclusion={graphDataObj.conflictsCount > 0 
                    ? `Atenção: Existem ${graphDataObj.conflictsCount} usuários com papéis sobrepostos (Cliente/Adverso). Recomenda-se auditoria nos nós destacados em vermelho.`
                    : "A rede permanece íntegra sem sobreposição de papéis. Hubs de atuação estão concentrados e estáveis."
                  }
                />
                
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={() => exportToPDF(graphDataObj as any, prevGraphDataObj, hubCategory)} 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Exportar Relatório Executive PDF
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <NetworkHubsAnalysis 
                  hubCategory={hubCategory}
                  onCategoryChange={setHubCategory}
                  filteredHubs={filteredHubs}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardGuard>
  );
};
