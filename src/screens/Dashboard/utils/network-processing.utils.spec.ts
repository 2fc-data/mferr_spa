import { describe, it, expect } from "vitest";
import { buildEnhancedGraph, computeCentrality, getThemeColors } from "./network-processing.utils";

describe("Network Processing Utils", () => {
  const colors = getThemeColors(false);
  const conflictIds = new Set([10]); // User 10 has a conflict

  const mockRecords = [
    {
      id: 1,
      number: "001-A",
      court_id: 100,
      court: { name: "Tribunal A" },
      area_id: 50,
      area: { name: "Cível" },
      cause_users: [
        { user_id: 10, user: { name: "Advogado Conflitante" }, role_type: "lawyer" },
        { user_id: 20, user: { name: "Cliente A" }, role_type: "client" }
      ]
    },
    {
      id: 2,
      number: "002-B",
      court_id: 100,
      court: { name: "Tribunal A" }, // Same court
      cause_users: [
        { user_id: 30, user: { name: "Advogado B" }, role_type: "lawyer" }
      ]
    }
  ];

  it("should build a graph with correct nodes and edges", () => {
    const graph = buildEnhancedGraph(mockRecords, colors, conflictIds);
    expect(graph.order).toBeGreaterThan(3); // 2 procs + 1 court + 3 users + 1 area
    
    // Check if court node is unique despite multiple processes
    expect(graph.hasNode("t-100")).toBe(true);
    expect(graph.getNodeAttribute("t-100", "label")).toBe("Tribunal A");
  });

  it("should highlight conflict nodes", () => {
    const graph = buildEnhancedGraph(mockRecords, colors, conflictIds);
    // User 10 is in conflictId
    expect(graph.getNodeAttribute("u-10", "isConflict")).toBe(true);
    expect(graph.getNodeAttribute("u-10", "color")).toBe("#f43f5e"); // Conflict color
    
    // User 30 is NOT
    expect(graph.getNodeAttribute("u-30", "isConflict")).toBe(false);
  });

  it("should compute centrality correctly", () => {
    const graph = buildEnhancedGraph(mockRecords, colors, conflictIds);
    const centrality = computeCentrality(graph);
    
    expect(centrality.length).toBe(graph.order);
    
    // Tribunal A should have high degree (connected to 2 procs)
    const courtNode = centrality.find((n: any) => n.id === "t-100");
    expect(courtNode?.connections).toBe(2);
  });

  it("should handle empty records in network construction", () => {
    const graph = buildEnhancedGraph([], colors, conflictIds);
    expect(graph.order).toBe(0);
    expect(computeCentrality(graph)).toEqual([]);
  });

  it("should handle missing IDs and Portuguese string roles robustly", () => {
    const robustRecords = [
      {
        id: 3,
        number: "003-C",
        court: { name: "Tribunal B" }, // court_id is missing
        area: { name: "Consumidor" }, // area_id is missing
        cause_users: [
          { user_id: 40, user: { name: "Doutor Silva" }, role_type: "advogado" }, // string role, Portuguese
          { user_id: 50, user: { name: "Empresa X" }, role_type: "cliente" } // string role, Portuguese
        ]
      }
    ];

    const graph = buildEnhancedGraph(robustRecords, colors, conflictIds);
    
    // Check that nodes are created successfully with fallbacks
    expect(graph.hasNode("t-name-Tribunal B")).toBe(true);
    expect(graph.hasNode("a-name-Consumidor")).toBe(true);
    expect(graph.hasNode("u-40")).toBe(true);
    expect(graph.hasNode("u-50")).toBe(true);

    // Check correct category mappings for Portuguese roles
    expect(graph.getNodeAttribute("u-40", "category")).toBe("Advogado");
    expect(graph.getNodeAttribute("u-50", "category")).toBe("Cliente");
  });
});
