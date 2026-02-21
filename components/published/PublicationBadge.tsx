/**
 * Paper 1 (Published) – READ-ONLY.
 * Displays published paper info (badge style).
 */

import { DOILink } from "./DOILink";

export function PublicationBadge() {
  return (
    <div className="inline-flex flex-col gap-1 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-800 font-semibold">🏆 Published Author</p>
      <p className="text-xs text-green-700">Paper 1: TyG &amp; Metabolic Risk (NAFLD)</p>
      <p className="text-xs text-green-600">J Contemp Clin Pract 2025;11(8):349-357</p>
      <DOILink className="text-xs text-blue-600 hover:underline" showLabel />
    </div>
  );
}
