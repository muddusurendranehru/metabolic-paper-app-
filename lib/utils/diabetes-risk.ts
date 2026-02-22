/**
 * Dr. Muddu's Clinical HbA1c Bands – GLYCEMIC CONTROL MONITORING (not ADA diagnostic).
 * Paper 3: TyG-HbA1c correlation study. Used in clinical practice at HOMA Clinic, Hyderabad.
 *
 * YOUR CLINICAL THRESHOLDS – IMPLEMENTED
 * ┌─────────────────────────────────────────────────────────────┐
 * │  HbA1c Value      │ Diabetes-Risk      │ Color             │
 * ├─────────────────────────────────────────────────────────────┤
 * │  < 6.0%          │ Normal             │ Green              │
 * │  6.1 - 6.5%      │ Prediabetes        │ Yellow (amber)     │
 * │  6.6 - 7.0%      │ Good               │ Blue               │
 * │  7.1 - 8.0%      │ Poor               │ Orange             │
 * │  > 8.1%          │ Alert              │ Dark Red           │
 * │  null/undefined  │ Pending            │ Gray               │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Matches lab report format · Clinically meaningful          │
 * │  Auto-calculated on HbA1c entry/edit · Paper 3 uses these   │
 * └─────────────────────────────────────────────────────────────┘
 */

export type DiabetesRiskLevel = "Normal" | "Prediabetes" | "Good" | "Poor" | "Alert";
export type DiabetesRiskWithPending = DiabetesRiskLevel | "Pending";

/** Dr. Muddu's clinical HbA1c bands. Returns "Pending" when HbA1c missing.
 * Check: 5.8→Normal 🟢, 6.3→Prediabetes 🟡, 6.8→Good 🔵, 7.5→Poor 🟠, 8.5→Alert 🔴 */
export function calculateDiabetesRisk(hba1c: number | null | undefined): DiabetesRiskWithPending {
  if (hba1c === null || hba1c === undefined) return "Pending";
  if (!Number.isFinite(hba1c)) return "Pending";

  if (hba1c < 6.0) return "Normal"; // Green
  if (hba1c >= 6.1 && hba1c <= 6.5) return "Prediabetes"; // Yellow
  if (hba1c >= 6.6 && hba1c <= 7.0) return "Good"; // Blue
  if (hba1c >= 7.1 && hba1c <= 8.0) return "Poor"; // Orange
  if (hba1c > 8.1) return "Alert"; // Dark Red

  return "Pending";
}

/** Alias for callers using getDiabetesRisk – uses Dr. Muddu's clinical bands. */
export function getDiabetesRisk(hba1c: number | null | undefined): DiabetesRiskWithPending {
  return calculateDiabetesRisk(hba1c);
}

