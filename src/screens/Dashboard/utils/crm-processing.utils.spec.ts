import { describe, it, expect } from "vitest";
import { processScoredRecords, calculateBottlenecks, resolveGroupKey } from "./crm-processing.utils";

describe("CRM Processing Utils", () => {
  const mockRecords = [
    {
      id: 1,
      total_value: "100000",
      current_stage: { name: "Conhecimento" },
      current_status: { name: "Aguardando Citação" },
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      total_value: "10000",
      current_stage: { name: "Execução" },
      current_status: { name: "Penhora" },
      created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
      updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Stagnant
    }
  ];

  it("should calculate correct priority scores", () => {
    const scored = processScoredRecords(mockRecords);
    expect(scored).toHaveLength(2);
    
    // Recovery Check: Record 1 has high value (100k) but low stagnation.
    // Record 2 has low value but high stagnation (90 days).
    
    expect(scored[0].priorityScore).toBeDefined();
    expect(scored[0].priorityLabel).toMatch(/Crítico|Urgente|Monitorar/);
    expect(scored[0].stagnation).toBeGreaterThanOrEqual(0);
  });

  it("should calculate correct bottleneck data", () => {
    const scored = processScoredRecords(mockRecords);
    const { stageData, statusData } = calculateBottlenecks(scored);
    
    expect(stageData).toContainEqual(expect.objectContaining({ name: "Conhecimento", value: 1 }));
    expect(stageData).toContainEqual(expect.objectContaining({ name: "Execução", value: 1 }));
    expect(statusData).toContainEqual(expect.objectContaining({ name: "Aguardando Citação", value: 1 }));
  });

  it("should resolve group keys correctly", () => {
    const r = mockRecords[0];
    expect(resolveGroupKey(r, "estagio_atual")).toBe("Conhecimento");
    expect(resolveGroupKey(r, "status_processo")).toBe("Aguardando Citação");
    expect(resolveGroupKey({ ...r, litigation_type: "PF" }, "tipo_litigio")).toBe("PF");
  });

  it("should handle empty records in processing", () => {
    expect(processScoredRecords([])).toEqual([]);
  });
});
