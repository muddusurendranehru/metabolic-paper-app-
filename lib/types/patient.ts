/**
 * Extensible patient schema for TyG Research Dashboard
 */

export type RiskLevel = "Normal" | "Moderate" | "High";

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

/** Extensible fields (HbA1c, etc.) - add here */
export interface PatientExtensions {
  hba1c?: number | null;
  filename?: string | null;
  verified?: boolean;
}

export type Patient = PatientBase & PatientExtensions;
