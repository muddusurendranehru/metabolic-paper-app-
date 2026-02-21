import type { Patient } from '@/lib/types/patient';
import { getDiabetesRisk } from '@/lib/utils/diabetes-risk';

type PatientWithStatus = Patient & { status?: string };

export function generateAnonymousId(index: number): string {
  return `Patient ${String(index + 1).padStart(3, '0')}`;
}

export function anonymizePatients(patients: PatientWithStatus[]): (Patient & { anonymousId: string })[] {
  return patients.map((p, i) => ({
    ...p,
    anonymousId: generateAnonymousId(i),
  }));
}

export function getAnonymizedTable1Data(patients: PatientWithStatus[]) {
  const useForTable = patients.filter(p => p.status === 'verified').length > 0
    ? patients.filter(p => p.status === 'verified')
    : patients;
  const anonymized = anonymizePatients(useForTable);

  return anonymized.map(p => ({
    id: p.anonymousId,
    age: p.age,
    sex: p.sex,
    tg: p.tg,
    glucose: p.glucose,
    hdl: p.hdl,
    waist: p.waist,
    tyg: p.tyg,
    risk: p.risk,
    hba1c: p.hba1c ?? undefined,
    diabetesRisk: getDiabetesRisk(p.hba1c),
  }));
}
