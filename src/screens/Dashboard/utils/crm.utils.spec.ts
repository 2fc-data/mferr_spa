import { describe, it, expect } from "vitest";
import { generateStorytellingTexts } from "./crm.utils";

describe("CRM Storytelling Utils", () => {
  it("should return fallback messages when arrays are empty", () => {
    const result = generateStorytellingTexts([], []);
    expect(result.stageStoryText).toBe("Não há dados suficientes de fases para análise de gargalo.");
    expect(result.statusStoryText).toBe("Não há status operacionais definidos no fluxo atual.");
  });

  it("should calculate correct percentage and inject stage name", () => {
    const mockStageData = [
      { name: "Fase Inicial", value: 50 },
      { name: "Fase Intermediária", value: 50 },
    ];
    // 50 / 100 = 50%
    const result = generateStorytellingTexts(mockStageData, []);
    expect(result.stageStoryText).toBe(
      `A fase "Fase Inicial" concentra 50% de todos os processos na plataforma atualmente, evidenciando o principal centro de gravidade processual da operação.`
    );
  });

  it("should inject the correct status value and name", () => {
    const mockStatusData = [
      { name: "Aguardando Assinatura", value: 15 },
      { name: "Processado", value: 5 },
    ];
    const result = generateStorytellingTexts([], mockStatusData);
    expect(result.statusStoryText).toBe(
      `O trâmite operacional encontra maior densidade no cenário de "Aguardando Assinatura" (15 despachos alocados simultaneamente nesta etapa).`
    );
  });
});
