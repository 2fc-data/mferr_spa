import { MultiGraph } from "graphology";
import betweennessCentrality from "graphology-metrics/centrality/betweenness";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface GraphStats {
  nodes: number;
  edges: number;
}

export interface GraphDataPackage {
  graph: any;
  centralityTable: any[];
  stats: GraphStats;
  density: number;
  clusteringCoefficient: number;
  conflictsCount: number;
}

export const HUB_CATEGORIES = [
  { id: "All", label: "Toda a Rede" },
  { id: "Processo", label: "Processos" },
  { id: "Advogado", label: "Advogados" },
  { id: "Cliente", label: "Clientes" },
  { id: "Tribunal", label: "Tribunais" },
  { id: "Vara", label: "Varas" },
  { id: "Cidade", label: "Cidades" },
  { id: "Área", label: "Áreas de Atuação" },
];

export const getThemeColors = (isDark: boolean) => ({
  nodes: {
    Processo: isDark ? "#d4af37" : "#1a365d",
    Tribunal: "#ef4444",
    Área: "#10b981",
    Cidade: "#f59e0b",
    Resultado: "#8b5cf6",
    Advogado: isDark ? "#94a3b8" : "#475569",
    Cliente: "#14b8a6",
    Vara: "#f97316",
    Pessoa: "#3b82f6",
  } as Record<string, string>,
  edges: {
    "tramita em": isDark ? "#334155" : "#cbd5e1",
    "área de atuação": "#86efac",
    "resultado": "#c4b5fd",
    "advogado de": "#f9a8d4",
    "cliente de": "#5eead4",
    "parte de": "#93c5fd",
  } as Record<string, string>
});

export const buildEnhancedGraph = (records: any[], colors: any, conflictIds: Set<number>) => {
  const graph: any = new MultiGraph();
  
  const addNode = (id: string, l: string, cat: string, s: number = 5, userId?: number) => {
    if (!graph.hasNode(id)) {
      const isConflict = userId && conflictIds.has(userId);
      graph.addNode(id, { 
        label: l, 
        size: s, 
        color: isConflict ? "#f43f5e" : (colors.nodes[cat] || "#999"), 
        borderColor: isConflict ? "#f43f5e" : "transparent",
        category: cat, 
        type: "circle", 
        x: Math.random() * 100, 
        y: Math.random() * 100,
        isConflict
      });
    }
  };

  const addEdge = (s: string, t: string, rel: string, w: number = 1) => {
    if (graph.hasNode(s) && graph.hasNode(t)) {
      const edges = graph.edges(s, t);
      const existing = edges.find((e: string) => graph.getEdgeAttribute(e, "label") === rel);
      if (existing) {
        const oldW = graph.getEdgeAttribute(existing, "weight") || 1;
        graph.setEdgeAttribute(existing, "weight", oldW + w);
        graph.setEdgeAttribute(existing, "size", Math.min((oldW + w) * 0.5, 4));
      } else {
        graph.addEdge(s, t, { label: rel, color: colors.edges[rel] || "#cbd5e1", size: w, weight: w, type: "curve" });
      }
    }
  };

  records.forEach((c: any) => {
    const cid = `proc-${c.id}`;
    addNode(cid, c.number || `Proc #${c.id}`, "Processo", 6);
    if (c.court?.name) { 
      const courtId = c.court_id || `name-${c.court.name}`;
      addNode(`t-${courtId}`, c.court.name, "Tribunal", 15); 
      addEdge(cid, `t-${courtId}`, "tramita em"); 
    }
    if (c.city?.name) { 
      const cityId = c.city_id || `name-${c.city.name}`;
      addNode(`city-${cityId}`, c.city.name, "Cidade", 12); 
      addEdge(cid, `city-${cityId}`, "localizado em"); 
    }
    if (c.area?.name) { 
      const areaId = c.area_id || `name-${c.area.name}`;
      addNode(`a-${areaId}`, c.area.name, "Área", 14); 
      addEdge(cid, `a-${areaId}`, "área de atuação"); 
    }
    if (c.division?.name) {
      const divId = c.division_id || c.division.id || `name-${c.division.name}`;
      addNode(`d-${divId}`, c.division.name, "Vara", 10);
      addEdge(cid, `d-${divId}`, "vara do processo");
    }
    if (c.cause_users) {
      c.cause_users.forEach((cu: any) => { 
        if (cu.user?.name) { 
          const roleSlug = (cu.role_type?.slug || cu.role_type?.name?.toLowerCase() || (typeof cu.role_type === "string" ? cu.role_type.toLowerCase() : "")).trim();
          const isLawyer = roleSlug.includes("lawyer") || roleSlug.includes("advogado");
          const isClient = roleSlug.includes("client") || roleSlug.includes("cliente");
          const cat = isLawyer ? "Advogado" : (isClient ? "Cliente" : "Pessoa"); 
          addNode(`u-${cu.user_id}`, cu.user.name, cat, isLawyer ? 12 : 8, cu.user_id); 
          addEdge(`u-${cu.user_id}`, cid, isLawyer ? "advogado de" : (isClient ? "cliente de" : "parte de")); 
        } 
      });
    }
  });
  
  return graph;
};

export const computeCentrality = (graph: any) => {
  if (graph.order < 1) return [];
  try {
    const c = betweennessCentrality(graph);
    return graph.nodes().map((n: string) => ({
      id: n,
      label: graph.getNodeAttribute(n, "label"),
      category: graph.getNodeAttribute(n, "category"),
      centrality: Number(c[n] || 0),
      connections: graph.degree(n)
    })).sort((a: any, b: any) => b.connections - a.connections);
  } catch { return []; }
};

export const exportToPDF = (graphData: GraphDataPackage | null, prevGraphData: any | null, hubCategory: string) => {
  if (!graphData) return;
  try {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(26, 54, 93);
    doc.text("Inteligência de Rede Jurídica", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filtro de Hubs: ${HUB_CATEGORIES.find(c => c.id === hubCategory)?.label || "Geral"}`, 20, 38);

    const statsData = [
      ["Métrica", "Atual", "Anterior", "Diferença"],
      ["Nodes (Entidades)", graphData.stats.nodes.toString(), prevGraphData?.stats.nodes.toString() || "-", (graphData.stats.nodes - (prevGraphData?.stats.nodes || 0)).toString()],
      ["Edges (Conexões)", graphData.stats.edges.toString(), prevGraphData?.stats.edges.toString() || "-", (graphData.stats.edges - (prevGraphData?.stats.edges || 0)).toString()],
    ];

    autoTable(doc, { 
      startY: 45, 
      head: [statsData[0]], 
      body: statsData.slice(1), 
      theme: 'grid', 
      headStyles: { fillColor: [26, 54, 93], fontStyle: 'bold' } 
    });

    const filteredHubs = graphData.centralityTable
      .filter(n => hubCategory === "All" || n.category === hubCategory)
      .slice(0, 15);

    if (filteredHubs.length > 0) {
      doc.text("Ranking de Influência (Hubs Selecionados)", 20, (doc as any).lastAutoTable.finalY + 15);
      const hubRows = filteredHubs.map((h, i) => [(i+1).toString(), h.label, h.category, h.connections.toString()]);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["#", "Nome/Identificador", "Categoria", "Grau de Conexão"]],
        body: hubRows,
        theme: 'striped',
        headStyles: { fillColor: [212, 175, 55], textColor: [26, 54, 93] } // Gold header
      });
    }

    doc.save(`relatorio-rede-juridica-${hubCategory.toLowerCase()}.pdf`);
  } catch (err) {
    console.error("Erro ao exportar PDF:", err);
  }
};
