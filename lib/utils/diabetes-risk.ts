/**
 * ADA 2026 – Diabetes risk from HbA1c only (waist ignored).
 * Paper 3: Diabetes-Risk column and manuscript stratification.
 */

export type DiabetesRiskLevel = "Normal" | "Prediabetes" | "Diabetes" | "Very High";
export type DiabetesRiskWithPending = DiabetesRiskLevel | "Pending";

/** HbA1c thresholds: <5.7 Normal, 5.7-6.4 Prediabetes, 6.5-7.9 Diabetes, ≥8.0 Very High. Returns "Pending" when HbA1c missing. */
export function getDiabetesRisk(hba1c: number | null | undefined): DiabetesRiskWithPending {
  if (hba1c == null || !Number.isFinite(hba1c)) return "Pending";
  if (hba1c < 5.7) return "Normal";
  if (hba1c < 6.5) return "Prediabetes";
  if (hba1c < 8) return "Diabetes";
  return "Very High";
}

/** Tailwind classes for ADA 2026 diabetes risk badge (Normal=green, Prediabetes=amber, Diabetes=orange, Very High=red, Pending=gray). */
export function getDiabetesRiskColor(level: DiabetesRiskWithPending): string {
  switch (level) {
    case "Normal":
      return "bg-green-100 text-green-700";
    case "Prediabetes":
      return "bg-amber-100 text-amber-800";
    case "Diabetes":
      return "bg-orange-200 text-orange-900";
    case "Very High":
      return "bg-red-200 text-red-900";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

/** Set diabetesRisk on a patient/row from hba1c (ADA 2026). Use after setting TyG/risk so row stays in sync. */
export function updatePatientDiabetesRisk<T extends { hba1c?: number | null }>(
  p: T
): T & { diabetesRisk: DiabetesRiskWithPending } {
  return { ...p, diabetesRisk: getDiabetesRisk(p.hba1c) } as T & { diabetesRisk: DiabetesRiskWithPending };
}

export const PAPER3_TITLE =
  "Waist Circumference Predicts Lipotoxicity (TG≥220) AND Glucotoxicity (HbA1c≥8.0): ADA Risk Stratification";

/** Counts and percentages for ADA 2026 diabetes risk (HbA1c-based). Pending excluded from % of "known". */
export function getDiabetesRiskStats(
  patients: { hba1c?: number | null }[]
): {
  normal: number;
  normalPct: string;
  prediabetes: number;
  prediabetesPct: string;
  diabetes: number;
  diabetesPct: string;
  veryHigh: number;
  veryHighPct: string;
  pending: number;
  pendingPct: string;
} {
  const n = patients.length;
  const normal = patients.filter((p) => getDiabetesRisk(p.hba1c) === "Normal").length;
  const prediabetes = patients.filter((p) => getDiabetesRisk(p.hba1c) === "Prediabetes").length;
  const diabetes = patients.filter((p) => getDiabetesRisk(p.hba1c) === "Diabetes").length;
  const veryHigh = patients.filter((p) => getDiabetesRisk(p.hba1c) === "Very High").length;
  const pending = patients.filter((p) => getDiabetesRisk(p.hba1c) === "Pending").length;
  const known = normal + prediabetes + diabetes + veryHigh;
  const pct = (count: number, denom: number) => (denom > 0 ? ((count / denom) * 100).toFixed(1) : "0");
  return {
    normal,
    normalPct: pct(normal, n),
    prediabetes,
    prediabetesPct: pct(prediabetes, n),
    diabetes,
    diabetesPct: pct(diabetes, n),
    veryHigh,
    veryHighPct: pct(veryHigh, n),
    pending,
    pendingPct: pct(pending, n),
  };
}

/** Diabetes risk (ADA 2026) counts by TyG risk category. */
export function getDiabetesRiskByTyG(
  patients: { risk?: string; hba1c?: number | null }[]
): Record<string, { total: number; normal: number; prediabetes: number; diabetes: number; veryHigh: number }> {
  const byTyG: Record<string, { total: number; normal: number; prediabetes: number; diabetes: number; veryHigh: number }> = {};
  const tygRisks = ["Normal", "Moderate", "High", "Pending"] as const;
  for (const r of tygRisks) {
    byTyG[r] = { total: 0, normal: 0, prediabetes: 0, diabetes: 0, veryHigh: 0 };
  }
  for (const p of patients) {
    const tygRisk = (p.risk && byTyG[p.risk] ? p.risk : "Normal") as keyof typeof byTyG;
    const dr = getDiabetesRisk(p.hba1c);
    byTyG[tygRisk].total += 1;
    if (dr === "Normal") byTyG[tygRisk].normal += 1;
    else if (dr === "Prediabetes") byTyG[tygRisk].prediabetes += 1;
    else if (dr === "Diabetes") byTyG[tygRisk].diabetes += 1;
    else if (dr === "Very High") byTyG[tygRisk].veryHigh += 1;
  }
  return byTyG;
}
