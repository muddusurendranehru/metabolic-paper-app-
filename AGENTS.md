# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **Next.js 16 (App Router)** clinical research dashboard for TyG (Triglyceride-Glucose) Index analysis. It is a single self-contained application — no external database, no Docker, no separate backend. Patient data is stored in-memory (server) and `sessionStorage` (browser).

### Running the app

- **Dev server**: `npm run dev` — starts on **port 3030** (configured in `package.json`)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint 9; pre-existing warnings/errors exist in the codebase)

### Key caveats

- **No database required**: All patient data is in-memory / `sessionStorage`. No Postgres, Redis, or other external services needed.
- **`OPENAI_API_KEY`** is optional: Only needed for the LLM-based PDF extraction fallback. OCR and manual data entry work without it.
- **`pdf-parse` bundling**: `next.config.ts` lists `pdf-parse` under `serverExternalPackages` to prevent Next.js from breaking its internal `require()`. If PDF upload returns 500, check this config.
- **Lint has pre-existing errors**: 12 errors + 15 warnings from `react-hooks/set-state-in-effect`, `react-hooks/static-components`, `prefer-const`, and unused variables. These are in the existing code and do not block the build.
- **No automated test suite**: The project has no `jest`, `vitest`, or other test runner configured. Testing is manual via the browser.
- **Three research papers**: Paper 1 and Paper 2 are read-only (published/submitted). Only Paper 3 (TyG-HbA1c) is active for development. See `.cursorrules` for the golden rule.

### Project structure (key paths)

- `app/page.tsx` — Home page (renders `HomeContent`)
- `app/api/patients/route.ts` — In-memory patients CRUD API
- `app/api/upload-pdf/route.ts` — PDF upload + OCR extraction
- `components/TabExtract.tsx` — Patient data entry + PDF extract tab
- `components/tabs/Tab5JCDR.tsx` — Manuscript generation (Paper 3)
- `lib/types/patient.ts` — Patient type definitions
- `lib/utils/stats-calculator.ts` — TyG/statistical calculations
