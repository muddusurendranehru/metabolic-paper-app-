/**
 * CSV parse/generate for patient data and batch export.
 */

import type { PatientRow } from "@/lib/tyg";

const CSV_HEADERS = [
  "id",
  "name",
  "age",
  "sex",
  "tg",
  "glucose",
  "hdl",
  "waist",
  "tyg",
  "risk",
];

export function patientsToCsv(patients: PatientRow[]): string {
  const rows = patients.map((p) =>
    [
      p.id,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      p.age,
      p.sex,
      p.tg,
      p.glucose,
      p.hdl,
      p.waist,
      p.tyg,
      p.risk,
    ].join(",")
  );
  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

export function downloadCSV(data: unknown[], filename: string): void {
  if (typeof window === "undefined") return;
  const headers = Object.keys((data[0] as Record<string, unknown>) || {});
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => (row as Record<string, unknown>)[h] ?? "").join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(text: string): Record<string, string>[] {
  const [headerLine, ...rows] = text.split("\n");
  const headers = headerLine?.split(",") ?? [];
  return rows.map((row) => {
    const values = row.split(",");
    return headers.reduce(
      (obj, h, i) => ({ ...obj, [h]: values[i] ?? "" }),
      {} as Record<string, string>
    );
  });
}

export function parseCsvToPatients(csv: string): Partial<PatientRow>[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const rows: Partial<PatientRow>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.replace(/^"|"$/g, "").replace(/""/g, '"'));
    const row: Partial<PatientRow> = {};
    header.forEach((h, j) => {
      const val = values[j];
      if (val === undefined) return;
      if (h === "name") row.name = val;
      else if (h === "age") row.age = parseInt(val, 10) || 0;
      else if (h === "sex") row.sex = val;
      else if (h === "tg") row.tg = parseFloat(val) || 0;
      else if (h === "glucose") row.glucose = parseFloat(val) || 0;
      else if (h === "hdl") row.hdl = parseFloat(val) || 0;
      else if (h === "waist") row.waist = parseFloat(val) || 0;
      else if (h === "tyg") row.tyg = parseFloat(val) || 0;
      else if (h === "risk") row.risk = (val === "High" ? "High" : val === "Moderate" ? "Moderate" : val === "Pending" ? "Pending" : "Normal") as PatientRow["risk"];
      else if (h === "id") row.id = val;
      else if (h === "hba1c" || h === "hba1c (%)") {
        const n = parseFloat(val);
        row.hba1c = Number.isFinite(n) ? n : undefined;
      }
      else if (h === "diabetesrisk") {
        const canonical: Record<string, PatientRow["diabetesRisk"]> = {
          "Normal": "Normal", "Prediabetes": "Prediabetes", "Good": "Good", "Poor": "Poor", "Alert": "Alert", "Pending": "Pending",
          "Non-Diabetic": "Normal", "Prediabetic": "Prediabetes", "Good Control": "Good", "Poor Control": "Poor",
        };
        const v = canonical[val];
        if (v !== undefined) row.diabetesRisk = v;
      }
    });
    rows.push(row);
  }
  return rows;
}
