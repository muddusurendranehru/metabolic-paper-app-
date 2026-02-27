"use client";

import { useState } from 'react';
import { formatPaperForJournal } from './journal-formatter';
import { exportSubmissionPackage } from '@/lib/utils/docx-export';
import { generateCoverLetter } from '@/lib/utils/cover-letter-generator';
import {
  PAPER_OPTIONS,
  JOURNAL_TEMPLATES,
  CHECKLIST_ITEMS,
  runQualityChecklist,
} from './step6-config';

export default function Step6JournalSubmission() {
  const [selectedPaper, setSelectedPaper] = useState<string>('paper3');
  const [selectedJournal, setSelectedJournal] = useState<string>('ijcr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const currentPaper = PAPER_OPTIONS.find((p) => p.id === selectedPaper);
  const currentJournal = JOURNAL_TEMPLATES.find((j) => j.id === selectedJournal);

  const handleGeneratePackage = async () => {
    setIsGenerating(true);
    try {
      const formattedPaper = formatPaperForJournal(selectedPaper, selectedJournal);
      setChecklist(runQualityChecklist(formattedPaper, currentJournal!.abstractLimit));
      await exportSubmissionPackage(formattedPaper, selectedJournal);
      await new Promise((r) => setTimeout(r, 300));
      await generateCoverLetter(formattedPaper, selectedJournal);
      alert('✅ Submission package generated successfully!');
    } catch (error) {
      console.error('Generation failed:', error);
      alert('❌ Failed to generate submission package');
    } finally {
      setIsGenerating(false);
    }
  };

  const allChecksPassed = Object.values(checklist).every((v) => v === true);
  const checklistLabel = (key: string) =>
    key === 'abstractWordCount' ? `✓ Abstract <${currentJournal?.abstractLimit} words` : CHECKLIST_ITEMS.find((i) => i.key === key)?.label ?? key;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">📤 Step 6: Journal Submission</h1>
        <p className="text-gray-600">Generate submission-ready manuscript with journal-specific formatting</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">1. Select Paper</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PAPER_OPTIONS.map((paper) => (
            <button
              key={paper.id}
              onClick={() => setSelectedPaper(paper.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPaper === paper.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{paper.title}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    paper.status === 'Published' ? 'bg-green-100 text-green-800' : paper.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {paper.status}
                </span>
              </div>
              {paper.journal && <p className="text-sm opacity-80">{paper.journal}</p>}
              {paper.doi && <p className="text-xs opacity-60">DOI: {paper.doi}</p>}
            </button>
          ))}
        </div>
        {currentPaper?.status === 'Published' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">⚠️ This paper is already published. Generate only for archival purposes.</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">2. Select Journal Template</h2>
        <select value={selectedJournal} onChange={(e) => setSelectedJournal(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-gray-700">
          {JOURNAL_TEMPLATES.map((journal) => (
            <option key={journal.id} value={journal.id}>{journal.name} (Abstract limit: {journal.abstractLimit} words)</option>
          ))}
        </select>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">Journal Requirements:</h3>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• Abstract: &lt;{currentJournal?.abstractLimit} words</li>
              <li>• Font: {selectedJournal === 'ijcr' ? 'Arial 11pt' : 'Times New Roman 12pt'}</li>
              <li>• Spacing: {selectedJournal === 'generic' ? 'Single' : '1.5 or Double'}</li>
              <li>• References: {selectedJournal === 'jcdr' ? 'Vancouver' : 'APA/Vancouver'}</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Output Files:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Manuscript.docx</li>
              <li>• Cover_Letter.txt</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">3. Quality Checklist</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {CHECKLIST_ITEMS.map((item) => (
            <div
              key={item.key}
              className={`p-3 rounded-lg border ${
                checklist[item.key] === true ? 'bg-green-50 border-green-200 text-green-800' : checklist[item.key] === false ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {checklist[item.key] === true ? '✅' : checklist[item.key] === false ? '❌' : '⬜'} {checklistLabel(item.key)}
            </div>
          ))}
        </div>
        {allChecksPassed && Object.keys(checklist).length > 0 && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 font-semibold">✅ All quality checks passed! Ready for submission.</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={handleGeneratePackage}
          disabled={isGenerating || currentPaper?.status === 'Published'}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
            isGenerating ? 'bg-gray-400 cursor-not-allowed' : currentPaper?.status === 'Published' ? 'bg-yellow-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </span>
          ) : currentPaper?.status === 'Published' ? (
            '🔒 Paper Already Published (Cannot Resubmit)'
          ) : (
            '📤 Generate Submission Package'
          )}
        </button>
        <p className="text-sm text-gray-500 mt-3 text-center">Output: Manuscript.docx + Cover_Letter.txt</p>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">📋 Next Steps After Generation:</h3>
        <ol className="space-y-2 text-blue-800">
          <li>1. Review generated manuscript in Microsoft Word</li>
          <li>2. Verify statistics match your dashboard data</li>
          <li>3. Add co-author names and affiliations</li>
          <li>4. Sign cover letter and upload to journal portal</li>
        </ol>
      </div>
    </div>
  );
}
