import type { Patient } from '@/lib/types/patient';
import { getDiabetesRisk } from '@/lib/utils/diabetes-risk';

type PatientWithStatus = Patient & { status?: string };

/**
 * Redact patient identifiers from free text before using in public-facing content
 * (e.g. tweets, blog, CME). Removes "Patient data (n=...):" blocks and lines
 * that look like "Name, age sex, ..." so names are never revealed.
 */
export function redactPatientIdentifiersFromText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let out = text;

  // Replace "Patient data (n=XX):" or "Patient data:" block with anonymized summary
  const patientDataBlock = /Patient\s+data\s*\(?\s*n\s*=\s*\d+\s*\)?\s*:?\s*[\r\n]+[\s\S]*?(?=\n\s*\n|$)/gi;
  const nMatch = out.match(/Patient\s+data\s*\(?\s*n\s*=\s*(\d+)\s*\)?\s*:?/i);
  const n = nMatch ? nMatch[1] : '—';
  out = out.replace(patientDataBlock, () => `Anonymized cohort (n=${n}). No patient identifiers included.\n\n`);

  // Redact lines that look like "Name, 74M" or "FirstName LastName, 25F" (name followed by age+sex)
  const lines = out.split(/\r?\n/);
  const redactedLines = lines.map((line) => {
    const trimmed = line.trim();
    // Line looks like: "Name, 74M" or "Name, 25 F" or "Name 74 M" (optional comma, age 1-3 digits, M/F)
    if (/^[A-Za-z][A-Za-z\s\.\-',]+\s*,?\s*\d{1,3}\s*[MF]\s*(,|$|\s)/i.test(trimmed) || /^[A-Za-z][A-Za-z\s\.\-']+\s+\d{1,3}\s*[MF]\s*/.test(trimmed)) {
      return ''; // remove line to avoid revealing name
    }
    return line;
  });

  out = redactedLines
    .filter((l) => l !== '')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return out;
}

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
