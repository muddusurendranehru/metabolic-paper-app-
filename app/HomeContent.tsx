"use client";

import { useCallback, useState } from "react";
import { usePatients } from "@/lib/patient-store";
import { createPatient } from "@/lib/tyg";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import Link from "next/link";

export function HomeContent({
  initialTab,
  initialPage,
}: {
  initialTab?: string;
  initialPage?: string;
}) {
  const { patients, setPatients } = usePatients();
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractResult, setExtractResult] = useState<{
    tg: number;
    glucose: number;
    hdl: number;
  } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.includes("pdf")) return;
      setUploading(true);
      setExtractResult(null);
      try {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/upload-pdf", {
          method: "POST",
          body: form,
        });
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 422) {
            alert(
              `Could not find values: ${result.found ? JSON.stringify(result.found) : "Unknown"}`
            );
          } else {
            alert(result.error || "Upload failed");
          }
          return;
        }

        const { tg, glucose, hdl } = result;
        setExtractResult({ tg, glucose, hdl });
        if (tg > 0 || glucose > 0) {
          const id = String(Date.now());
          const newRow = createPatient(
            id,
            file.name.replace(/\.pdf$/i, "").slice(0, 30),
            0,
            "M",
            tg || 0,
            glucose || 0,
            hdl ?? 0,
            90
          );
          setPatients((prev) => [...prev, newRow]);
        }
      } catch {
        setExtractResult({
          tg: 0,
          glucose: 0,
          hdl: 0,
        });
        alert("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [setPatients]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dr Muddu TyG Research Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload lab PDFs to extract TG, Glucose, HDL. Edit waist and view
          TyG & risk in the table.
        </p>
      </div>

      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 dark:bg-yellow-950/30 dark:border-yellow-600">
        <p className="text-sm">
          <strong>Medical Disclaimer:</strong> For research only. Not for
          diagnosis. Verify all values manually. Waist from clinic records.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Drag & drop PDF upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              drag ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={onFileInput}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="size-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {uploading
                  ? "Parsing PDF..."
                  : "Drop a PDF here or click to select"}
              </span>
            </label>
          </div>
          {extractResult && (
            <p className="mt-3 text-sm text-muted-foreground">
              Last extraction: TG={extractResult.tg}, Glucose=
              {extractResult.glucose}, HDL={extractResult.hdl}
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Patient data (editable waist)</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/analyze">View Analyze</Link>
          </Button>
        </div>
        <DataTable data={patients} onDataChange={setPatients} />
      </div>
    </div>
  );
}
