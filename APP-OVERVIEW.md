# Metabolic Paper App – Total Overview

**Metabolic Paper App** (also called *TyG Index Research Study* in the UI) is a full-stack research and content pipeline for **HOMA Clinic** (Dr. Muddu Surendra Nehru, MD, Professor of Medicine). It supports **three papers** and **13 steps** from patient data extraction and verification through manuscript writing, journal submission, quality checks, social/education content, and neutral medical content generation—all in one app.

---

## What the app does (in one line)

**Extract lab data from PDFs → verify and edit → analyze TyG/metabolic indices → write JCDR manuscript → export CSV/Word/PDF → submit to journal → QA → social/education content → topic-based neutral content (Step 12 with PubMed + Nutrition Bot) → admin and collaboration.**

---

## Who it’s for

- **Primary:** Dr. Muddu Surendra Nehru / HOMA Clinic (TyG index research, diabetes/metabolic papers, JCDR submissions).
- **Use case:** Collect patient data from PDF lab reports, compute TyG and related indices, generate a journal-ready manuscript (JCDR format), export data, and create outreach content (blogs, Twitter, handouts) from topics—without mixing research data with general content.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn-ui, Lucide icons |
| **Charts / tables** | Chart.js, react-chartjs-2, @tanstack/react-table |
| **Documents** | pdfjs-dist, pdf-parse, tesseract.js (OCR), docx, jspdf, xlsx, papaparse |
| **AI / APIs** | OpenAI (optional LLM extraction, translation, guidelines), public PubMed API |
| **Dev / run** | `npm run dev` (port **3030**), `npm run build` / `npm start` |

Optional: `.env` with `OPENAI_API_KEY` for LLM-based PDF extraction and translation.

---

## Main workflow: 5 tabs (Paper 3)

The **Research** page (`/research`) hosts the core pipeline as **5 tabs**:

| Tab | Purpose |
|-----|--------|
| **1. Extract PDFs** | Upload PDF lab reports; extract text via PDF parser or OCR; optional “Extract with LLM” using OpenAI. Data flows into the next steps. |
| **2. Verify** | Review and correct extracted patient/lab fields before analysis. |
| **3. Edit Waist** | Edit waist circumference (and related) for each patient. |
| **4. Analyze** | View TyG index and other metabolic metrics; charts and summaries. |
| **5. Write JCDR** | Generate full JCDR-format manuscript from current patient set; export **CSV**, **Word**, **PDF**. |

Patient data is kept in **sessionStorage** (and app state) during the session. **CSV export** is the durable backup; no database required for the core pipeline.

---

## The 13 steps (full pipeline)

| Step | Name / route | What it does |
|------|------------------|--------------|
| **1–5** | Research tabs | **Core TyG pipeline:** Extract → Verify → Edit Waist → Analyze → Write JCDR. |
| **6** | Step 6: Journal Submission (`/step6`) | Format and submit manuscript to journal. |
| **7** | Step 7: Quality (`/step7`) | QA: grammar, plagiarism, formatting. |
| **8** | Step 8: Social (`/step8`) | Social content from manuscript (e.g. Twitter, LinkedIn, infographic). |
| **9** | Step 9: Education (`/step9`) | MCQs, Gamma slides for teaching. |
| **10** | (per app routes) | As defined in app. |
| **11** | Step 11 (`/step11`, research/steps/step-11) | Content amplification: blog, YouTube, social templates. |
| **12** | Step 12: Neutral Content (`/step12`) | **Topic-only content:** one topic → one generator. Food/supplement → simple nutrition template; clinical (TyG, HbA1c, etc.) → PubMed (MCT); else → neutral “Evidence Overview.” Blog, Twitter, handout, SEO; multi-language (EN, HI, TE, TA); batch topics; Nutrition Bot JSON/plain text; **no patient data.** |
| **13** | Step 13: Admin (`/step13`) | Admin and collaboration (e.g. collaboration submissions). |

Supporting pages: **Published** (Paper 1), **Submitted** (Paper 2), **Content Ops**, **Analyze** (standalone), **Export**.

