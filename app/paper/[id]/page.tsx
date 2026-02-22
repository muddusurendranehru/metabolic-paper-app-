"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Patient } from "@/lib/types/patient";
import {
  generateScatterPlotSVG,
  generateHistogramSVG,
  generateRiskBarChartSVG,
  generateWaistVsHbA1cScatterSVG,
  generateHbA1cHistogramSVG,
  generateHbA1cBandsBarSVG,
} from "@/lib/utils/chart-svg";
import { getDiabetesRiskStats } from "@/lib/utils/diabetes-risk";

type PatientWithStatus = Patient & { status?: string };

export default function PaperPage() {
  const params = useParams();
  const paperId = (params?.id as string) ?? ""; // 'paper2' | 'paper3'

  const [patientData, setPatientData] = useState<PatientWithStatus[]>([]);
  const [figures, setFigures] = useState<{
    fig1: string;
    fig2: string;
    fig3: string;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tyg-patients");
    if (stored) {
      try {
        setPatientData(JSON.parse(stored));
      } catch {
        setPatientData([]);
      }
    }
  }, []);

  useEffect(() => {
    if (patientData.length === 0 || !paperId) return;

    const verified = patientData.filter(
      (p): p is PatientWithStatus => p.status === "verified"
    );
    const useForChart = verified.length > 0 ? verified : patientData;

    if (paperId === "paper3") {
      const withHba1c = useForChart.filter(
        (p) =>
          p.hba1c != null &&
          Number.isFinite(p.hba1c) &&
          p.waist != null
      );
      const hba1cValues = withHba1c
        .map((p) => p.hba1c!)
        .filter((v): v is number => Number.isFinite(v));
      const bandStats = getDiabetesRiskStats(withHba1c);
      setFigures({
        fig1: generateWaistVsHbA1cScatterSVG(withHba1c),
        fig2: generateHbA1cHistogramSVG(hba1cValues),
        fig3: generateHbA1cBandsBarSVG({
          normal: bandStats.normal,
          prediabetes: bandStats.prediabetes,
          good: bandStats.good,
          poor: bandStats.poor,
          alert: bandStats.alert,
          total: bandStats.total,
        }),
      });
    } else {
      setFigures({
        fig1: generateScatterPlotSVG(useForChart),
        fig2: generateHistogramSVG(useForChart),
        fig3: generateRiskBarChartSVG(useForChart),
      });
    }
  }, [paperId, patientData]);

  if (!figures) {
    return (
      <div className="p-6">
        Loading figures...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6">
          {paperId === "paper3"
            ? "Paper 3: TyG-HbA1c Figures"
            : "Paper 2: TyG-Waist Figures"}
        </h1>

        <div className="mb-8 bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">
            Figure 1:{" "}
            {paperId === "paper3" ? "Waist vs HbA1c" : "TyG vs Waist"}
          </h2>
          <div dangerouslySetInnerHTML={{ __html: figures.fig1 }} />
          <p className="text-sm text-gray-600 mt-2 italic">
            {paperId === "paper3"
              ? "Scatter plot: Waist circumference (x) vs HbA1c (y)"
              : "Scatter plot: Waist circumference (x) vs TyG index (y)"}
          </p>
        </div>

        <div className="mb-8 bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">
            Figure 2:{" "}
            {paperId === "paper3"
              ? "HbA1c Distribution"
              : "TyG Distribution"}
          </h2>
          <div dangerouslySetInnerHTML={{ __html: figures.fig2 }} />
          <p className="text-sm text-gray-600 mt-2 italic">
            {paperId === "paper3"
              ? "Histogram: HbA1c values with clinical band coloring"
              : "Histogram: TyG index distribution"}
          </p>
        </div>

        <div className="mb-8 bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">
            Figure 3:{" "}
            {paperId === "paper3"
              ? "Clinical HbA1c Bands"
              : "TyG Risk Categories"}
          </h2>
          <div dangerouslySetInnerHTML={{ __html: figures.fig3 }} />
          <p className="text-sm text-gray-600 mt-2 italic">
            {paperId === "paper3"
              ? "Bar chart: Normal / Prediabetes / Good / Poor / Alert"
              : "Bar chart: Normal / Moderate / High TyG risk"}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              const blob = new Blob(
                [JSON.stringify(figures, null, 2)],
                { type: "application/json" }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${paperId}-figures.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Export Figures (JSON)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
