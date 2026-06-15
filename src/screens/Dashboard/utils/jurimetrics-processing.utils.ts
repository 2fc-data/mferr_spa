import { 
  calculateRiskScore, 
  getProvisionClass, 
  calculateAging, 
  mannWhitneyU, 
  kaplanMeier 
} from "./jurimetrics.utils";

export interface JurimetricsAnalysis {
  stats: {
    avgRisk: number;
    totalProvision: number;
    totalExposed: number;
  };
  pieData: any[];
  areaRiskData: any[];
  cityRanking: any[];
  mwResult: any | null;
  kmData: any[];
  top2Names: string[];
  topCases: any[];
}

export const processJurimetricsData = (records: any[], riskPieConfig: any): JurimetricsAnalysis | null => {
  if (!records || records.length === 0) return null;

  // --- 1. Basic Metrics & Triage ---
  let totalRiskSum = 0;
  let totalProvision = 0;
  let totalExposedValue = 0;
  const provisionCounts = { Provável: 0, Possível: 0, Remota: 0 };
  const areaRiskAgg: Record<string, { count: number, riskSum: number }> = {};
  const cityMap: Record<string, any[]> = {};

  const enriched = records.map((r: any) => {
    const p = calculateRiskScore(r);
    const val = parseFloat(r.total_value || "0");
    const expected = p * val;
    const provClass = getProvisionClass(p);
    const aging = calculateAging(r);
    const cityName = r.city?.name || "Outros";

    totalRiskSum += p;
    totalProvision += expected;
    totalExposedValue += val;
    provisionCounts[provClass]++;

    const area = r.area?.name || "Geral";
    if (!areaRiskAgg[area]) areaRiskAgg[area] = { count: 0, riskSum: 0 };
    areaRiskAgg[area].count++;
    areaRiskAgg[area].riskSum += p;

    if (!cityMap[cityName]) cityMap[cityName] = [];
    cityMap[cityName].push({ ...r, riskScore: p, value: val, aging });

    return {
      ...r,
      riskScore: p,
      expectedValue: expected,
      provisionClass: provClass,
      aging,
      recommendation: p >= 0.6 ? "Acordo Imediato" : (p >= 0.3 ? "Avaliar Proposta" : "Prosseguir"),
    };
  });

  // --- 2. Chart Formatting ---
  const pieData = [
    { name: "Provável", value: provisionCounts.Provável, fill: riskPieConfig.Provável.color },
    { name: "Possível", value: provisionCounts.Possível, fill: riskPieConfig.Possível.color },
    { name: "Remota", value: provisionCounts.Remota, fill: riskPieConfig.Remota.color },
  ];

  const areaRiskData = Object.entries(areaRiskAgg).map(([name, data]) => ({
    name,
    RiscoMedio: Number(((data.riskSum / data.count) * 100).toFixed(1))
  })).sort((a, b) => b.RiscoMedio - a.RiscoMedio).slice(0, 8);

  // --- 3. Benchmarking Logic (Top 2 Cities) ---
  const cityRanking = Object.entries(cityMap).map(([city, cases]) => ({
    city,
    count: cases.length,
    meanValue: cases.reduce((s, c) => s + c.value, 0) / cases.length,
    meanAging: cases.reduce((s, c) => s + c.aging, 0) / cases.length,
    cases
  })).sort((a, b) => b.count - a.count);

  let mwResult = null;
  let kmData: any[] = [];
  const top2 = cityRanking.slice(0, 2);

  if (top2.length === 2) {
    const valsA = top2[0].cases.map(c => c.value);
    const valsB = top2[1].cases.map(c => c.value);
    const mw = mannWhitneyU(valsA, valsB);
    
    mwResult = {
      cityA: top2[0].city,
      cityB: top2[1].city,
      ...mw,
      significant: mw.pValue < 0.05
    };
  }

  const activeCities = cityRanking.slice(0, 3);
  if (activeCities.length >= 1) {
    const kms = activeCities.map(city => ({
      city: city.city,
      km: kaplanMeier(city.cases.map(c => ({ duration: c.aging, censored: !c.closed_at })))
    }));

    const allTimes = [...new Set(kms.flatMap(k => k.km.map(s => s.time)))].sort((a, b) => a - b);
    
    const lastProb: Record<string, number> = {};
    activeCities.forEach(c => { lastProb[c.city] = 100; });

    kmData = allTimes.map(t => {
      const row: any = { time: t };
      kms.forEach(k => {
        const found = k.km.find(s => s.time === t);
        if (found) {
          lastProb[k.city] = found.survivalProb * 100;
        }
        row[k.city] = lastProb[k.city];
      });
      return row;
    });

    if (kmData.length > 50) {
      kmData = kmData.filter((_, i) => i % Math.ceil(kmData.length / 50) === 0);
    }
  }

  return {
    stats: {
      avgRisk: totalRiskSum / records.length,
      totalProvision,
      totalExposed: totalExposedValue,
    },
    pieData,
    areaRiskData,
    cityRanking,
    mwResult,
    kmData,
    top2Names: activeCities.map(c => c.city),
    topCases: enriched.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10)
  };
};
