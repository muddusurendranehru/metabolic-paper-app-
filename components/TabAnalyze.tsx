"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { downloadCSV } from "@/lib/csv-utils";
import type { PatientRow } from "@/lib/tyg";

Chart.register(...registerables);

export function TabAnalyze({
  patientData,
}: {
  patientData: PatientRow[];
  setPatientData?: (arg: PatientRow[] | ((prev: PatientRow[]) => PatientRow[])) => void;
}) {
  const scatterRef = useRef<HTMLCanvasElement>(null);
  const histogramRef = useRef<HTMLCanvasElement>(null);
  const scatterChartRef = useRef<Chart | null>(null);
  const histogramChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!scatterRef.current || patientData.length === 0) return;

    const ctx = scatterRef.current.getContext("2d");
    if (!ctx) return;

    const tyg = (p: PatientRow) => p.tyg;
    const validData = patientData.filter((p) => tyg(p) && p.waist);

    if (scatterChartRef.current) {
      scatterChartRef.current.destroy();
      scatterChartRef.current = null;
    }

    scatterChartRef.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Patients",
            data: validData.map((p) => ({ x: p.tyg, y: p.waist })),
            backgroundColor: validData.map((p) =>
              p.risk === "High"
                ? "rgba(239, 68, 68, 0.7)"
                : p.risk === "Moderate"
                  ? "rgba(251, 191, 36, 0.7)"
                  : "rgba(34, 197, 94, 0.7)"
            ),
            pointRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `TyG Index vs Waist Circumference (n=${patientData.length})`,
            font: { size: 16, weight: "bold" },
          },
          legend: { display: false },
        },
        scales: {
          x: {
            title: { display: true, text: "TyG Index", font: { size: 14 } },
            min: 7,
            max: 12,
          },
          y: {
            title: { display: true, text: "Waist (cm)", font: { size: 14 } },
            min: 60,
            max: 140,
          },
        },
      },
    });

    // Histogram
    if (histogramRef.current) {
      const ctx2 = histogramRef.current.getContext("2d");
      if (ctx2) {
        const tygValues = patientData.filter((p) => p.tyg).map((p) => p.tyg!);
        const bins = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11];
        const counts = bins.map(
          (b, i) =>
            tygValues.filter(
              (v) => v >= b && v < (bins[i + 1] ?? 12)
            ).length
        );

        if (histogramChartRef.current) {
          histogramChartRef.current.destroy();
          histogramChartRef.current = null;
        }

        histogramChartRef.current = new Chart(ctx2, {
          type: "bar",
          data: {
            labels: bins.map((b) => b.toFixed(1)),
            datasets: [
              {
                label: "Patient Count",
                data: counts,
                backgroundColor: "rgba(79, 70, 229, 0.7)",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "TyG Index Distribution",
                font: { size: 14, weight: "bold" },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: "Patients" },
              },
              x: { title: { display: true, text: "TyG Index" } },
            },
          },
        });
      }
    }

    return () => {
      scatterChartRef.current?.destroy();
      scatterChartRef.current = null;
      histogramChartRef.current?.destroy();
      histogramChartRef.current = null;
    };
  }, [patientData]);

  const generateJCDR = () => {
    const valid = patientData.filter((p) => p.tyg && p.waist);
    const avgTyG =
      valid.length > 0
        ? valid.reduce((sum, p) => sum + (p.tyg ?? 0), 0) / valid.length
        : 0;
    const avgWaist =
      valid.length > 0
        ? valid.reduce((sum, p) => sum + (p.waist ?? 0), 0) / valid.length
        : 0;
    const highRisk = valid.filter((p) => p.risk === "High").length;
    const pct =
      valid.length > 0 ? ((highRisk / valid.length) * 100).toFixed(1) : "0";

    const draft = `
TYG INDEX STUDY - JCDR DRAFT
============================

TITLE: TyG Index and Waist Circumference as Predictors of Metabolic Risk

METHODS:
- N = ${patientData.length} patients
- TyG = LN(TG × Glucose / 2)
- Waist circumference measured manually

RESULTS:
- Mean TyG: ${avgTyG.toFixed(2)}
- Mean Waist: ${avgWaist.toFixed(1)} cm
- High Risk: ${highRisk} (${pct}%)

CONCLUSION:
TyG index correlates with waist circumference and metabolic risk.
    `.trim();

    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "JCDR-Draft.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const withTyG = patientData.filter((p) => p.tyg);
  const meanTyG =
    withTyG.length > 0
      ? withTyG.reduce((s, p) => s + (p.tyg ?? 0), 0) / withTyG.length
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">📊 Step 4: Analyze & Publish</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg p-4">
          <canvas ref={scatterRef} />
        </div>
        <div className="border rounded-lg p-4">
          <canvas ref={histogramRef} />
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-indigo-900 mb-2">📈 Key Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Patients</p>
            <p className="text-2xl font-bold">{patientData.length}</p>
          </div>
          <div>
            <p className="text-gray-600">High Risk</p>
            <p className="text-2xl font-bold text-red-600">
              {patientData.filter((p) => p.risk === "High").length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Mean TyG</p>
            <p className="text-2xl font-bold">{meanTyG.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={generateJCDR}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
        >
          📝 Generate JCDR Draft
        </button>
        <button
          onClick={() =>
            downloadCSV(
              patientData.map((p) => ({
                ...p,
                filename: p.name,
                TyG: p.tyg,
              })) as Record<string, unknown>[],
              "tyg-study-final.csv"
            )
          }
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
        >
          📥 Download Final CSV
        </button>
      </div>
    </div>
  );
}
