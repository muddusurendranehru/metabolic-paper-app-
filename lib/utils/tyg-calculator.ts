/**
 * TyG = ln(TG × Glucose / 2)
 */

export function calcTyG(tg: number, glucose: number): number {
  if (tg <= 0 || glucose <= 0) return 0;
  return Math.log((tg * glucose) / 2);
}
