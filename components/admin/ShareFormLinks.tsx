"use client";
/**
 * Copy-paste links to share Step 13 form with others. No change to submit/save logic.
 */

import { useState, useEffect } from "react";

const GOOGLE_FORM_URL = "https://forms.gle/N2oi4oJaYhVMu2NBA";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function ShareFormLinks() {
  const [appFormUrl, setAppFormUrl] = useState("/step13");
  useEffect(() => {
    setAppFormUrl(`${window.location.origin}/step13`);
  }, []);

  return (
    <section className="bg-white rounded-lg shadow p-4 mb-6 border border-indigo-100">
      <h2 className="text-base font-semibold text-gray-900 mb-2">Share this form with others</h2>
      <p className="text-sm text-gray-600 mb-3">Copy the link and paste it in email, WhatsApp, or any message to send to collaborators.</p>
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-gray-600">Embedded form (this app):</span>
          <code className="flex-1 min-w-0 truncate max-w-full text-indigo-600 bg-gray-50 px-1 rounded" title={appFormUrl}>
            {appFormUrl}
          </code>
          <CopyButton text={appFormUrl} label="Copy link" />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-gray-600">Google Form:</span>
          <code className="flex-1 min-w-0 truncate max-w-full text-indigo-600 bg-gray-50 px-1 rounded" title={GOOGLE_FORM_URL}>
            {GOOGLE_FORM_URL}
          </code>
          <CopyButton text={GOOGLE_FORM_URL} label="Copy link" />
        </div>
      </div>
    </section>
  );
}
