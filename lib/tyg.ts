/**
 * TyG (Triglyceride-Glucose) index and risk calculations
 * Dr Muddu TyG Research Dashboard
 */

export interface PatientRow {
  id: string;
  name: string;
  age: number;
  sex: string;
  tg: number;
  glucose: number;
  hdl: number;
  waist: number;
  tyg: number;
  risk: "Normal" | "Moderate" | "High" | "Pending";
  /** Paper 3: TyG-HbA1c (optional) */
  hba1c?: number | null;
  /** Paper 3: Dr. Muddu clinical HbA1c bands (Normal / Prediabetes / Good / Poor / Alert / Pending) */
  diabetesRisk?: "Normal" | "Prediabetes" | "Good" | "Poor" | "Alert" | "Pending" | null;
}

/**
 * TyG = ln(TG * Glucose / 2)
 */
export function calcTyG(tg: number, glucose: number): number {
  if (tg <= 0 || glucose <= 0) return 0;
  return Math.log((tg * glucose) / 2);
}

/**
 * Risk = TyG > 9 ? "High" : "Normal"
 */
export function calcRisk(tyg: number): "Normal" | "Moderate" | "High" {
  if (tyg >= 9.5) return "High";
  if (tyg >= 8.5) return "Moderate";
  return "Normal";
}

export function createPatient(
  id: string,
  name: string,
  age: number,
  sex: string,
  tg: number,
  glucose: number,
  hdl: number,
  waist: number
): PatientRow {
  const tyg = calcTyG(tg, glucose);
  return {
    id,
    name,
    age,
    sex,
    tg,
    glucose,
    hdl,
    waist,
    tyg: Math.round(tyg * 100) / 100,
    risk: calcRisk(tyg),
  };
}

/** Pearson correlation (r) between two arrays */
export function correlation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n < 2) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

/** Approximate p-value for correlation (simplified; n small) */
export function correlationPValue(r: number, n: number): number {
  if (n < 3) return 1;
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  // Very rough approximation: p < 0.001 when |t| large
  const absT = Math.abs(t);
  if (absT > 5) return 0.0001;
  if (absT > 4) return 0.001;
  if (absT > 3) return 0.01;
  return 0.05;
}
