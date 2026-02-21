# Paper 1 / Paper 2 Verification Checklist

Use this to confirm read-only vs active separation and shared data behavior.

---

## PAPER 1 (Published – READ-ONLY)

| Check | How to verify |
|-------|----------------|
| [ ] Go to /published page | Open `/published` or click **Paper 1: Published** in nav |
| [ ] See publication details (title, journal, DOI) | Title, J Contemp Clin Pract 2025;11(8):349-357, DOI shown |
| [ ] DOI link opens in new tab | Click DOI → opens `https://doi.org/10.61336/jccp/25-08-50` in new tab |
| [ ] NO "Edit" buttons visible | Page has no Edit/Save/Cancel controls |
| [ ] NO "Export" buttons visible | No Word/PDF/CSV export on this page |
| [ ] NO manuscript regeneration option | No regenerate or data-driven manuscript |
| [ ] Clear "Read-Only" notice displayed | Amber "Read-Only" badge next to "Paper 1: Published" |

**Implementation:** `app/published/page.tsx`, `components/published/*`. No binding to patient data; static content only.

---

## PAPER 2 (In Progress – ACTIVE)

| Check | How to verify |
|-------|----------------|
| [ ] Go to /#write (Tab 5) | Open `/research#write` or click **Paper 2: Write** in PaperNav → Tab 5 opens |
| [ ] See "Paper 2: TyG-HbA1c" header | Blue header at top of Step 5 with 🧪 and "Paper 2: TyG-HbA1c Manuscript Generator" |
| [ ] Manuscript sections editable inline | Click "Edit" on Title, Abstract, etc. → edit → Save/Cancel |
| [ ] "Export Word" button works | Export Word → downloads .docx with figures |
| [ ] HbA1c-specific stats calculated | "Paper 2: Word" shows n with TyG+HbA1c; export uses mean HbA1c, % ≥7, TyG–HbA1c r, P |
| [ ] Figures generate correctly | Figures Preview shows 3 charts; Export All Figures / Word embed them |

**Implementation:** `components/tabs/Tab5JCDR.tsx`, `lib/utils/hba1c-manuscript.ts`. Hash `#write` handled in `app/HomeTabs.tsx`.

---

## SHARED DATA

| Check | How to verify |
|-------|----------------|
| [ ] 60 patients visible in Tab 1 table | Extract/Verify: table shows all loaded patients (e.g. 60) |
| [ ] Adding HbA1c values updates Paper 2 analysis | When patient data includes `hba1c`, Paper 2: Word n and manuscript update (HbA1c in `lib/types/patient.ts`) |
| [ ] Paper 1 display unchanged | /published still shows static JCCP 2025 content; no patient data |
| [ ] No cross-contamination between papers | Paper 1 never uses live patient data; Paper 2 uses `filterPatientsWithTyGAndHbA1c(patientData)` only |

---

*Paper 1 (published) unchanged. Paper 2 and shared flow verified.*
