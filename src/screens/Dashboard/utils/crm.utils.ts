export function generateStorytellingTexts(
  stageData: { name: string; value: number }[],
  statusData: { name: string; value: number }[]
) {
  const topStage = stageData.length > 0 ? stageData[0].name : "";
  const totalStages = stageData.reduce((acc, curr) => acc + curr.value, 0);
  const topStagePct = totalStages > 0 ? Math.round(((stageData[0]?.value || 0) / totalStages) * 100) : 0;
  
  const stageStoryText = stageData.length > 0
    ? `A fase "${topStage}" concentra ${topStagePct}% de todos os processos na plataforma atualmente, evidenciando o principal centro de gravidade processual da operação.`
    : "Não há dados suficientes de fases para análise de gargalo.";

  const topStatus = statusData.length > 0 ? statusData[0].name : "";
  const statusStoryText = statusData.length > 0
    ? `O trâmite operacional encontra maior densidade no cenário de "${topStatus}" (${statusData[0]?.value} despachos alocados simultaneamente nesta etapa).`
    : "Não há status operacionais definidos no fluxo atual.";

  return { stageStoryText, statusStoryText };
}
