"use client";
// 1. Step 9: Medical Education. Do not modify step-1–step-6 or patientData.
// 2. All input is local state (paper meta only).
// 3. Steps 7–9 are optional; disabling them must not break 1–6.
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  DEFAULT_STEP9_META,
  DEFAULT_CME_META,
  generateMCQBank,
  generateGammaSlidesMarkdown,
  generateCMESlidesMarkdown,
  type Step9PaperMeta,
  type Step9CMEMeta,
  type MCQItem,
} from "./step9-config";
import { exportPDF } from "@/lib/utils/pdf-export";

function copyToClipboard(text: string): boolean {
  if (typeof navigator?.clipboard?.writeText === "function") {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export default function Step9MedicalEducation() {
  const [meta, setMeta] = useState<Step9PaperMeta>({ ...DEFAULT_STEP9_META });
  const [mcqs, setMcqs] = useState<MCQItem[]>([]);
  const [gammaMarkdown, setGammaMarkdown] = useState("");
  const [cmeMeta, setCmeMeta] = useState<Step9CMEMeta>({ ...DEFAULT_CME_META });
  const [cmeMarkdown, setCmeMarkdown] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"meta" | "quiz" | "gamma" | "cme">("meta");
  const pdfRef = useRef<HTMLDivElement>(null);

  const updateMeta = (key: keyof Step9PaperMeta, value: string) => {
    setMeta((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = useCallback(() => {
    setMcqs(generateMCQBank(meta));
    setGammaMarkdown(generateGammaSlidesMarkdown(meta));
    const cmeFilled: Step9CMEMeta = {
      ...DEFAULT_CME_META,
      topicTitle: meta.title,
      clinicName: meta.location.split(",")[0]?.trim() || DEFAULT_CME_META.clinicName,
      location: meta.location,
    };
    setCmeMeta(cmeFilled);
    setCmeMarkdown(generateCMESlidesMarkdown(cmeFilled));
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setActiveTab("quiz");
  }, [meta]);

  const currentQuestion = mcqs[currentIndex];
  const isCorrect = selectedOption !== null && selectedOption === currentQuestion?.correctIndex;

  const handleCopyGamma = () => {
    if (copyToClipboard(gammaMarkdown)) {
      setCopied("gamma");
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    try {
      await exportPDF(pdfRef.current, "step9-mcq-bank.pdf");
    } catch (e) {
      console.error("PDF export failed:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Step 9: Medical Education</h1>
        <p className="text-gray-600">
          MCQ bank and Gamma slides from your published paper. No patient data—local state only.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("meta")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "meta" ? "bg-indigo-100 text-indigo-800 border border-b-0 border-indigo-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Paper details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quiz")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "quiz" ? "bg-indigo-100 text-indigo-800 border border-b-0 border-indigo-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          MCQ Quiz ({mcqs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gamma")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "gamma" ? "bg-indigo-100 text-indigo-800 border border-b-0 border-indigo-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Gamma slides
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cme")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "cme" ? "bg-indigo-100 text-indigo-800 border border-b-0 border-indigo-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          CME slides (10)
        </button>
      </div>

      {activeTab === "meta" && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Published paper details</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="md:col-span-2">
              <label className="block text-gray-600 mb-1">Title</label>
              <input
                value={meta.title}
                onChange={(e) => updateMeta("title", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-600 mb-1">Abstract</label>
              <textarea
                value={meta.abstract}
                onChange={(e) => updateMeta("abstract", e.target.value)}
                className="w-full p-2 border rounded min-h-[80px]"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Key finding</label>
              <input
                value={meta.keyFinding}
                onChange={(e) => updateMeta("keyFinding", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Journal</label>
              <input
                value={meta.journal}
                onChange={(e) => updateMeta("journal", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">n (sample size)</label>
              <input
                value={meta.n}
                onChange={(e) => updateMeta("n", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Location</label>
              <input
                value={meta.location}
                onChange={(e) => updateMeta("location", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">r value</label>
              <input
                value={meta.rValue}
                onChange={(e) => updateMeta("rValue", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">p value</label>
              <input
                value={meta.pValue}
                onChange={(e) => updateMeta("pValue", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Generate MCQs, Gamma & CME slides
          </button>
        </div>
      )}

      {activeTab === "quiz" && mcqs.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-indigo-900">
              Question {currentIndex + 1} of {mcqs.length}
              <span className="ml-2 text-sm font-normal text-gray-500">({currentQuestion.category})</span>
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
              >
                Export PDF
              </button>
            </div>
          </div>
          <p className="text-gray-800 font-medium mb-3">{currentQuestion.question}</p>
          <div className="space-y-2">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (showExplanation) return;
                  setSelectedOption(i);
                }}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                  selectedOption === i
                    ? i === currentQuestion.correctIndex
                      ? "border-green-600 bg-green-50 text-green-800"
                      : "border-red-500 bg-red-50 text-red-800"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>
          {selectedOption !== null && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                {isCorrect ? "Correct." : "Incorrect. Correct answer: " + currentQuestion.options[currentQuestion.correctIndex]}
              </p>
              {currentQuestion.explanation && (
                <p className="text-sm text-gray-600 mt-1">{currentQuestion.explanation}</p>
              )}
            </div>
          )}
          {selectedOption === null && !showExplanation && (
            <button
              type="button"
              onClick={() => setShowExplanation(true)}
              className="mt-3 text-indigo-600 text-sm font-medium"
            >
              Show answer
            </button>
          )}
          {showExplanation && selectedOption === null && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                Correct: {currentQuestion.options[currentQuestion.correctIndex]}
              </p>
              {currentQuestion.explanation && (
                <p className="text-sm text-gray-600 mt-1">{currentQuestion.explanation}</p>
              )}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex((i) => Math.max(0, i - 1));
                setSelectedOption(null);
                setShowExplanation(false);
              }}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentIndex((i) => Math.min(mcqs.length - 1, i + 1));
                setSelectedOption(null);
                setShowExplanation(false);
              }}
              disabled={currentIndex === mcqs.length - 1}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {activeTab === "quiz" && mcqs.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center text-gray-500">
          Fill paper details and click &quot;Generate MCQs, Gamma & CME slides&quot; to start the quiz.
        </div>
      )}

      {activeTab === "gamma" && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-3">Gamma slides (5-slide Markdown)</h2>
          <p className="text-sm text-gray-600 mb-2">
            Copy the markdown below and paste into Gamma.app to create your deck.
          </p>
          <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto">
            {gammaMarkdown || "Generate content from Paper details first."}
          </pre>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={handleCopyGamma}
              disabled={!gammaMarkdown}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied === "gamma" ? "Copied!" : "Export to Gamma (Copy)"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "cme" && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-3">CME slides (10-slide Markdown)</h2>
          <p className="text-sm text-gray-600 mb-2">
            Title, Learning Objectives, Assessment, Labs, Calculator, Risk stratification, Lifestyle, Pharmacologic, Case study, Takeaways. Copy and paste into Gamma or any deck tool.
          </p>
          <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto">
            {cmeMarkdown || generateCMESlidesMarkdown(cmeMeta)}
          </pre>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => {
                const text = cmeMarkdown || generateCMESlidesMarkdown(cmeMeta);
                if (copyToClipboard(text)) {
                  setCopied("cme");
                  setTimeout(() => setCopied(null), 2000);
                }
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              {copied === "cme" ? "Copied!" : "Copy CME slides"}
            </button>
          </div>
        </div>
      )}

      {/* Hidden div for PDF export: full MCQ bank */}
      <div
        ref={pdfRef}
        className="absolute left-[-9999px] top-0 w-[210mm] p-8 bg-white text-black text-sm"
        aria-hidden
      >
        <h1 className="text-xl font-bold mb-4">MCQ Bank – {meta.title}</h1>
        <p className="text-gray-600 mb-6">{meta.journal} | n = {meta.n}</p>
        {mcqs.map((q, i) => (
          <div key={i} className="mb-6 break-inside-avoid">
            <p className="font-medium mb-2">
              {i + 1}. [{q.category}] {q.question}
            </p>
            <ul className="list-disc list-inside ml-2 mb-1">
              {q.options.map((opt, j) => (
                <li key={j} className={j === q.correctIndex ? "font-semibold" : ""}>
                  {String.fromCharCode(65 + j)}. {opt}
                  {j === q.correctIndex ? " ✓" : ""}
                </li>
              ))}
            </ul>
            {q.explanation && <p className="text-gray-600 text-xs mt-1">{q.explanation}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/step8"
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
        >
          ← Back to Step 8
        </Link>
        <Link
          href="/step11"
          className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-800 font-medium hover:bg-indigo-200"
        >
          Step 11: Content Amplification →
        </Link>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
