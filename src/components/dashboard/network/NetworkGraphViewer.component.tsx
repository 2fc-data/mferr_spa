import React, { useState, useEffect, useRef } from "react";
import Sigma from "sigma";
import forceAtlas2 from "graphology-layout-forceatlas2";
import EdgeCurveProgram from "@sigma/edge-curve";
import { NodeBorderProgram } from "@sigma/node-border";
import { Search, ZoomIn, Maximize2, Play, Pause, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../themeProvider";

interface NetworkGraphViewerProps {
  graph: any;
  hubCategory?: string;
}

export const NetworkGraphViewer = React.memo(({ graph, hubCategory = "All" }: NetworkGraphViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isForceActive, setIsForceActive] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current || !graph || graph.order === 0) return;

    if (isForceActive) {
      forceAtlas2.assign(graph, { 
        iterations: 50, 
        settings: { gravity: 0.05, scalingRatio: 250 } 
      });
    }

    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    const renderer = new Sigma(graph, containerRef.current, {
      renderLabels: true, 
      labelColor: { attribute: "labelColor", color: isDark ? "#f8fafc" : "#0f172a" },
      defaultEdgeType: "curve", 
      defaultEdgeColor: isDark ? "#1e293b" : "#e2e8f0",
      nodeProgramClasses: { circle: NodeBorderProgram },
      edgeProgramClasses: { curve: EdgeCurveProgram },
      labelFont: "Inter, sans-serif",
      labelSize: 11,
      labelWeight: "600",
      zIndex: true,
    });

    let draggedNode: string | null = null;
    let isDragging = false;
    const mouseCaptor = renderer.getMouseCaptor();

    renderer.on("downNode", (e) => { 
      isDragging = true; 
      draggedNode = e.node; 
      e.preventSigmaDefault(); 
    });

    mouseCaptor.on("mousemove", (e) => { 
      if (!isDragging || !draggedNode) return; 
      const pos = renderer.viewportToGraph(e); 
      graph.setNodeAttribute(draggedNode, "x", pos.x); 
      graph.setNodeAttribute(draggedNode, "y", pos.y); 
      e.preventSigmaDefault(); 
      e.original.preventDefault(); 
    });

    mouseCaptor.on("mouseup", () => { 
      if (isDragging) { 
        isDragging = false; 
        draggedNode = null; 
      } 
    });

    sigmaRef.current = renderer;

    if (searchQuery && sigmaRef.current) {
      const found = graph.nodes().find((n: string) => 
        graph.getNodeAttribute(n, "label").toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found) { 
        const cam = renderer.getCamera(); 
        const pos = renderer.getNodeDisplayData(found); 
        if (pos) cam.animate({ x: pos.x, y: pos.y, ratio: 0.1 }, { duration: 600 }); 
      }
    }

    renderer.on("enterNode", ({ node }) => setHoveredNode(node));
    renderer.on("leaveNode", () => setHoveredNode(null));

    return () => { 
      renderer.kill(); 
      sigmaRef.current = null; 
    };
  }, [graph, theme, isForceActive, searchQuery]);

  useEffect(() => {
    if (!sigmaRef.current || !graph) return;

    if (!hubCategory || hubCategory === "All") {
      sigmaRef.current.setSetting("nodeReducer", null);
      sigmaRef.current.setSetting("edgeReducer", null);
    } else {
      sigmaRef.current.setSetting("nodeReducer", (_node: string, data: any) => {
        const res = { ...data };
        if (res.category !== hubCategory) {
          res.color = theme === "dark" ? "#334155" : "#cbd5e1";
          res.hiddenLabel = true;
          res.label = "";
        }
        return res;
      });

      sigmaRef.current.setSetting("edgeReducer", (edge: string, data: any) => {
        const res = { ...data };
        const sourceCat = graph.getNodeAttribute(graph.source(edge), "category");
        const targetCat = graph.getNodeAttribute(graph.target(edge), "category");
        if (sourceCat !== hubCategory && targetCat !== hubCategory) {
          res.color = theme === "dark" ? "#1e293b" : "#94a3b8";
        } else {
          const focusNode = sourceCat === hubCategory ? graph.source(edge) : graph.target(edge);
          res.color = graph.getNodeAttribute(focusNode, "color");
          res.size = Math.max(res.size || 1, 2); // Make the focused edges slightly thicker to stand out
        }
        return res;
      });
    }
    sigmaRef.current.refresh();
  }, [hubCategory, graph, theme]);

  return (
    <div className="relative group w-full h-[600px] border border-border rounded-2xl overflow-hidden shadow-elegant transition-elegant bg-background/50">
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Localizar no grafo..." 
            className="pl-9 h-9 w-[180px] bg-background/80 border-border text-foreground focus:w-[240px] transition-elegant backdrop-blur-sm shadow-md" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          {searchQuery && (
            <X 
              className="absolute right-2.5 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
              onClick={() => setSearchQuery("")} 
            />
          )}
        </div>
      </div>
      
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="outline" 
          className="h-9 w-9 rounded-full bg-background/90" 
          onClick={() => sigmaRef.current?.getCamera().animatedZoom(1.5)}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 text-primary" />
        </Button>
        <Button 
          size="icon" 
          variant="outline" 
          className="h-9 w-9 rounded-full bg-background/90" 
          onClick={() => sigmaRef.current?.getCamera().animatedReset()}
          title="Reset Camera"
        >
          <Maximize2 className="h-4 w-4 text-primary" />
        </Button>
        <Button 
          size="icon" 
          variant={isForceActive ? "default" : "outline"} 
          className={`h-9 w-9 rounded-full ${isForceActive ? "bg-primary text-primary-foreground" : "bg-background/90"}`} 
          onClick={() => setIsForceActive(!isForceActive)}
          title={isForceActive ? "Pause Layout" : "Resume Layout"}
        >
          {isForceActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-primary" />}
        </Button>
      </div>

      <div ref={containerRef} className="w-full h-full" />

      {hoveredNode && (
        <div className="absolute bottom-4 right-4 bg-popover/95 p-4 rounded-xl border border-border text-xs z-[100] w-56 shadow-elegant backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <p className="font-bold text-foreground text-sm mb-1">{graph.getNodeAttribute(hoveredNode, "label")}</p>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: graph.getNodeAttribute(hoveredNode, "color") }} />
             <span className="text-muted-foreground capitalize">{graph.getNodeAttribute(hoveredNode, "category")}</span>
          </div>
          <div className="mt-2 border-t border-border pt-2 flex justify-between">
            <span className="text-muted-foreground">Volume de Conexões:</span>
            <span className="text-primary font-mono font-bold">{graph.degree(hoveredNode)}</span>
          </div>
        </div>
      )}
    </div>
  );
});
