# Metabolism Paper App – 13 Steps: What We Achieved (Brief)

**Metabolic Paper App** is a TyG index research dashboard and content pipeline for HOMA Clinic (Dr. Muddu Surendra Nehru, MD). It supports three papers and 13 steps from data extraction to publication and outreach.

---

## The 13 Steps (Brief)

| Step | What it does |
|------|----------------|
| **1–5** | **Core TyG pipeline:** Extract (PDF/OCR/LLM) → Verify → Edit Waist → Analyze → Write JCDR manuscript. |
| **6** | Journal submission (format and submit). |
| **7** | Quality assurance (grammar, plagiarism, formatting). |
| **8** | Social content from manuscript (Twitter, LinkedIn, infographic). |
| **9** | MCQs and Gamma slides for education. |
| **10** | (As per app routes.) |
| **11** | Content amplification (blog, YouTube, social templates). |
| **12** | **Neutral medical content:** topic + source → blog/Twitter/handout/SEO; **PubMed (MCT)** and **Nutrition Bot** for evidence-based and food content; multi-language; batch. |
| **13** | Admin / collaboration (as per app routes). |

Supporting flows: **Published** (Paper 1), **Submitted** (Paper 2), **Content Ops** (batch, queue, Sheet sync), **Admin – Collaboration**.

---

## What We Achieved

- **Papers 1 & 2:** Steps 1–6 are proven in production (Paper 1 published, Paper 2 submitted). No changes to these steps when adding Step 12 or parser fixes.
- **Single pipeline:** Extract → Verify → Waist → Analyze → Write JCDR runs end-to-end with patient data in sessionStorage and one JCDR manuscript output.
- **Step 12 (additive only):**
  - **Topic routing:** Food (ghee, jackfruit, poha, etc.) → Nutrition Bot / food-facts; clinical (TyG, HbA1c) → guideline-aware; general → universal. One generator per request; metadata derived from the single blog output.
  - **PubMed (MCT):** Optional block below Topic; fetches trials, honest “no studies found” when none; oil/fat topics get improved query; website link in all outputs.
  - **Nutrition Bot:** JSON or plain-text/emoji input; parser with emoji-aware fields, smart pairing tips (no redundant “pair with protein” for whey), and context-aware Indian context (supplements vs traditional foods).
  - **SEO:** `generateMetaTitle`, `generateMetaDescription`, `generateSchemaOrg`; front matter stripped so meta uses real body text; no placeholders or “#” in metadata.
- **Isolation:** Step 12 and content-ops do not import from `app/research/steps/step-1`–`step-6` and do not use patient data. Removing Step 12 leaves Steps 1–6 and the rest of the app unchanged.
- **Content ops:** Batch topic upload, Nutrition Bot API + fallback, optional Google Sheet sync and tracking.
- **Tech:** Next.js 16, React 19, TypeScript, Tailwind; OpenAI for extraction/translation/guidelines; public PubMed API; document stack (PDF, Word, CSV, export).

---

## In One Line

**We achieved a full metabolism paper pipeline (13 steps): extract → verify → analyze → write → submit → QA → social → education → amplification → neutral content (Step 12 with PubMed + Nutrition Bot) → admin, with Papers 1 & 2 live and Step 12 safe and isolated.**
