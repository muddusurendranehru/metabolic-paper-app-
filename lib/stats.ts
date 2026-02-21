import type { Patient } from '@/lib/types/patient';

export function calculateStats(patients: (Patient & { status?: string })[]) {
  const verified = patients.filter(p => p.status === 'verified');
  // Use all patients when none are explicitly verified (e.g. from Extract/manual add)
  const useForStats = verified.length > 0 ? verified : patients;
  const n = useForStats.length;

  if (n === 0) {
    return {
      n: 0,
      avgAge: 0,
      avgTyG: 0,
      avgWaist: 0,
      avgGlucose: 0,
      avgTG: 0,
      avgHDL: 0,
      highRisk: 0,
      moderateRisk: 0,
      normalRisk: 0,
      maleCount: 0,
      femaleCount: 0,
      correlationR: 0,
      pValue: 0,
    };
  }

  const sum = (field: keyof Patient) =>
    useForStats.reduce((s, p) => s + (p[field] as number || 0), 0);

  const avg = (field: keyof Patient) => sum(field) / n;

  const tygValues = useForStats.map(p => p.tyg || 0).filter(v => v > 0);
  const waistValues = useForStats.map(p => p.waist || 0).filter(v => v > 0);

  const correlationR = calculateCorrelation(tygValues, waistValues);
  const pValue = calculatePValue(correlationR, n);

  return {
    n,
    avgAge: avg('age'),
    avgTyG: avg('tyg'),
    avgWaist: avg('waist'),
    avgGlucose: avg('glucose'),
    avgTG: avg('tg'),
    avgHDL: avg('hdl'),
    highRisk: useForStats.filter(p => p.risk === 'High').length,
    moderateRisk: useForStats.filter(p => p.risk === 'Moderate').length,
    normalRisk: useForStats.filter(p => p.risk === 'Normal').length,
    maleCount: useForStats.filter(p => p.sex === 'M').length,
    femaleCount: useForStats.filter(p => p.sex === 'F').length,
    correlationR,
    pValue,
  };
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;

  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((s, xi) => s + xi * xi, 0);
  const sumY2 = y.slice(0, n).reduce((s, yi) => s + yi * yi, 0);

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return den === 0 ? 0 : num / den;
}

function calculatePValue(r: number, n: number): number {
  if (n <= 2) return 1;
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  return Math.exp(-Math.abs(t));
}
