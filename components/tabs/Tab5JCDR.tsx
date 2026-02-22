"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { Patient } from '@/lib/types/patient';
import { generateIJCPRManuscript } from '@/lib/utils/ijcpr-manuscript';
import { getAnonymizedTable1Data } from '@/lib/utils/anonymize';
import { calculateStats } from '@/lib/utils/stats-calculator';
import { exportCSV } from '@/lib/utils/csv-export';
import { exportPDF } from '@/lib/utils/pdf-export';
import { exportWord } from '@/lib/utils/word-export';
import {
  generateHbA1cManuscript,
  filterPatientsWithTyGAndHbA1c,
  calculateHbA1cStats,
} from '@/lib/utils/hba1c-manuscript';
import type { ManuscriptData } from '@/lib/utils/ijcpr-manuscript';
import {
  generateScatterPlotSVG,
  generateHistogramSVG,
  generateRiskBarChartSVG,
  generateWaistVsHbA1cScatterSVG,
  generateHbA1cHistogramSVG,
  generateClinicalBandsBarSVG,
  svgToPng,
  svgToPngBase64,
} from '@/lib/utils/chart-svg';
import type { DiabetesRiskWithPending } from '@/lib/utils/diabetes-risk';
import { getDiabetesRiskColor } from '@/lib/utils/diabetes-risk';

type PatientWithStatus = Patient & { status?: string };

interface Props {
  patientData: PatientWithStatus[];
  onBack: () => void;
}

