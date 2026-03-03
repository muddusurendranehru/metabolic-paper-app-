"use client";
/**
 * Fetches Step 13 submissions from API and renders form + table.
 * Refetches when form saves so new submissions appear.
 */

import { useState, useEffect, useCallback } from "react";
import AuthorTable from "@/components/admin/AuthorTable";
import CollaborationForm from "@/components/admin/CollaborationForm";
import type { AuthorSubmission } from "@/lib/utils/admin/author-schema";

export default function CollaborationAdmin() {
  const [submissions, setSubmissions] = useState<AuthorSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/collaboration/submissions");
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <>
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Author form (embedded)</h2>
        <CollaborationForm onSaved={fetchSubmissions} />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submissions</h2>
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading…</p>
        ) : (
          <AuthorTable submissions={submissions} />
        )}
      </section>
    </>
  );
}
