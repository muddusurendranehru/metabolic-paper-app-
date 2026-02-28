// eslint-disable-next-line no-restricted-imports
// Do NOT import from: app/research, components/tabs, lib/utils except step12
"use client";
/**
 * Step 12 – document upload. Imports ONLY from @/lib/utils/step12 (and React, mammoth).
 * Supports .txt, .json, and .docx (Word / Google Docs export).
 */

import { useCallback, useState } from "react";
import mammoth from "mammoth";
import { extractPlainText } from "@/lib/utils/step12";

interface DocumentUploaderProps {
  onExtracted: (text: string) => void;
}

export default function DocumentUploader({ onExtracted }: DocumentUploaderProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setStatus("Reading…");

      const name = file.name.toLowerCase();
      if (name.endsWith(".docx") || name.endsWith(".doc")) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = (result.value || "").trim();
          const normalized = extractPlainText(text);
          onExtracted(normalized || text);
          setStatus(null);
        } catch (err) {
          setStatus("Could not read Word file. Try saving as .txt or paste the text below.");
          console.error("Docx extract error:", err);
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result ?? "");
        const text = extractPlainText(raw);
        onExtracted(text);
        setStatus(null);
      };
      reader.onerror = () => {
        setStatus("Could not read file.");
      };
      reader.readAsText(file);
    },
    [onExtracted]
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload document (.txt, .json, .docx from Word or Google Docs)
      </label>
      <input
        type="file"
        accept=".txt,.json,.doc,.docx"
        onChange={handleFile}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700"
      />
      {status && <p className="mt-2 text-sm text-amber-600">{status}</p>}
      <p className="mt-1 text-xs text-gray-500">
        For PDF: paste the visible text from your document into the box below (not the raw file).
      </p>
    </div>
  );
}
