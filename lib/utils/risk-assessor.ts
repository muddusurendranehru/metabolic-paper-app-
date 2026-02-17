/**
 * Risk logic for TyG index
 */

export type RiskLevel = "Normal" | "Moderate" | "High";

export function assessRisk(tyg: number, waist?: number | null): RiskLevel {
  if (waist != null && waist >= 90 && tyg >= 9.5) return "High";
  if (tyg >= 9.5) return "High";
  if (tyg >= 8.5) return "Moderate";
  return "Normal";
}