/** Tailwind classes for risk badge: Normal=green, Prediabetes=yellow, Good=blue, Poor=orange, Alert=dark red, default=gray. */
export function getDiabetesRiskColor(risk: DiabetesRiskWithPending): string {
  switch (risk) {
    case "Normal":
      return "bg-green-100 text-green-800 border-green-200";
    case "Prediabetes":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Good":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Poor":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Alert":
      return "bg-red-900 text-white border-red-900";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/** Set diabetesRisk on a patient/row from hba1c (Dr. Muddu's clinical bands). */
export function updatePatientDiabetesRisk<T extends { hba1c?: number | null }>(
  p: T
): T & { diabetesRisk: DiabetesRiskWithPending } {
  return { ...p, diabetesRisk: getDiabetesRisk(p.hba1c) } as T & { diabetesRisk: DiabetesRiskWithPending };
}

export const PAPER3_TITLE =
  "Waist Circumference Predicts Lipotoxicity (TG≥220) AND Glucotoxicity (HbA1c≥8.0): ADA Risk Stratification";

const CLINICAL_LEVELS = ["Normal", "Prediabetes", "Good", "Poor", "Alert", "Pending"] as const;

/** Resolve diabetes risk from stored field or compute from HbA1c. */
function resolveDiabetesRisk(p: { hba1c?: number | null; diabetesRisk?: DiabetesRiskWithPending | null }): DiabetesRiskWithPending {
  return p.diabetesRisk ?? getDiabetesRisk(p.hba1c);
}

/** Counts and percentages for Dr. Muddu's clinical HbA1c bands. Uses verified patients with HbA1c; counts by diabetesRisk (fallback getDiabetesRisk(hba1c)). */
export function getDiabetesRiskStats(
  patients: { hba1c?: number | null; status?: string; diabetesRisk?: DiabetesRiskWithPending | null }[]
): {
  total: number;
  normal: number;
  normalPct: string;
  prediabetes: number;
  prediabetesPct: string;
  good: number;
  goodPct: string;
  poor: number;
  poorPct: string;
  alert: number;
  alertPct: string;
  pending: number;
  pendingPct: string;
} {
  const verified = patients.filter((p) => p.status === "verified");
  const withHba1c = verified.filter((p) => p.hba1c != null && Number.isFinite(p.hba1c));
  const total = withHba1c.length;
  const pct = (count: number, denom: number) => (denom > 0 ? ((count / denom) * 100).toFixed(1) : "0");

  const normal = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Normal").length;
  const prediabetes = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Prediabetes").length;
  const good = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Good").length;
  const poor = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Poor").length;
  const alertCount = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Alert").length;
  const pending = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Pending").length;

  return {
    total,
    normal,
    normalPct: pct(normal, total),
    prediabetes,
    prediabetesPct: pct(prediabetes, total),
    good,
    goodPct: pct(good, total),
    poor,
    poorPct: pct(poor, total),
    alert: alertCount,
    alertPct: pct(alertCount, total),
    pending,
    pendingPct: pct(pending, total),
  };
}

/** Same as getDiabetesRiskStats but without filtering by status === "verified". Use for manuscript so cohort (e.g. all with TyG + HbA1c) drives n and band counts; respects CSV diabetesRisk via resolveDiabetesRisk. */
export function getDiabetesRiskStatsForCohort(
  patients: { hba1c?: number | null; diabetesRisk?: DiabetesRiskWithPending | null }[]
): {
  total: number;
  normal: number;
  normalPct: string;
  prediabetes: number;
  prediabetesPct: string;
  good: number;
  goodPct: string;
  poor: number;
  poorPct: string;
  alert: number;
  alertPct: string;
  pending: number;
  pendingPct: string;
} {
  const withHba1c = patients.filter((p) => p.hba1c != null && Number.isFinite(p.hba1c));
  const total = withHba1c.length;
  const pct = (count: number, denom: number) => (denom > 0 ? ((count / denom) * 100).toFixed(1) : "0");

  const normal = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Normal").length;
  const prediabetes = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Prediabetes").length;
  const good = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Good").length;
  const poor = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Poor").length;
  const alertCount = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Alert").length;
  const pending = withHba1c.filter((p) => resolveDiabetesRisk(p) === "Pending").length;

  return {
    total,
    normal,
    normalPct: pct(normal, total),
    prediabetes,
    prediabetesPct: pct(prediabetes, total),
    good,
    goodPct: pct(good, total),
    poor,
    poorPct: pct(poor, total),
    alert: alertCount,
    alertPct: pct(alertCount, total),
    pending,
    pendingPct: pct(pending, total),
  };
}

/** Diabetes risk (clinical bands) counts by TyG risk category. */
export function getDiabetesRiskByTyG(
  patients: { risk?: string; hba1c?: number | null }[]
): Record<string, { total: number; normal: number; prediabetes: number; good: number; poor: number; alert: number }> {
  const byTyG: Record<
    string,
    { total: number; normal: number; prediabetes: number; good: number; poor: number; alert: number }
  > = {};
  const tygRisks = ["Normal", "Moderate", "High", "Pending"] as const;
  for (const r of tygRisks) {
    byTyG[r] = { total: 0, normal: 0, prediabetes: 0, good: 0, poor: 0, alert: 0 };
  }
  for (const p of patients) {
    const tygRisk = (p.risk && byTyG[p.risk] ? p.risk : "Normal") as keyof typeof byTyG;
    const dr = getDiabetesRisk(p.hba1c);
    byTyG[tygRisk].total += 1;
    if (dr === "Normal") byTyG[tygRisk].normal += 1;
    else if (dr === "Prediabetes") byTyG[tygRisk].prediabetes += 1;
    else if (dr === "Good") byTyG[tygRisk].good += 1;
    else if (dr === "Poor") byTyG[tygRisk].poor += 1;
    else if (dr === "Alert") byTyG[tygRisk].alert += 1;
  }
  return byTyG;
}

export { CLINICAL_LEVELS };
