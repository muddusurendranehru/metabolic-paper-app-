"use client";

import { useState } from "react";
import { downloadCSV, parseCsvToPatients } from "@/lib/csv-utils";
import type { PatientRow } from "@/lib/tyg";
import { calcTyG, calcRisk } from "@/lib/tyg";

export function TabExtract({
  patientData,
  setPatientData,
}: {
  patientData: PatientRow[];
  setPatientData: (arg: PatientRow[] | ((prev: PatientRow[]) => PatientRow[])) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [manualValues, setManualValues] = useState({
    name: "",
    age: "",
    sex: "M",
    tg: "",
    glucose: "",
    hdl: "",
    waist: "",
  });

  const updateRow = (rowIdx: number, field: keyof PatientRow, value: string | number) => {
    const row = patientData[rowIdx];
    if (!row) return;
    const next = { ...row };
    if (field === "name") next.name = String(value);
    else if (field === "age") next.age = typeof value === "number" ? value : parseInt(String(value), 10) || 0;
    else if (field === "sex") next.sex = String(value);
    else if (field === "tg") next.tg = typeof value === "number" ? value : parseFloat(String(value)) || 0;
    else if (field === "glucose") next.glucose = typeof value === "number" ? value : parseFloat(String(value)) || 0;
    else if (field === "hdl") next.hdl = typeof value === "number" ? value : parseFloat(String(value)) || 0;
    else if (field === "waist") next.waist = typeof value === "number" ? value : parseFloat(String(value)) || 0;

    next.tyg = Math.round(calcTyG(next.tg, next.glucose) * 100) / 100;
    next.risk = calcRisk(next.tyg);

    setPatientData((prev) =>
      prev.map((r, i) => (i === rowIdx ? next : r))
    );
    setEditingCell(null);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setProcessing(true);
    setProgress({ current: 0, total: files.length });
    const newRows: PatientRow[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/ocr", { method: "POST", body: formData });
        const data = await res.json();

        const tg = data.tg ?? (parseFloat(manualValues.tg) || 0);
        const glucose = data.glucose ?? (parseFloat(manualValues.glucose) || 0);
        const tyg = tg > 0 && glucose > 0 ? Math.round(Math.log((tg * glucose) / 2) * 100) / 100 : 0;
        const risk = tyg >= 9.5 ? "High" : tyg >= 8.5 ? "Moderate" : "Normal";

        newRows.push({
          id: file.name + "-" + Date.now(),
          name: data.name || manualValues.name || file.name.replace(/\.pdf$/i, "") || "Patient",
          age: data.age ?? (manualValues.age ? parseInt(manualValues.age, 10) : 0),
          sex: data.sex || manualValues.sex || "M",
          tg: tg,
          glucose: glucose,
          hdl: data.hdl ?? (parseFloat(manualValues.hdl) || 0),
          waist: parseFloat(manualValues.waist) || 0,
          tyg,
          risk,
        });
      } catch {
        newRows.push({
          id: file.name + "-" + Date.now(),
          name: file.name.replace(/\.pdf$/i, "") || "Patient",
          age: 0,
          sex: "M",
          tg: 0,
          glucose: 0,
          hdl: 0,
          waist: 0,
          tyg: 0,
          risk: "Normal",
        });
      }
      setProgress({ current: i + 1, total: files.length });
    }

    setPatientData((prev) => [...prev, ...newRows]);
    setProcessing(false);
  };

  const handleAddManual = () => {
    if (!manualValues.name.trim() || !manualValues.tg || !manualValues.glucose) {
      alert("Please enter Name, TG, and Glucose");
      return;
    }

    const tg = parseFloat(manualValues.tg) || 0;
    const glucose = parseFloat(manualValues.glucose) || 0;
    const tyg = Math.round(calcTyG(tg, glucose) * 100) / 100;

    const newRow: PatientRow = {
      id: String(Date.now()),
      name: manualValues.name.trim(),
      age: manualValues.age ? parseInt(manualValues.age, 10) : 0,
      sex: manualValues.sex || "M",
      tg,
      glucose,
      hdl: manualValues.hdl ? parseFloat(manualValues.hdl) : 0,
      waist: manualValues.waist ? parseFloat(manualValues.waist) : 0,
      tyg,
      risk: calcRisk(tyg),
    };

    setPatientData((prev) => [...prev, newRow]);
    setManualValues({ name: "", age: "", sex: "M", tg: "", glucose: "", hdl: "", waist: "" });
  };

  const handleDownload = () => {
    downloadCSV(
      patientData.map((p) => ({
        name: p.name,
        age: p.age,
        sex: p.sex,
        TG: p.tg,
        Glucose: p.glucose,
        HDL: p.hdl,
        Waist: p.waist,
        TyG: p.tyg,
        risk: p.risk,
      })) as unknown[],
      "tyg-study-extract.csv"
    );
  };

  const handleClear = () => {
    if (confirm("Clear all data? This affects all steps.")) {
      setPatientData([]);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      const partials = parseCsvToPatients(text);
      const imported: PatientRow[] = partials
        .filter((p) => p.name != null || p.tg != null || p.glucose != null)
        .map((p) => {
          const tg = p.tg ?? 0;
          const glucose = p.glucose ?? 0;
          const tygVal = p.tyg ?? (tg > 0 && glucose > 0 ? Math.round(calcTyG(tg, glucose) * 100) / 100 : 0);
          const riskVal = p.risk === "High" || p.risk === "Moderate" ? p.risk : p.risk === "Normal" ? "Normal" : calcRisk(tygVal);
          return {
            id: p.id ?? crypto.randomUUID(),
            name: p.name ?? "Imported",
            age: p.age ?? 0,
            sex: p.sex ?? "M",
            tg,
            glucose,
            hdl: p.hdl ?? 0,
            waist: p.waist ?? 0,
            tyg: tygVal,
            risk: riskVal,
          };
        });
      if (imported.length === 0) {
        alert("No valid rows found in CSV. Expected columns: id, name, age, sex, tg, glucose, hdl, waist, tyg, risk.");
        return;
      }
      setPatientData((prev) => [...prev, ...imported]);
      alert(`Imported ${imported.length} patient(s) from CSV.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const EditableCell = ({
    rowIdx,
    field,
    value,
    type = "text",
  }: {
    rowIdx: number;
    field: keyof PatientRow;
    value: string | number;
    type?: "text" | "number";
  }) => {
    const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.col === field;
    const display = value === "" || value == null || (type === "number" && Number.isNaN(Number(value))) ? "" : value;

    return isEditing ? (
      <input
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          const v = type === "number" ? parseFloat(editValue) || 0 : editValue;
          updateRow(rowIdx, field, v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = type === "number" ? parseFloat(editValue) || 0 : editValue;
            updateRow(rowIdx, field, v);
          }
        }}
        className="w-full min-w-[60px] border px-2 py-1 text-sm"
        autoFocus
      />
    ) : (
      <button
        type="button"
        onClick={() => {
          setEditingCell({ rowIdx, col: field });
          setEditValue(String(display));
        }}
        className="w-full text-left px-1 py-0.5 hover:bg-indigo-50 rounded text-indigo-600 min-w-[60px]"
      >
        {display === "" ? "Click to edit" : display}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📄 Step 1: Extract PDFs (OCR)</h2>
        <button
          onClick={handleClear}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* PDF Upload */}
      <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center mb-6">
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFiles}
          className="hidden"
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium"
        >
          📁 Drag & Drop PDFs or Click to Select (OCR Enabled)
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Uses Tesseract OCR. If OCR fails, edit the table below directly.
        </p>
      </div>

      {/* Manual Entry - Add New Row */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">+ Add Patient (manual)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Patient Name *"
            value={manualValues.name}
            onChange={(e) => setManualValues({ ...manualValues, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Age"
            value={manualValues.age}
            onChange={(e) => setManualValues({ ...manualValues, age: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={manualValues.sex}
            onChange={(e) => setManualValues({ ...manualValues, sex: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
          <input
            type="number"
            placeholder="TG (mg/dL) *"
            value={manualValues.tg}
            onChange={(e) => setManualValues({ ...manualValues, tg: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Glucose *"
            value={manualValues.glucose}
            onChange={(e) => setManualValues({ ...manualValues, glucose: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="HDL"
            value={manualValues.hdl}
            onChange={(e) => setManualValues({ ...manualValues, hdl: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Waist (cm)"
            value={manualValues.waist}
            onChange={(e) => setManualValues({ ...manualValues, waist: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={handleAddManual}
          className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Add Patient
        </button>
      </div>

      {/* Progress */}
      {processing && (
        <div className="mb-6">
          <div className="bg-indigo-100 rounded-lg p-4">
            <p className="text-indigo-800">
              OCR Processing: {progress.current} / {progress.total}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Editable Table - Single source of truth for entire app */}
      <div>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-3">
          📌 <strong>Master table</strong> – Edit any cell when OCR fails. Data flows to Verify → Waist → Analyze.
        </p>
        {patientData.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <p className="text-green-600 font-medium">
                ✅ {patientData.length} patient(s)
              </p>
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                📥 Download CSV
              </button>
              <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer inline-block">
                📥 Import CSV Backup
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 w-full">Use Import CSV if data was lost after browser close.</p>
            </div>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Age</th>
                    <th className="p-2 border">Sex</th>
                    <th className="p-2 border">TG</th>
                    <th className="p-2 border">Glucose</th>
                    <th className="p-2 border">HDL</th>
                    <th className="p-2 border">Waist</th>
                    <th className="p-2 border">TyG</th>
                    <th className="p-2 border">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {patientData.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2 border">
                        <EditableCell rowIdx={i} field="name" value={p.name} />
                      </td>
                      <td className="p-2 border">
                        <EditableCell rowIdx={i} field="age" value={p.age} type="number" />
                      </td>
                      <td className="p-2 border">
                        <EditableCell rowIdx={i} field="sex" value={p.sex} />
                      </td>
                      <td className="p-2 border">
                        <EditableCell rowIdx={i} field="tg" value={p.tg} type="number" />
                      </td>
                      <td className="p-2 border">
                        <EditableCell rowIdx={i} field="glucose" value={p.glucose} type="number" />
                      </td>
                      <td className="p-2 border">
                        <EditableCell rowIdx={i} field="hdl" value={p.hdl} type="number" />
                      </td>
                      <td className="p-2 border">
                        <EditableCell rowIdx={i} field="waist" value={p.waist} type="number" />
                      </td>
                      <td className="p-2 border text-center">{p.tyg.toFixed(2)}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            p.risk === "High"
                              ? "bg-red-100 text-red-700"
                              : p.risk === "Moderate"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {p.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm py-4">
            No patients yet. Upload PDFs or add manually above.
          </p>
        )}
      </div>
    </div>
  );
}
