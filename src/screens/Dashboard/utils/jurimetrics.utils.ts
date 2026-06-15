/**
 * Jurimetrics and Statistical Utilities for LawerOffice Dashboard
 * 
 * This file centralizes complex calculations to ensure consistency across 
 * predictive, comparative, and operational dashboards.
 */

// --- Types ---

export type ProvisionClass = "Provável" | "Possível" | "Remota";

// --- Jurimetrics & Risk ---

/**
 * Heuristic function to estimate Risk Score (Simulation of Logit Model)
 * Based on LawerOffice specialized legal knowledge.
 */
export const calculateRiskScore = (cause: any): number => {
  let risk = 0.3; // Base risk of 30%

  // Area impact (Labor historically higher)
  const areaName = cause.area?.name?.toLowerCase() || "";
  if (areaName.includes("trabalhista")) {
    risk += 0.4; 
  } else if (areaName.includes("consumidor")) {
    risk += 0.25;
  } else if (areaName.includes("tributário")) {
    risk += 0.15;
  }

  // Litigation type impact
  if (cause.litigation_type === "PF") {
    risk += 0.1; // PF tends to have slightly more pro-consumer/pro-worker bias
  }

  // Cap risk between 5% and 98% to be realistic
  return Math.min(Math.max(risk, 0.05), 0.98);
};

/**
 * CPC 25 Classification based on probability
 */
export const getProvisionClass = (probability: number): ProvisionClass => {
  if (probability >= 0.5) return "Provável";
  if (probability >= 0.25) return "Possível";
  return "Remota";
};

/**
 * Calculates aging in days (stagnation or total duration)
 */
export const calculateAging = (cause: any): number => {
  const dateStr = cause.createdAt || cause.created_at || new Date();
  const start = new Date(dateStr).getTime();
  const end = cause.closed_at ? new Date(cause.closed_at).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
};

/**
 * Calculates days without movement (Inércia)
 */
export const calculateStagnation = (cause: any): number => {
  if (cause.closed_at) return 0;
  const lastUpdate = new Date(cause.updatedAt || cause.updated_at || cause.createdAt || cause.created_at || new Date()).getTime();
  return Math.max(0, Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24)));
};

// --- Advanced Statistics (Simplified for Frontend) ---

/**
 * Mann-Whitney U Test for comparing two distributions
 */
export const mannWhitneyU = (a: number[], b: number[]) => {
  if (a.length < 2 || b.length < 2) {
    const meanA = a.length > 0 ? a.reduce((s, v) => s + v, 0) / a.length : 0;
    const meanB = b.length > 0 ? b.reduce((s, v) => s + v, 0) / b.length : 0;
    return { U: 0, zScore: 0, pValue: 1, meanA, meanB };
  }

  const combined = [
    ...a.map((v) => ({ v, group: "a" })),
    ...b.map((v) => ({ v, group: "b" })),
  ].sort((x, y) => x.v - y.v);

  const ranks: number[] = [];
  let i = 0;
  while (i < combined.length) {
    let j = i;
    while (j < combined.length && combined[j].v === combined[i].v) j++;
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) ranks[k] = avgRank;
    i = j;
  }

  let R1 = 0;
  ranks.forEach((r, idx) => {
    if (combined[idx].group === "a") R1 += r;
  });

  const n1 = a.length;
  const n2 = b.length;
  const U1 = R1 - (n1 * (n1 + 1)) / 2;
  const U2 = n1 * n2 - U1;
  const U = Math.min(U1, U2);

  const mU = (n1 * n2) / 2;
  const sigmaU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = sigmaU === 0 ? 0 : (U - mU) / sigmaU;
  const absZ = Math.abs(z);
  const p = 2 * (1 - 0.5 * (1 + Math.sign(absZ) * Math.sqrt(1 - Math.exp((-2 * absZ * absZ) / Math.PI))));

  const meanA = a.reduce((s, v) => s + v, 0) / a.length;
  const meanB = b.reduce((s, v) => s + v, 0) / b.length;

  return { U, zScore: z, pValue: Math.max(0, Math.min(1, p)), meanA, meanB };
};

/**
 * Kaplan-Meier survival probability steps
 */
export const kaplanMeier = (events: { duration: number; censored: boolean }[]) => {
  const sorted = [...events].sort((a, b) => a.duration - b.duration);
  let atRisk = sorted.length;
  let survival = 1;
  const steps: { time: number; survivalProb: number }[] = [{ time: 0, survivalProb: 1 }];

  sorted.forEach((e) => {
    if (!e.censored) {
      survival *= (atRisk - 1) / atRisk;
      steps.push({ time: e.duration, survivalProb: Number(survival.toFixed(4)) });
    }
    atRisk--;
  });

  return steps;
};

// --- Network Intelligence ---

/**
 * Detects Conflict of Interest in a network of causes
 * A conflict exists if a user_id is assigned both 'client' and 'opposing_party' 
 * (or similar adversarial role) across the dataset.
 */
export const findConflictNodes = (records: any[]): Set<number> => {
  const userRoles: Record<number, Set<string>> = {};

  records.forEach((cause) => {
    cause.cause_users?.forEach((cu: any) => {
      const uid = cu.user_id;
      // role_type is now a CauseRoleType object (from lookup table), not a string
      const role = cu.role_type?.slug || cu.role_type?.name?.toLowerCase() || "";
      
      if (!userRoles[uid]) userRoles[uid] = new Set();
      userRoles[uid].add(role);
    });
  });

  const conflictUserIds = new Set<number>();
  
  Object.entries(userRoles).forEach(([uid, roles]) => {
    // Conflict: acting as client AND (opposing_counsel OR other adversarial role)
    const isClient = roles.has("client");
    const isAdversarial = roles.has("opposing_counsel") || roles.has("other");
    
    if (isClient && isAdversarial) {
      conflictUserIds.add(Number(uid));
    }
  });

  return conflictUserIds;
};
