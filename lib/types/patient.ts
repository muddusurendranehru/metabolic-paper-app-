/**
 * Extensible patient schema for TyG Research Dashboard
 * Aligns with canonical Patient: demographics, lipids, glucose, anthropometry, calculated, metadata.
 * Core fields (PatientBase) are required for existing flows. Optional in PatientExtensions only.
 */

export type RiskLevel = "Normal" | "Moderate" | "High" | "Pending";

/** Dr. Muddu clinical HbA1c bands (glycemic control monitoring) or Pending when unknown */
export type DiabetesRiskLevel = "Normal" | "Prediabetes" | "Good" | "Poor" | "Alert" | "Pending";

export interface PatientBase {
  id: string;
  name: string;
  age: number;
  sex: string;
  tg: number;
  glucose: number;
  hdl: number;
  waist: number;
  tyg: number;
  risk: RiskLevel;
}

/** Extensible fields – add optional only. Paper 3: HbA1c; ADA 2026 diabetes risk; verification; lipids/anthropometry. */
export interface PatientExtensions {
  filename?: string | null;
  status?: "pending" | "verified" | "rejected";
  verifiedAt?: string;
  verifiedBy?: string;
  /** Paper 3: TyG-HbA1c */
  hba1c?: number | null;
  /** Paper 3: Dr. Muddu clinical bands – from HbA1c only. Your bands: Normal | Prediabetes | Good | Poor | Alert | Pending */
  diabetesRisk?: DiabetesRiskLevel | null;
  verified?: boolean;

  // Optional lipids / glucose
  ldl?: number | null;
  insulin?: number | null;

  // Optional inflammation / anthropometry
  uricAcid?: number | null;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;

  // Metadata
  ocrConfidence?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Patient = PatientBase & PatientExtensions;
