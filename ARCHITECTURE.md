# Total Architecture of the App

**Metabolic Paper App** – TyG index research dashboard, manuscript pipeline, and neutral content generation (Step 12) for HOMA Clinic.

---

## 1. Tech Stack

| Layer        | Technology |
|-------------|------------|
| Framework   | **Next.js 16** (App Router) |
| Language    | **TypeScript** |
| UI          | **React 19**, **Tailwind CSS 4**, **shadcn-ui**, **lucide-react** |
| Charts      | **Chart.js**, **react-chartjs-2** |
| Documents   | **mammoth** (Word), **pdf-parse** / **pdfjs-dist** / **tesseract.js** (PDF/OCR), **docx**, **jspdf**, **html2canvas**, **xlsx**, **papaparse** |
| AI / LLM    | **OpenAI** (extraction, translation, content generation) |
| External    | Public **PubMed** API (Step 12 MCT evidence) |

---

## 2. High-Level Structure

```
metabolic-paper-app-
├── app/                    # Next.js App Router (pages + API)
├── components/             # React UI components
├── lib/                    # Shared logic, utils, store, types
├── public/                 # Static assets
└── ARCHITECTURE.md         # This file
```

- **app/** – Routes (pages), API routes (`app/api/...`), and route-specific modules (e.g. `app/research/steps/step-*`, `app/content-ops`).
- **components/** – Reusable and feature-specific components (tabs, step UIs, layout, content-ops, step12, admin).
- **lib/** – Stateless utilities, store (patient state), types; **no** imports from `app/research/steps/step-1`–`step-6` in Step 12 code.

---

## 3. Routes (Pages)

| Route | Purpose |
|-------|--------|
| `/` | Home: nav links (Paper 1/2/3, Step 6, Step 12) + **HomeTabs** (Extract → Verify → Waist → Analyze → Write JCDR) |
| `/research` | Same as home; **Paper 2** “active workspace” – full TyG workflow via **HomeTabs** |
| `/published` | Paper 1: published paper view |
| `/submitted` | Paper 2: submitted paper view |
| `/research/steps/step-1` … `step-11` | Manuscript pipeline steps (do not modify for Step 12) |
| `/step6`, `/step7`, … `/step13` | Shortcuts to steps / standalone tools |
| `/step12` | **Step 12: Neutral Content** – ContentGenerator (blog, Twitter, handout, MCT/PubMed, Nutrition Bot, batch) |
| `/content-ops` | Content ops: queue, batch uploader, Google Sheet sync, social tracker |
| `/admin/collaboration` | Collaboration submissions admin |
| `/analyze` | Analyze view |
| `/export` | Export view |
| `/paper/[id]` | Dynamic paper page by id |

**Layout:** Root `app/layout.tsx` wraps all pages with **Header**, **PaperNav**, **Footer**, and **PatientProvider** (patient state).

---

## 4. Data Flow & State

- **Patient data (TyG workflow):**
  - **PatientProvider** (`lib/patient-store.tsx`): React context holding `patients` (e.g. `PatientRow[]`) and `setPatients`.
  - Persisted in **sessionStorage** (`tyg-patients`).
  - Used by **HomeTabs** and tabs: **TabExtract**, **TabVerify**, **TabWaist**, **TabAnalyze**, **Tab5JCDR** (Write JCDR).

- **Step 12:** No patient data. Uses only topic, source text, language, formats, and optional MCT/Nutrition Bot; state is local to **ContentGenerator** (and API request/response).

- **Content ops:** Queue and batch state in components; optional Google Sheet sync and export utilities in `lib/utils/content-ops/`.

---

## 5. API Routes

| Method | Path | Purpose |
|--------|------|--------|
| POST | `/api/llm-extract` | LLM-based extraction (e.g. from pasted text) |
| POST | `/api/ocr` | OCR (e.g. Tesseract) |
| POST | `/api/upload-pdf` | PDF upload handling |
| POST | `/api/extract-pdf` | Extract text from PDF |
| GET/POST | `/api/patients` | Patient list (if used) |
| POST | `/api/analyze` | Analysis (e.g. TyG/stats) |
| POST | `/api/translate` | Translation |
| POST | `/api/collaboration/submit` | Submit collaboration form |
| GET | `/api/collaboration/submissions` | List collaboration submissions |
| POST | `/api/step12/generate-blog` | Step 12: generate blog (and related) content |
| POST | `/api/step12/from-nutrition-bot` | Step 12: content from Nutrition Bot JSON/text |
| POST | `/api/step12/batch-nutrition` | Step 12: batch nutrition topics (with optional Nutrition Bot) |
| GET/POST | `/api/step12/mct` | Step 12: MCT/PubMed evidence content |

---

## 6. Main Feature Areas

### 6.1 TyG Research Pipeline (Paper 2 – do not break)

- **Tabs (in order):** Extract PDFs → Verify → Edit Waist → Analyze → Write JCDR.
- **TabExtract:** PDF upload / paste; calls OCR, upload-pdf, llm-extract; fills patient state.
- **TabVerify:** Verification table and field editing (e.g. **TabVerify**, **FieldEditor**, **VerificationTable**).
- **TabWaist:** Waist editing.
- **TabAnalyze:** Charts and stats (TyG, etc.).
- **Tab5JCDR:** Write JCDR manuscript from verified patient data; uses **Tab5JCDR** and journal/formatter logic.

### 6.2 Step 12 – Neutral Content (additive only)

- **Entry:** `/step12` → **Step12Tool** / **ContentGenerator**.
- **Flow:** Topic → optional **PubMed Evidence (MCT)** block (below topic) → Source (upload/paste/from scratch) → Language → Target formats → Generate.
- **MCT:** `lib/utils/step12/mct-pubmed-agent.ts` (PubMed ESearch/ESummary, `buildFoodOilQuery` for oil/fat topics), `mct-content-generator.ts` (build blog/twitter/handout/instagram), fallback when no studies; content is honest (“No studies found” when applicable).
- **Nutrition Bot:** `lib/utils/step12/nutrition-bot-client.ts`, `nutrition-text-parser.ts`, `nutrition-bot-content.ts`; APIs: `from-nutrition-bot`, `batch-nutrition`.
- **Blog/SEO/other formats:** `lib/utils/step12/blog-with-translate.ts`, `step12-generator.ts`, format-specific generators under `components/step12/generators/`.
- **Rule:** Step 12 must not import from `app/research/steps/step-1`–`step-6`; no patient data.

### 6.3 Content Ops

- **Pages:** `app/content-ops/page.tsx` (and related).
- **Components:** ContentQueue, BatchUploader, SheetSync, TopicCard, StatusBadge, BatchProgress.
- **Lib:** `lib/utils/content-ops/` (batch generator, export formats, Google Sheet sync, parse-batch, etc.).

### 6.4 Admin & Collaboration

- **Admin:** `app/admin/collaboration/page.tsx` – **CollaborationAdmin**, **AuthorTable**, **CollaborationForm**, **ShareFormLinks**.
- **API:** `collaboration/submit`, `collaboration/submissions`.
- **Lib:** `lib/utils/collaboration-email.ts`, `lib/utils/admin/author-schema.ts`.

### 6.5 Export & Publishing

- **Export:** `lib/utils/pdf-export.ts`, `word-export.ts`, `docx-export.ts`, `csv-export.ts`; **ExportButton**, **ChartContainer**.
- **Published/Submitted:** `app/published`, `app/submitted`; **Paper1View**, **PublicationBadge**, **DOILink**.

---

## 7. Lib Structure (concise)

- **lib/patient-store.tsx** – Patient context and sessionStorage persistence.
- **lib/store/patient-store.ts** – Re-exports for patient store.
- **lib/tyg.ts**, **lib/tyg-calculator.ts**, **lib/stats-calculator.ts** – TyG and stats.
- **lib/utils/** – PDF/Word parsing, LLM extract, anonymize, age-parser, manuscript templates (e.g. ijcpr-manuscript, hba1c-manuscript), cover-letter, collaboration-email, risk-assessor, chart-svg, csv, etc.
- **lib/utils/step12/** – Step 12 only: MCT (mct-pubmed-agent, mct-content-generator, mct-agent), Nutrition Bot, food-facts, blog-with-translate, link-injector, step12-config, step12-types, content formatters, SEO, translations, index re-exports.
- **lib/utils/content-ops/** – Batch, export formats, Google Sheet sync, parse-batch, social-tracker.
- **lib/types/** – e.g. patient types.

---

## 8. Conventions

- **Don’t destroy success:** Do not change behavior of `app/research/steps/step-1`–`step-6` or the core TyG tabs when adding features.
- **Step 12:** Additive and isolated; no dependencies on steps 1–6 or patient data.
- **Backend-first:** APIs and lib must work (insert/fetch, PubMed, etc.) before relying on them in the UI.
- **Honest output:** When no PubMed results, Step 12 text states “No studies found” and labels the rest as general guidance only.

---

## 9. Quick Reference

| Want to… | Look at |
|----------|--------|
| Change home / research tabs | `app/page.tsx`, `app/HomeTabs.tsx`, `components/layout/TabNavigation.tsx` |
| Change patient state | `lib/patient-store.tsx`, `lib/store/patient-store.ts` |
| Add or change Step 12 content | `app/step12/`, `components/step12/ContentGenerator.tsx`, `lib/utils/step12/*` |
| Change MCT/PubMed behavior | `lib/utils/step12/mct-pubmed-agent.ts`, `mct-content-generator.ts` |
| Add an API | `app/api/<name>/route.ts` |
| Change layout/header/footer | `app/layout.tsx`, `components/layout/Header.tsx`, `PaperNav.tsx`, `Footer.tsx` |
