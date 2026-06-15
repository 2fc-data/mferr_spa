import { formatCompactCurrency } from "@/lib/utils";

export interface StorytellingData {
  records: any[];
  trends: { volume: number; ticket: number; value: number };
  totalValue: number;
  criticalCount: number;
  meanLeadTime: number;
  topStage: string;
  topStatus: string;
}

export function generateDirectStorytelling(data: StorytellingData) {
  const { records, trends, totalValue, criticalCount, meanLeadTime, topStage, topStatus } = data;

  const getTrendIcon = (val: number) => (val >= 0 ? "▲" : "▼");
  const getTrendColor = (val: number) => (val >= 0 ? "text-emerald-500" : "text-rose-500");

  return {
    volume: {
      headline: `${records.length} Processos Ativos`,
      subline: `${getTrendIcon(trends.volume)} ${Math.abs(trends.volume)}% vs anterior.`,
      story: trends.volume > 0 
        ? "Crescimento detectado. Avaliar necessidade de novos advogados." 
        : "Retração de carteira. Momento oportuno para focar em qualidade e compliance.",
      color: getTrendColor(trends.volume)
    },
    ticket: {
      headline: formatCompactCurrency(totalValue / (records.length || 1)),
      subline: `${getTrendIcon(trends.ticket)} ${Math.abs(trends.ticket)}% no valor médio.`,
      story: trends.ticket > 0 
        ? "Melhoria no perfil financeiro. Priorizar causas de alto valor." 
        : "Queda no ticket. Revisar estratégia de captação ou triagem de novos casos.",
      color: getTrendColor(trends.ticket)
    },
    priority: {
      headline: `${criticalCount} Casos Críticos`,
      subline: "Alerta de Intervenção.",
      story: `Focar em ${criticalCount} processos urgentes para liberar fluxo de caixa e cumprir prazos fatais.`,
      color: criticalCount > 5 ? "text-rose-500" : "text-amber-500"
    },
    timing: {
      headline: `${Math.round(meanLeadTime)} Dias`,
      subline: "Aging médio.",
      story: `Gargalo crítico na fase de "${topStage}". Impulsionar peticionamento para reduzir tempo total.`,
      color: meanLeadTime > 90 ? "text-rose-500" : "text-emerald-500"
    },
    expertInsight: {
      title: "Insight de Gestão",
      object: `Gestão de ${records.length} ativos.`,
      purpose: `Reduzir inércia em "${topStage}" e tratar ${criticalCount} riscos imediatos.`,
      conclusion: `Ação: Priorizar casos no status "${topStatus}" e intensificar acordos nos processos críticos.`
    }
  };
}

export function getIndividualPriorityStory(params: { 
  priorityScore: number; 
  stagnation: number; 
  priorityBreakdown: { value: number; risk: number; stagnation: number }; 
  totalValue: number;
}) {
  const { priorityScore, stagnation, priorityBreakdown, totalValue } = params;
  
  const impact = formatCompactCurrency(totalValue);
  
  if (priorityScore > 75) {
    if (priorityBreakdown.value > 25) return {
      headline: "Alto Valor Travado",
      body: `Este processo representa um ticket relevante (${impact}) que está sem avançar, drenando o fluxo de caixa esperado da carteira.`,
      action: "Prioridade 0: Realizar peticionamento de impulso ou contato direto com o fórum hoje."
    };
    if (priorityBreakdown.risk > 25) return {
      headline: "Risco de Eficácia Jurídica",
      body: "A pontuação de risco indica uma possível perda de objeto ou precariedade na instrução que pode levar à improcedência.",
      action: "Ação: Revisar fundamentação e despachar com o juiz se necessário."
    };
    return {
      headline: "Paralisia Crítica",
      body: `Hiatos de ${stagnation} dias em processos ativos geram percepção de abandono pelo cliente e aumentam o aging médio.`,
      action: "Urgência: Movimentar o status agora para quebrar o ciclo de inércia."
    };
  }
  
  if (priorityScore > 40) {
    const mainProblem = priorityBreakdown.stagnation > 20 ? "inatividade" : "valor/risco";
    return {
      headline: "Atenção Recomendada",
      body: `Processo com score moderado. O fator principal de alerta é a ${mainProblem}.`,
      action: "Recomendação: Incluir na pauta de trabalho da próxima semana para evitar que se torne crítico."
    };
  }

  return {
    headline: "Fluxo sob Controle",
    body: "Os indicadores de tempo, valor e risco estão equilibrados e dentro da normalidade.",
    action: "Manter monitoramento de rotina via sistema."
  };
}
