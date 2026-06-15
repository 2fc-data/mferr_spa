import React from "react";
import { KPICard } from "../../dashboard/KPICard";
import { Network, Users, Share2, Layers } from "lucide-react";

interface NetworkStatsGridProps {
  stats: {
    nodes: number;
    edges: number;
  };
  density: number;
  clusteringCoefficient: number;
}

export const NetworkStatsGrid = React.memo(({
  stats,
  density,
  clusteringCoefficient,
}: NetworkStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <KPICard 
        label="Total de Nós"
        value={stats.nodes}
        description="Entidades únicas (Advogados/Órgãos)"
        icon={Users}
      />
      <KPICard 
        label="Total de Arestas"
        value={stats.edges}
        description="Conexões de atuação processual"
        icon={Share2}
      />
      <KPICard 
        label="Densidade do Grafo"
        value={`${(density * 100).toFixed(2)}%`}
        description="Nível de conectividade da rede"
        icon={Network}
      />
      <KPICard 
        label="Cluster Linkage"
        value={(clusteringCoefficient * 100).toFixed(1)}
        description="Nível de agrupamento local médio"
        icon={Layers}
      />
    </div>
  );
});
