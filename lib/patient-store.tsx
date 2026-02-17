"use client";

import * as React from "react";
import type { PatientRow } from "@/lib/tyg";
import { createPatient } from "@/lib/tyg";

const STORAGE_KEY = "tyg-patients";

function loadFromStorage(): PatientRow[] {
  if (typeof window === "undefined") return getDefaultPatients();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PatientRow[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return getDefaultPatients();
}

function getDefaultPatients(): PatientRow[] {
  return [
    createPatient("1", "Damodhar Reddy", 74, "M", 66, 125, 47, 102),
    createPatient("2", "Duggi Reddy", 58, "M", 321, 246, 42, 98),
  ];
}

type PatientContextValue = {
  patients: PatientRow[];
  setPatients: (p: PatientRow[] | ((prev: PatientRow[]) => PatientRow[])) => void;
};

const PatientContext = React.createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatientsState] = React.useState<PatientRow[]>(getDefaultPatients);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    const stored = loadFromStorage();
    if (stored.length > 0) setPatientsState(stored);
    mountedRef.current = true;
  }, []);

  React.useEffect(() => {
    if (!mountedRef.current) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  const setPatients = React.useCallback(
    (arg: PatientRow[] | ((prev: PatientRow[]) => PatientRow[])) => {
      setPatientsState(typeof arg === "function" ? arg : () => arg);
    },
    []
  );

  return (
    <PatientContext.Provider value={{ patients, setPatients }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const ctx = React.useContext(PatientContext);
  if (!ctx) throw new Error("usePatients must be used within PatientProvider");
  return ctx;
}
