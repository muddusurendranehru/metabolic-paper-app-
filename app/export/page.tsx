"use client";

import { useRef, useState } from "react";
import { usePatients } from "@/lib/patient-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileImage, FileText } from "lucide-react";
import Link from "next/link";

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ExportPage() {
  const { patients } = usePatients();
  const chartRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportCSV = () => {
    const headers = [
      "Name",
      "Age",
      "Sex",
      "TG",
      "Glucose",
      "HDL",
      "Waist_cm",
      "TyG",
      "Risk",
    ];
    const rows = patients.map((p) =>
      [p.name, p.age, p.sex, p.tg, p.glucose, p.hdl, p.waist, p.tyg, p.risk].join(
        ","
      )
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, "tyg-patient-data.csv");
  };

  const exportPNG = async () => {
    setExporting(true);
    try {
      const div = chartRef.current;
      if (!div) return;
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(div, {
        scale: 300 / 96,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, "tyg-charts-300dpi.png");
        }
        setExporting(false);
      }, "image/png");
    } catch {
      setExporting(false);
    }
  };

  const exportJCDR = () => {
    const text = `JCDR Draft – TyG Index Study
Dr Muddu Surendra Nehru, Professor of Medicine, HOMA Clinic

Patient data (n=${patients.length}):
${patients
  .map(
    (p) =>
      `${p.name} | ${p.age}${p.sex} | TG=${p.tg} | Glucose=${p.glucose} | HDL=${p.hdl} | Waist=${p.waist}cm | TyG=${p.tyg} | ${p.risk}`
  )
  .join("\n")}

TyG = ln(TG × Glucose / 2). Risk: TyG > 9 = High, else Normal.
`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, "jcdr-tyg-draft.txt");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Export</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/analyze">Analyze</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Downloads</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <FileSpreadsheet className="size-4" />
            CSV
          </Button>
          <Button
            onClick={exportPNG}
            variant="outline"
            className="gap-2"
            disabled={exporting}
          >
            <FileImage className="size-4" />
            PNG (300 dpi)
          </Button>
          <Button onClick={exportJCDR} variant="outline" className="gap-2">
            <FileText className="size-4" />
            JCDR paper draft
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview (for PNG export)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={chartRef}
            className="rounded border bg-white p-4 text-sm text-foreground"
          >
            <p className="font-semibold mb-2">TyG Research – Patient summary</p>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">Name</th>
                  <th className="text-left p-1">Age</th>
                  <th className="text-left p-1">TG</th>
                  <th className="text-left p-1">Glucose</th>
                  <th className="text-left p-1">HDL</th>
                  <th className="text-left p-1">Waist</th>
                  <th className="text-left p-1">TyG</th>
                  <th className="text-left p-1">Risk</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-1">{p.name}</td>
                    <td className="p-1">{p.age}</td>
                    <td className="p-1">{p.tg}</td>
                    <td className="p-1">{p.glucose}</td>
                    <td className="p-1">{p.hdl}</td>
                    <td className="p-1">{p.waist}</td>
                    <td className="p-1">{p.tyg}</td>
                    <td className="p-1">{p.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-muted-foreground">
              Dr Muddu Surendra Nehru | HOMA Clinic | TyG Index
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
