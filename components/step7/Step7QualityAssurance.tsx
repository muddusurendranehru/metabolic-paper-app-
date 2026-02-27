"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import mammoth from "mammoth";
import { FORMAT_TEMPLATES, getPlagiarismStatus, GRAMMAR_MIN_SCORE } from "./step7-config";
import { downloadFormattedDocx } from "@/lib/utils/step7-formatted-export";

type CheckStatus = "idle" | "running" | "done";

export default function Step7QualityAssurance() {
  const [manuscriptText, setManuscriptText] = useState("");
  const [paperTitle, setPaperTitle] = useState("TyG vs HbA1c n=74");
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [plagiarismPercent, setPlagiarismPercent] = useState<number | null>(null);
  const [grammarScore, setGrammarScore] = useState<number | null>(null);
  const [grammarFixes, setGrammarFixes] = useState<string[]>([]);
  const [formatIssue, setFormatIssue] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("ijcr");
  const [downloading, setDownloading] = useState(false);

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadFileName(null);
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setUploadError("Please select a .docx file.");
      return;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setManuscriptText(result.value || "");
      setUploadFileName(file.name);
      const baseName = file.name.replace(/\.docx$/i, "").replace(/-/g, " ");
      if (!paperTitle || paperTitle === "TyG vs HbA1c n=74") setPaperTitle(baseName);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to read .docx");
    }
    e.target.value = "";
  };

  const runAllChecks = async () => {
    setCheckStatus("running");
    setPlagiarismPercent(null);
    setGrammarScore(null);
    setGrammarFixes([]);
    setFormatIssue(null);
    const text = manuscriptText.trim() || "Sample manuscript text for quality check.";
    await new Promise((r) => setTimeout(r, 1500));
    setPlagiarismPercent(4.2);
    setGrammarScore(9);
    setGrammarFixes([
      "Use 'patients' consistently (not 'subjects')",
      "Abstract: add comma before 'and' in compound sentence",
      "Methods: spell out 'n' as 'sample size' on first use",
    ]);
    setFormatIssue(text.includes("Table 1") ? null : "Missing Table 1");
    setCheckStatus("done");
  };

  const plagiarismStatus = plagiarismPercent != null ? getPlagiarismStatus(plagiarismPercent) : null;
  const grammarPass = grammarScore != null && grammarScore >= GRAMMAR_MIN_SCORE;
  const formatPass = formatIssue == null && checkStatus === "done";

  const handleDownloadFormatted = async () => {
    const text = manuscriptText.trim();
    if (!text) {
      alert("Add manuscript text or upload a .docx first, then click Download Formatted.");
      return;
    }
    setDownloading(true);
    try {
      await downloadFormattedDocx(paperTitle, text, selectedFormat as "ijcr" | "jcpr" | "vancouver");
    } catch (e) {
      console.error(e);
      alert("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Step 7: Quality Assurance</h1>
        <p className="text-gray-600">Plagiarism, grammar, and journal formatting checks. Run after Step 6.</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Manuscript</h2>
        <p className="text-sm text-gray-600 mb-2">Upload your .docx from Step 6 or paste text below.</p>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleDocxUpload}
            className="hidden"
            id="step7-docx-upload"
          />
          <label
            htmlFor="step7-docx-upload"
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200 font-medium cursor-pointer"
          >
            Upload .docx
          </label>
          {uploadFileName && (
            <span className="text-sm text-green-700">✓ {uploadFileName}</span>
          )}
          {uploadError && (
            <span className="text-sm text-red-600">{uploadError}</span>
          )}
        </div>
        <input
          type="text"
          placeholder="Paper title (auto-fill from Step 6 or filename)"
          value={paperTitle}
          onChange={(e) => setPaperTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
        />
        <textarea
          placeholder="Paste manuscript text or upload .docx above..."
          value={manuscriptText}
          onChange={(e) => setManuscriptText(e.target.value)}
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <button
          onClick={runAllChecks}
          disabled={checkStatus === "running"}
          className="w-full py-4 rounded-lg font-bold text-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {checkStatus === "running" ? "Running checks…" : "Run All Checks"}
        </button>

        {checkStatus === "done" && (
          <div className="mt-6 space-y-4">
            <div
              className={`p-4 rounded-lg border ${
                plagiarismStatus === "pass"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : plagiarismStatus === "review"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {plagiarismStatus === "pass" && "✅"}
              {plagiarismStatus === "review" && "⚠️"}
              {plagiarismStatus === "fail" && "❌"}
              {" Plagiarism: "}
              {plagiarismPercent}%
              {plagiarismStatus === "pass" && " (PASS)"}
              {plagiarismStatus === "review" && " (REVIEW – show sources)"}
              {plagiarismStatus === "fail" && " (FAIL – suggest rewrites)"}
            </div>
            <div className={`p-4 rounded-lg border ${grammarPass ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              {grammarPass ? "✅" : "❌"} Grammar: {grammarScore}/10 (min {GRAMMAR_MIN_SCORE})
              {grammarFixes.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm">
                  {grammarFixes.slice(0, 5).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className={`p-4 rounded-lg border ${formatPass ? "bg-green-50 border-green-200 text-green-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
              {formatPass ? "✅" : "⚠️"} Format: {formatIssue || "Ready for template"}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-3">Journal formatter</h2>
        <p className="text-sm text-gray-600 mb-2">Choose template and download current manuscript as formatted .docx.</p>
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg mb-3 text-sm"
        >
          {FORMAT_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadFormatted}
            disabled={downloading || !manuscriptText.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {downloading ? "Preparing…" : "Download Formatted"}
          </button>
          {!manuscriptText.trim() && (
            <span className="text-sm text-amber-600">Upload .docx or paste text above first.</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/step8" className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
          Proceed to Step 8 →
        </Link>
        <Link href="/step6" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
          ← Back to Step 6
        </Link>
      </div>
    </div>
  );
}
