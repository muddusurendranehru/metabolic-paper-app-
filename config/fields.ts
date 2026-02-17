/**
 * Field definitions for patient data - add/extend fields here
 */

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export const PATIENT_FIELDS: FieldDef[] = [
  { key: "name", label: "Patient Name", type: "text", required: true },
  { key: "age", label: "Age", type: "number", min: 0, max: 120 },
  {
    key: "sex",
    label: "Sex",
    type: "select",
    options: [
      { value: "M", label: "Male" },
      { value: "F", label: "Female" },
    ],
  },
  { key: "tg", label: "TG (mg/dL)", type: "number", required: true },
  { key: "glucose", label: "Glucose (mg/dL)", type: "number", required: true },
  { key: "hdl", label: "HDL (mg/dL)", type: "number" },
  { key: "waist", label: "Waist (cm)", type: "number" },
  { key: "hba1c", label: "HbA1c %", type: "number" },
];