---

## Three papers (concept)

- **Paper 1: Published** – Done; link from home.
- **Paper 2: Submitted** – In submission; link from home.
- **Paper 3: Generate Manuscript** – Active workspace: the 5-tab flow (Extract → … → Write JCDR) on `/research` and related steps.

---

## Step 12 in detail (neutral medical content)

Step 12 is **topic-agnostic** and **isolated**: it does not import from research steps 1–6 and does not use patient data.

- **Input:** Topic (e.g. “ghee diabetes”, “TyG index diabetes”), optional Nutrition Bot JSON or plain text, language (EN/HI/TE/TA), audience, formats (blog, Twitter, handout, SEO, etc.).
- **Routing (one path per request):**  
  - **Food/supplement** (e.g. almond, ghee, papaya, poha, mango, turmeric) → **simple food template** (generic nutrition table, portion guidance “consult dietitian for [topic]”, pairing tips).  
  - **Clinical** (TyG, HbA1c, HOMA, index, marker, correlation) → **PubMed (MCT)** only.  
  - **Other** → **simple neutral** “Evidence Overview” template.
- **Features:** Title-case topic cleaning; optional **MCT block** (PubMed trials, limitations, neutral summary); Nutrition Bot parsing (JSON or plain/emoji); batch topics (one per line); SEO meta title/description/schema; Telugu translation; link to HOMA site in outputs.

---

## APIs (overview)

| API | Purpose |
|-----|--------|
| `POST /api/upload-pdf` | Upload PDF. |
| `POST /api/extract-pdf` | Extract text from PDF. |
| `POST /api/ocr` | OCR (e.g. Tesseract) for PDF/images. |
| `POST /api/llm-extract` | Optional LLM extraction (OpenAI). |
| `POST /api/analyze` | Analyze (e.g. TyG) on submitted data. |
| `POST /api/step12/generate-blog` | Step 12 blog: single-routing (food/clinical/neutral). |
| `POST /api/step12/mct` | Step 12 MCT/PubMed content. |
| `POST /api/step12/batch-nutrition` | Step 12 batch nutrition topics. |
| `POST /api/step12/from-nutrition-bot` | Step 12 from Nutrition Bot JSON/text. |
| `POST /api/translate` | Translation (e.g. for Step 12). |
| `GET/POST /api/patients` | Patient data (as used by app). |
| `POST /api/collaboration/submit` | Collaboration submission. |
| `GET /api/collaboration/submissions` | List collaboration submissions. |

---

## Data and export

- **Runtime:** Patient/list data in **sessionStorage** and React state during the session.
- **Backup:** **CSV export** from the Write JCDR tab (and any other export points) is the main durable backup.
- **Documents:** Export to **Word** (docx), **PDF** (jspdf), **Excel** (xlsx) as implemented in the app.
- **No DB required** for the core Extract → Verify → Analyze → Write JCDR flow.

---

## Running the app

```bash
# Install
npm install

# Dev (port 3030)
npm run dev
# → http://localhost:3030

# Production build and run
npm run build
npm start
```

Optional: copy `.env.example` to `.env` and set `OPENAI_API_KEY` for LLM extraction and translation.

---

## Important design rules

- **Don’t break the core:** The 5-tab pipeline (Extract → Verify → Waist → Analyze → Write JCDR) and CSV/Word/PDF export are production-proven; changes must be additive or clearly scoped.
- **Step 12 isolation:** Step 12 and content-ops do not depend on `app/research/steps/step-1`–`step-6` or patient data. Removing or disabling Step 12 must not break Steps 1–6.
- **One generator per topic:** For Step 12, each topic uses exactly one path (food template, clinical/PubMed, or neutral); no merged or dual-generator output.

---

## Repo and deploy

- **Repo:** `metabolic-paper-app` (e.g. GitHub: muddusurendranehru/metabolic-paper-app-).
- **Deploy:** Configure as needed (e.g. Vercel, Render, or Node host); ensure port and env (e.g. `OPENAI_API_KEY`) are set.

---

*Last updated: March 2026*
