// eslint-disable-next-line no-restricted-imports
// Do NOT import from: app/research, components/tabs, lib/utils except step12
/**
 * Step 12 – completely separate path: app/step12/
 * Imports ONLY from components/step12 and next/link.
 * NEVER imports from app/research/steps/*.
 * Delete app/step12/ → steps 1–11 work 100% unchanged.
 */

import ContentGenerator from "@/components/step12/ContentGenerator";

export default function Step12Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ContentGenerator />
    </div>
  );
}
