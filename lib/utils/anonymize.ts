import type { Patient } from '@/lib/types/patient';

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
  const verified = patients.filter(p => p.status === 'verified');
  const anonymized = anonymizePatients(verified);

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
  }));
}
