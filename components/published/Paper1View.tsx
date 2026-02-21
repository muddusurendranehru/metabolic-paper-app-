/**
 * Paper 1 (Published) – READ-ONLY.
 * Static view of the published manuscript. No editing, no data binding.
 */

import { DOILink } from "./DOILink";

const PAPER1_TITLE =
  "Triglyceride-Glucose Index and Metabolic Risk: NAFLD Perspective";

const PAPER1_CITATION =
  "Muddu Surendra Nehru. Triglyceride-Glucose Index and Metabolic Risk: NAFLD Perspective. J Contemp Clin Pract 2025;11(8):349-357.";

const PAPER1_ABSTRACT_SNIPPET = `Objective: To evaluate the triglyceride-glucose (TyG) index in relation to metabolic risk and NAFLD perspective in Indian adults.
Methods: Cross-sectional study at HOMA Clinic. TyG index was calculated from fasting triglycerides and glucose. IDF waist criteria applied.
Results: TyG index showed significant correlation with waist circumference and metabolic risk.
Conclusion: TyG index is a practical, cost-effective screening tool for metabolic risk in resource-limited settings.`;

export function Paper1View() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-800">
      <div className="text-center pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-900">{PAPER1_TITLE}</h1>
        <p className="text-sm text-gray-600 mt-2">
          Dr. Muddu Surendra Nehru MD | Professor of Medicine | HOMA Clinic
        </p>
        <p className="text-sm text-gray-500 mt-1">
          J Contemp Clin Pract 2025;11(8):349-357
        </p>
        <p className="mt-2">
          <DOILink className="text-blue-600 hover:underline" />
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-indigo-900 mb-2">Abstract</h2>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {PAPER1_ABSTRACT_SNIPPET}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-indigo-900 mb-2">
          Citation
        </h2>
        <p className="text-sm text-gray-600 italic">{PAPER1_CITATION}</p>
      </section>

      <p className="text-xs text-gray-400 pt-4">
        This is a read-only reference. No data or content here is editable.
      </p>
    </div>
  );
}
