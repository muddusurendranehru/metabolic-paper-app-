/**
 * Admin / collaboration: validation schema for author details.
 * No patient data. Author metadata only. Isolated from steps 1–12.
 */

/** Full author details for manuscript submission and certification. */
export interface AuthorDetails {
  fullName: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  degree: "MBBS" | "MD" | "DM" | "PhD" | "Other";
  experienceYears: number;
  designation: string;
  clinicHospital: string;
  institution?: string;
  department: string;
  cityState: string;
  email: string;
  phone: string;
  orcid?: string;
  /** Medical council registration number (e.g. MCI/State council number). */
  medicalRegistrationNumber?: string;
  /** Year of registration. */
  registrationYear?: number;
  /** State/region of registration (e.g. Telangana, Maharashtra). */
  registrationState?: string;
  icmjeCompliance: boolean;
  conflictOfInterest: "None" | "Specify";
  privacyConsent: boolean;
  paymentAck: boolean;
  submittedAt: string;
}

export interface AuthorSubmission {
  name: string;
  email: string;
  specialty?: string;
  institution?: string;
  phone?: string;
  /** Medical council registration number (e.g. MCI/State council). */
  medicalRegistrationNumber?: string;
  /** Year of registration. */
  registrationYear?: number;
  /** State/region of registration (e.g. Telangana, Maharashtra). */
  registrationState?: string;
  icmjeAcknowledged?: boolean;
  consentGiven?: boolean;
  submittedAt?: string;
}

export function validateAuthorSubmission(data: unknown): { ok: true; data: AuthorSubmission } | { ok: false; error: string } {
  if (data == null || typeof data !== "object") {
    return { ok: false, error: "Invalid submission" };
  }
  const o = data as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const email = typeof o.email === "string" ? o.email.trim() : "";
  if (!name || !email) {
    return { ok: false, error: "Name and email are required" };
  }
  const regYear = o.registrationYear != null ? Number(o.registrationYear) : undefined;
  return {
    ok: true,
    data: {
      name,
      email,
      specialty: typeof o.specialty === "string" ? o.specialty.trim() : undefined,
      institution: typeof o.institution === "string" ? o.institution.trim() : undefined,
      phone: typeof o.phone === "string" ? o.phone.trim() : undefined,
      medicalRegistrationNumber: typeof o.medicalRegistrationNumber === "string" ? o.medicalRegistrationNumber.trim() || undefined : undefined,
      registrationYear: regYear != null && Number.isFinite(regYear) ? regYear : undefined,
      registrationState: typeof o.registrationState === "string" ? o.registrationState.trim() || undefined : undefined,
      icmjeAcknowledged: o.icmjeAcknowledged === true,
      consentGiven: o.consentGiven === true,
      submittedAt: typeof o.submittedAt === "string" ? o.submittedAt : new Date().toISOString(),
    },
  };
}

const DEGREES: AuthorDetails["degree"][] = ["MBBS", "MD", "DM", "PhD", "Other"];
const SEX_OPTIONS: AuthorDetails["sex"][] = ["Male", "Female", "Other"];
const CONFLICT_OPTIONS: AuthorDetails["conflictOfInterest"][] = ["None", "Specify"];

export function validateAuthorDetails(data: unknown): { ok: true; data: AuthorDetails } | { ok: false; error: string } {
  if (data == null || typeof data !== "object") {
    return { ok: false, error: "Invalid submission" };
  }
  const o = data as Record<string, unknown>;
  const fullName = typeof o.fullName === "string" ? o.fullName.trim() : "";
  const email = typeof o.email === "string" ? o.email.trim() : "";
  const phone = typeof o.phone === "string" ? o.phone.trim() : "";
  const designation = typeof o.designation === "string" ? o.designation.trim() : "";
  const clinicHospital = typeof o.clinicHospital === "string" ? o.clinicHospital.trim() : "";
  const department = typeof o.department === "string" ? o.department.trim() : "";
  const cityState = typeof o.cityState === "string" ? o.cityState.trim() : "";
  const age = typeof o.age === "number" ? o.age : Number(o.age);
  const experienceYears = typeof o.experienceYears === "number" ? o.experienceYears : Number(o.experienceYears);
  const sex = typeof o.sex === "string" && SEX_OPTIONS.includes(o.sex as AuthorDetails["sex"]) ? (o.sex as AuthorDetails["sex"]) : undefined;
  const degree = typeof o.degree === "string" && DEGREES.includes(o.degree as AuthorDetails["degree"]) ? (o.degree as AuthorDetails["degree"]) : undefined;
  const conflictOfInterest = typeof o.conflictOfInterest === "string" && CONFLICT_OPTIONS.includes(o.conflictOfInterest as AuthorDetails["conflictOfInterest"]) ? (o.conflictOfInterest as AuthorDetails["conflictOfInterest"]) : undefined;

  if (!fullName || !email || !phone) return { ok: false, error: "fullName, email, and phone are required" };
  if (!Number.isFinite(age) || age < 18 || age > 120) return { ok: false, error: "Valid age (18–120) required" };
  if (!Number.isFinite(experienceYears) || experienceYears < 0) return { ok: false, error: "Valid experienceYears required" };
  if (!sex) return { ok: false, error: "sex must be Male, Female, or Other" };
  if (!degree) return { ok: false, error: "degree must be MBBS, MD, DM, PhD, or Other" };
  if (!designation || !clinicHospital || !department || !cityState) return { ok: false, error: "designation, clinicHospital, department, cityState required" };
  if (o.icmjeCompliance !== true) return { ok: false, error: "ICMJE compliance must be acknowledged" };
  if (o.privacyConsent !== true) return { ok: false, error: "Privacy consent required" };
  if (o.paymentAck !== true) return { ok: false, error: "Payment acknowledgment required" };
  if (!conflictOfInterest) return { ok: false, error: "conflictOfInterest must be None or Specify" };

  return {
    ok: true,
    data: {
      fullName,
      age: age as number,
      sex,
      degree,
      experienceYears: experienceYears as number,
      designation,
      clinicHospital,
      institution: typeof o.institution === "string" ? o.institution.trim() || undefined : undefined,
      department,
      cityState,
      email,
      phone,
      orcid: typeof o.orcid === "string" ? o.orcid.trim() || undefined : undefined,
      medicalRegistrationNumber: typeof o.medicalRegistrationNumber === "string" ? o.medicalRegistrationNumber.trim() || undefined : undefined,
      registrationYear: typeof o.registrationYear === "number" ? o.registrationYear : (Number(o.registrationYear) || undefined),
      registrationState: typeof o.registrationState === "string" ? o.registrationState.trim() || undefined : undefined,
      icmjeCompliance: true,
      conflictOfInterest,
      privacyConsent: true,
      paymentAck: true,
      submittedAt: typeof o.submittedAt === "string" ? o.submittedAt : new Date().toISOString(),
    },
  };
}
