import { describe, it, expect } from "vitest";
import { processJurimetricsData } from "./jurimetrics-processing.utils";

const riskPieConfig = {
  Provável: { color: "#ef4444" },
  Possível: { color: "#f59e0b" },
  Remota: { color: "#10b981" }
};

describe("Jurimetrics Processing Utils", () => {
  const mockRecords = [
    {
      id: 1,
      total_value: "10000",
      area: { name: "Trabalhista" },
      city: { name: "São Paulo" },
      created_at: "2024-01-01",
      closed_at: null,
      litigation_type: "PF"
    },
    {
      id: 2,
      total_value: "5000",
      area: { name: "Cível" },
      city: { name: "São Paulo" },
      created_at: "2024-01-01",
      closed_at: "2024-01-10",
      litigation_type: "PJ"
    },
    {
      id: 3,
      total_value: "20000",
      area: { name: "Trabalhista" },
      city: { name: "Rio de Janeiro" },
      created_at: "2024-01-01",
      closed_at: null,
      litigation_type: "PF"
    }
  ];

  it("should calculate correct overview stats", () => {
    const result = processJurimetricsData(mockRecords, riskPieConfig);
    expect(result).not.toBeNull();
    if (!result) return;

    // São Paulo 1: Trab + PF = 0.3 + 0.4 + 0.1 = 0.8
    // São Paulo 2: Cível + PJ = 0.3
    // Rio 1: Trab + PF = 0.8
    // Avg: (0.8 + 0.3 + 0.8) / 3 = 1.9 / 3 = 0.633...
    expect(result.stats.avgRisk).toBeCloseTo(0.633, 2);
    
    // Total Exposed: 10k + 5k + 20k = 35k
    expect(result.stats.totalExposed).toBe(35000);
  });

  it("should aggregate data by provision class (pieData)", () => {
    const result = processJurimetricsData(mockRecords, riskPieConfig);
    if (!result) return;

    // 0.8 -> Provável
    // 0.3 -> Possível
    // 0.8 -> Provável
    expect(result.pieData.find(d => d.name === "Provável").value).toBe(2);
    expect(result.pieData.find(d => d.name === "Possível").value).toBe(1);
    expect(result.pieData.find(d => d.name === "Remota").value).toBe(0);
  });

  it("should calculate benchmarking between top 2 cities", () => {
    // São Paulo has 2 cases, Rio has 1 case.
    // To trigger Mann-Whitney, we need at least 2 in each. Adding more records.
    const enrichedRecords = [
      ...mockRecords,
      {
        id: 4,
        total_value: "15000",
        area: { name: "Trabalhista" },
        city: { name: "Rio de Janeiro" },
        created_at: "2024-01-01",
        closed_at: null,
      }
    ];

    const result = processJurimetricsData(enrichedRecords, riskPieConfig);
    if (!result) return;

    expect(result.top2Names).toContain("São Paulo");
    expect(result.top2Names).toContain("Rio de Janeiro");
    expect(result.mwResult).not.toBeNull();
    expect(result.kmData.length).toBeGreaterThan(0);
  });

  it("should calculate Kaplan-Meier even if only 1 city is present in the filtered records", () => {
    const singleCityRecords = mockRecords.filter(r => r.city.name === "São Paulo");
    const result = processJurimetricsData(singleCityRecords, riskPieConfig);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.top2Names).toEqual(["São Paulo"]);
    expect(result.mwResult).toBeNull();
    expect(result.kmData.length).toBeGreaterThan(0);
    expect(result.kmData[0]).toHaveProperty("São Paulo");
  });

  it("should return null for empty records", () => {
    expect(processJurimetricsData([], riskPieConfig)).toBeNull();
  });
});