export default function Tab5JCDR({ patientData, onBack }: Props) {
  const verified = patientData.filter((p: PatientWithStatus) => p.status === 'verified');
  const effectivePatients = verified.length > 0 ? verified : patientData;
  const ijcprManuscript = useMemo(() => generateIJCPRManuscript(effectivePatients), [effectivePatients]);
  const patientsWithHbA1c = filterPatientsWithTyGAndHbA1c(patientData);
  const hba1cManuscript = useMemo(
    () => (patientsWithHbA1c.length > 0 ? generateHbA1cManuscript(patientsWithHbA1c) : null),
    [patientsWithHbA1c]
  );

  const [selectedPaper, setSelectedPaper] = useState<'paper2' | 'paper3'>('paper3');
  const [manuscript, setManuscript] = useState<ManuscriptData>(() => ijcprManuscript);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const manuscriptRef = useRef<HTMLDivElement>(null);

  const stats = calculateStats(effectivePatients);
  const table1Data = getAnonymizedTable1Data(effectivePatients);
  const table1DataPaper3 = useMemo(() => getAnonymizedTable1Data(patientsWithHbA1c), [patientsWithHbA1c]);
  const displayTable1 = selectedPaper === 'paper3' ? table1DataPaper3 : table1Data;
  const hba1cStats = useMemo(() => calculateHbA1cStats(patientData), [patientData]);

  useEffect(() => {
    if (selectedPaper === 'paper2') {
      setManuscript(ijcprManuscript);
    } else if (hba1cManuscript) {
      setManuscript(hba1cManuscript as ManuscriptData);
    }
  }, [selectedPaper, ijcprManuscript, hba1cManuscript]);

  const handleEdit = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: true }));
  };

  const handleSave = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
  };

  const handleCancel = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
  };

  const handleExportWord = async () => {
    if (selectedPaper === 'paper3' && patientsWithHbA1c.length === 0) {
      alert('No patients with both TyG and HbA1c. Add HbA1c values in Extract/Verify to export Paper 3.');
      return;
    }
    const patients = selectedPaper === 'paper2' ? effectivePatients : patientsWithHbA1c;
    const ms = selectedPaper === 'paper2' ? ijcprManuscript : (hba1cManuscript as ManuscriptData);
    const filename = selectedPaper === 'paper2' ? 'tyg-waist-manuscript.docx' : 'tyd-hba1c-manuscript-SUBMISSION-READY.docx';
    let figurePngBase64: { fig1: string; fig2: string; fig3: string } | undefined;
    try {
      const fig1 = selectedPaper === 'paper3'
        ? await svgToPngBase64(generateWaistVsHbA1cScatterSVG(patients))
        : await svgToPngBase64(generateScatterPlotSVG(patients));
      const fig2 = selectedPaper === 'paper3'
        ? await svgToPngBase64(generateHbA1cHistogramSVG(patients.filter((p) => p.hba1c != null && Number.isFinite(p.hba1c)).map((p) => p.hba1c!)))
        : await svgToPngBase64(generateHistogramSVG(patients));
      const fig3 = selectedPaper === 'paper3'
        ? await svgToPngBase64(generateClinicalBandsBarSVG(patients))
        : await svgToPngBase64(generateRiskBarChartSVG(patients));
      if (fig1 && fig2 && fig3) figurePngBase64 = { fig1, fig2, fig3 };
    } catch (e) {
      console.warn('Chart-to-PNG failed, exporting Word without figures:', e);
    }
    await exportWord(patients, ms, filename, { figurePngBase64 });
    alert(`✅ ${selectedPaper === 'paper2' ? 'Paper 2' : 'Paper 3'} Word document exported!`);
  };

  const handleExportPaper2Word = async () => {
    if (patientsWithHbA1c.length === 0) {
      alert('No patients with both TyG and HbA1c. Add HbA1c values in data to export Paper 3.');
      return;
    }
    const hba1cManuscript = generateHbA1cManuscript(patientsWithHbA1c);
    let figurePngBase64: { fig1: string; fig2: string; fig3: string } | undefined;
    try {
      const fig1 = await svgToPngBase64(generateScatterPlotSVG(patientsWithHbA1c));
      const fig2 = await svgToPngBase64(generateHistogramSVG(patientsWithHbA1c));
      const fig3 = await svgToPngBase64(generateRiskBarChartSVG(patientsWithHbA1c));
      if (fig1 && fig2 && fig3) figurePngBase64 = { fig1, fig2, fig3 };
    } catch (e) {
      console.warn('Chart-to-PNG failed for Paper 3 Word export:', e);
    }
    await exportWord(
      patientsWithHbA1c,
      hba1cManuscript as ManuscriptData,
      'tyd-hba1c-manuscript-SUBMISSION-READY.docx',
      { figurePngBase64 }
    );
  };

  const handleExportPDF = async () => {
    if (manuscriptRef.current) {
      await exportPDF(manuscriptRef.current, 'tyd-ijcpr-manuscript.pdf');
    }
  };

  const handleExportCSV = () => {
    exportCSV(effectivePatients, 'tyg-study-anonymized.csv');
  };

  const handleExportFigures = async () => {
    if (selectedPaper === 'paper3') {
      if (patientsWithHbA1c.length === 0) {
        alert('No patients with both TyG and HbA1c. Add HbA1c values to export Paper 3 figures.');
        return;
      }
      await svgToPng(generateWaistVsHbA1cScatterSVG(patientsWithHbA1c), 'figure1-waist-vs-hba1c.png');
      await svgToPng(generateHbA1cHistogramSVG(patientsWithHbA1c.filter((p) => p.hba1c != null && Number.isFinite(p.hba1c)).map((p) => p.hba1c!)), 'figure2-hba1c-distribution.png');
      await svgToPng(generateClinicalBandsBarSVG(patientsWithHbA1c), 'figure3-clinical-bands.png');
      alert('✅ Paper 3: All 3 figures exported (300 DPI PNG)');
    } else {
      const scatterSVG = generateScatterPlotSVG(effectivePatients);
      await svgToPng(scatterSVG, 'figure1-tyg-vs-waist.png');
      const histogramSVG = generateHistogramSVG(effectivePatients);
      await svgToPng(histogramSVG, 'figure2-tyg-distribution.png');
      const riskChartSVG = generateRiskBarChartSVG(effectivePatients);
      await svgToPng(riskChartSVG, 'figure3-risk-stratification.png');
      alert('✅ Paper 2: All 3 figures exported (300 DPI PNG)');
    }
  };

  const SectionEditor = ({
    section,
    title,
    value,
  }: {
    section: string;
    title: string;
    value: string;
  }) => (
    <div className="mb-6 border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-indigo-900">{title}</h3>
        <div data-pdf-hide className="flex gap-2">
          {isEditing[section] ? (
            <>
              <button
                type="button"
                onClick={() => handleSave(section)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                💾 Save
              </button>
              <button
                type="button"
                onClick={() => handleCancel(section)}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                ✕ Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleEdit(section)}
              className="px-3 py-1 border border-indigo-300 text-indigo-600 rounded text-sm hover:bg-indigo-50"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>
      {isEditing[section] ? (
        <textarea
          value={value}
          onChange={e => setManuscript(prev => ({ ...prev, [section]: e.target.value }))}
          className="w-full border rounded p-3 min-h-[200px] font-mono text-sm"
        />
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{value}</div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Paper 3 header – active workspace */}
      <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✏️</span>
          <div>
            <h2 className="text-lg font-bold text-violet-900">
              Paper 3: TyG &amp; HbA1c Correlation
            </h2>
            <p className="text-sm text-violet-700">🆕 NEW (HbA1c field added)</p>
            <p className="text-sm text-violet-800 font-medium">✏️ ACTIVE: Full development workspace</p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <span className="font-semibold text-green-800">Paper 1 (Published):</span>
            <span className="text-green-700 ml-2">TyG &amp; Metabolic Risk: NAFLD Perspective. JCCP 2025. </span>
            <a href="https://doi.org/10.61336/jccp/25-08-50" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline ml-1">DOI →</a>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <span className="font-semibold text-amber-800">Paper 2 (Submitted):</span>
            <span className="text-amber-700 ml-2">TyG &amp; Waist: 60-Patient Study. Manuscript written. </span>
            <Link href="/submitted" className="text-amber-600 hover:underline ml-1">Status →</Link>
          </div>
        </div>
      </div>

      {/* Paper 1 / 2 / 3 reference */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Papers</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded border border-green-100">
            <p className="text-sm text-green-800 font-semibold">Paper 1: TyG &amp; Metabolic Risk (NAFLD)</p>
            <p className="text-xs text-green-600 mt-1">✅ PUBLISHED • JCCP 2025 • <a href="https://doi.org/10.61336/jccp/25-08-50" target="_blank" rel="noopener noreferrer" className="underline">DOI</a></p>
          </div>
          <div className="p-3 bg-white rounded border border-amber-100">
            <p className="text-sm text-amber-800 font-semibold">Paper 2: TyG &amp; Waist (60-patient)</p>
            <p className="text-xs text-amber-600 mt-1">📤 SUBMITTED • Read-only status</p>
          </div>
          <div className="p-3 bg-white rounded border border-violet-100">
            <p className="text-sm text-violet-800 font-semibold">Paper 3: TyG &amp; HbA1c Correlation</p>
            <p className="text-xs text-violet-600 mt-1">🆕 NEW (HbA1c field added) • ✏️ ACTIVE: Full development workspace</p>
          </div>
        </div>
      </div>

      {/* Paper type selector */}
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h3 className="font-bold text-indigo-900 mb-3">Select Paper to Generate</h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setSelectedPaper('paper2')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedPaper === 'paper2'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
            }`}
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="font-bold text-sm">Paper 2: TyG-Waist</div>
            <div className="text-xs opacity-80">Submitted</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPaper('paper3')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedPaper === 'paper3'
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
            }`}
          >
            <div className="text-2xl mb-1">🧪</div>
            <div className="font-bold text-sm">Paper 3: TyG-HbA1c</div>
            <div className="text-xs opacity-80">ADA 2026 Diabetes Risk</div>
          </button>
        </div>
        <div className="mt-3 p-3 bg-white rounded border border-indigo-200">
          <p className="text-sm text-indigo-800">
            <strong>Currently generating:</strong>{' '}
            {selectedPaper === 'paper2'
              ? 'Paper 2: TyG Index & Waist Circumference (Submitted)'
              : 'Paper 3: TyG Index & HbA1c – ADA 2026 Diabetes Risk Stratification'}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">📄 Step 5: Write JCDR Paper</h2>
          <p className="text-gray-600">Human-in-the-loop manuscript generation</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Stats Summary – depends on selected paper */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Total Patients</p>
          <p className="text-2xl font-bold text-indigo-900">
            {selectedPaper === 'paper2' ? stats.n : hba1cStats.n}
          </p>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Mean TyG</p>
          <p className="text-2xl font-bold text-indigo-900">
            {selectedPaper === 'paper2' ? stats.avgTyG.toFixed(2) : (hba1cStats.n > 0 ? (patientsWithHbA1c.reduce((s, p) => s + (p.tyg ?? 0), 0) / patientsWithHbA1c.length).toFixed(2) : '—')}
          </p>
        </div>
        {selectedPaper === 'paper2' ? (
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">High Risk (TyG)</p>
            <p className="text-2xl font-bold text-red-900">{stats.highRisk}</p>
          </div>
        ) : (
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Mean HbA1c</p>
            <p className="text-2xl font-bold text-purple-900">
              {hba1cStats.n > 0 ? hba1cStats.meanHbA1c.toFixed(1) : '—'}
            </p>
          </div>
        )}
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Correlation (r)</p>
          <p className="text-2xl font-bold text-indigo-900">
            {selectedPaper === 'paper2' ? stats.correlationR.toFixed(2) : (hba1cStats.n > 0 ? hba1cStats.tygHbA1cR.toFixed(2) : '—')}
          </p>
          {selectedPaper === 'paper3' && hba1cStats.n > 0 && (() => {
            const p = hba1cStats.tygHbA1cP;
            const pearsonStr = p < 0.001 ? `Pearson r = ${hba1cStats.tygHbA1cR.toFixed(2)}, p < 0.001` : `Pearson r = ${hba1cStats.tygHbA1cR.toFixed(2)}, p = ${p.toFixed(3)}`;
            const absR = Math.abs(hba1cStats.tygHbA1cR);
            const strength = absR >= 0.5 ? 'Strong' : absR >= 0.3 ? 'Moderate' : absR >= 0.1 ? 'Weak' : 'Negligible';
            const dir = hba1cStats.tygHbA1cR > 0 ? 'positive' : 'negative';
            const interp = p < 0.001 ? `${strength} ${dir} correlation, highly significant` : `${strength} ${dir} correlation${p < 0.05 ? ', significant' : ''}`;
            return (
              <>
                <p className="text-xs mt-1 text-indigo-700">{pearsonStr}</p>
                <p className="text-xs mt-0.5 text-green-700 font-medium">✅ {interp}</p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          type="button"
          onClick={handleExportFigures}
          className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
        >
          <p className="text-2xl mb-2">📊</p>
          <p className="font-bold text-indigo-900">Export All Figures</p>
          <p className="text-sm text-indigo-700">3 PNG (300 DPI)</p>
        </button>
        <button
          type="button"
          onClick={handleExportWord}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
        >
          <p className="text-2xl mb-2">📝</p>
          <p className="font-bold text-blue-900">Export Word</p>
          <p className="text-sm text-blue-700">
            {selectedPaper === 'paper2' ? 'Paper 2: TyG-Waist' : 'Paper 3: TyG-HbA1c'}
          </p>
        </button>
        <button
          type="button"
          onClick={handleExportPaper2Word}
          className="p-4 bg-sky-50 border border-sky-300 rounded-lg hover:bg-sky-100"
          title="Paper 3: TyG–HbA1c (requires TyG + HbA1c)"
        >
          <p className="text-2xl mb-2">✏️</p>
          <p className="font-bold text-sky-900">Paper 3: Word</p>
          <p className="text-sm text-sky-700">tyd-hba1c-manuscript-SUBMISSION-READY.docx (n={patientsWithHbA1c.length})</p>
        </button>
        <button
          type="button"
          onClick={handleExportPDF}
          className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
        >
          <p className="text-2xl mb-2">📄</p>
          <p className="font-bold text-red-900">Export PDF</p>
          <p className="text-sm text-red-700">300 DPI</p>
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
        >
          <p className="text-2xl mb-2">📊</p>
          <p className="font-bold text-green-900">Export CSV</p>
          <p className="text-sm text-green-700">Anonymized data</p>
        </button>
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg" data-pdf-hide>
        <h4 className="font-semibold text-purple-900 mb-2">📊 View Paper-Specific Figures</h4>
        <p className="text-sm text-purple-700 mb-3">
          Open dedicated page with charts matching your selected paper.
        </p>
        <a
          href={`/paper/${selectedPaper === 'paper2' ? 'paper2' : 'paper3'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
        >
          Open {selectedPaper === 'paper2' ? 'TyG-Waist' : 'TyG-HbA1c'} Figures →
        </a>
      </div>

      {/* PDF export captures this whole block (figures + manuscript); Edit buttons hidden via data-pdf-hide */}
      <div ref={manuscriptRef} className="space-y-8">
      {/* Figures Preview – use selected paper manuscript and cohort */}
      <div className="mb-8 border rounded-lg p-6 bg-white">
        <h3 className="font-bold text-xl text-indigo-900 mb-4">
          Figures Preview ({selectedPaper === 'paper2' ? 'Paper 2: TyG-Waist' : 'Paper 3: TyG-HbA1c'})
        </h3>
        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-white">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedPaper === 'paper3'
                  ? generateWaistVsHbA1cScatterSVG(patientsWithHbA1c)
                  : generateScatterPlotSVG(effectivePatients),
              }}
            />
            <p className="text-sm text-gray-600 mt-2 italic">
              <strong>Figure 1:</strong> {manuscript.figure1Caption}
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedPaper === 'paper3'
                  ? generateHbA1cHistogramSVG(patientsWithHbA1c.filter((p) => p.hba1c != null && Number.isFinite(p.hba1c)).map((p) => p.hba1c!))
                  : generateHistogramSVG(effectivePatients),
              }}
            />
            <p className="text-sm text-gray-600 mt-2 italic">
              <strong>Figure 2:</strong> {manuscript.figure2Caption}
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedPaper === 'paper3'
                  ? generateClinicalBandsBarSVG(patientsWithHbA1c)
                  : generateRiskBarChartSVG(effectivePatients),
              }}
            />
            <p className="text-sm text-gray-600 mt-2 italic">
              <strong>Figure 3:</strong> {manuscript.figure3Caption}
            </p>
          </div>
        </div>
      </div>

      {/* Manuscript Preview */}
      <div className="border rounded-lg p-8 bg-white">
        <div className="text-center mb-8">
          <SectionEditor section="title" title="Title" value={manuscript.title} />
        </div>

        <div className="mb-8 p-4 bg-gray-50 rounded">
          <p className="text-center text-gray-600">
            Dr. Muddu Surendra Nehru MD Professor Medicine
            <br />
            HOMA Clinic | {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
          </p>
        </div>

        <SectionEditor section="abstract" title="Abstract" value={manuscript.abstract} />
        <SectionEditor section="introduction" title="Introduction" value={manuscript.introduction} />
        <SectionEditor section="methods" title="Methods" value={manuscript.methods} />

        {/* Table 1 – includes HbA1c & Diabetes Risk (Paper 3 / ADA 2026) */}
        <div className="mb-6 border rounded-lg p-4 bg-white">
          <h3 className="font-bold text-lg text-indigo-900 mb-3">
            Table 1: Patient Characteristics (Anonymized)
            {selectedPaper === 'paper3' && ' – HbA1c & ADA 2026 Diabetes Risk'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Age</th>
                  <th className="p-2 border">Sex</th>
                  <th className="p-2 border">TG</th>
                  <th className="p-2 border">Glucose</th>
                  <th className="p-2 border">HDL</th>
                  <th className="p-2 border">Waist</th>
                  <th className="p-2 border">TyG</th>
                  <th className="p-2 border">Risk</th>
                  <th className="p-2 border bg-amber-50">HbA1c</th>
                  <th className="p-2 border bg-amber-50">Diabetes Risk</th>
                </tr>
              </thead>
              <tbody>
                {displayTable1.slice(0, 10).map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-2 border font-medium">{row.id}</td>
                    <td className="p-2 border">{row.age ?? '-'}</td>
                    <td className="p-2 border">{row.sex ?? '-'}</td>
                    <td className="p-2 border">{row.tg ?? '-'}</td>
                    <td className="p-2 border">{row.glucose ?? '-'}</td>
                    <td className="p-2 border">{row.hdl ?? '-'}</td>
                    <td className="p-2 border">{row.waist ?? '-'}</td>
                    <td className="p-2 border">{row.tyg != null ? (typeof row.tyg === 'number' ? row.tyg.toFixed(2) : row.tyg) : '-'}</td>
                    <td className="p-2 border">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          row.risk === 'High'
                            ? 'bg-red-100 text-red-700'
                            : row.risk === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {row.risk}
                      </span>
                    </td>
                    <td className="p-2 border bg-amber-50/50">{row.hba1c != null ? row.hba1c : '—'}</td>
                    <td className="p-2 border bg-amber-50/50">
                      <span className={`px-2 py-1 rounded text-xs border ${getDiabetesRiskColor((row as { diabetesRisk?: DiabetesRiskWithPending }).diabetesRisk ?? 'Pending')}`}>
                        {(row as { diabetesRisk?: DiabetesRiskWithPending }).diabetesRisk ?? 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayTable1.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                + {displayTable1.length - 10} more patients (see CSV export)
              </p>
            )}
          </div>
        </div>

        <SectionEditor section="results" title="Results" value={manuscript.results} />
        <SectionEditor section="discussion" title="Discussion" value={manuscript.discussion} />
        <SectionEditor section="conclusion" title="Conclusion" value={manuscript.conclusion} />
        <SectionEditor section="references" title="References" value={manuscript.references} />
      </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <p className="text-sm text-indigo-800">
          📝 <strong>Human-in-the-Loop:</strong> Click &quot;Edit&quot; on any section to modify text
          before export. All patient names are anonymized (Patient 001, 002...) in exports. Original
          names preserved internally.
        </p>
      </div>
    </div>
  );
}
