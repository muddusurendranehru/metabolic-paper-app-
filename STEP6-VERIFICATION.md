# Step 6: Journal Submission – Verification Checklist

Use this when testing locally (`npm run dev` → open `/step6`). No code changes required; this confirms implementation.

| # | Check | Where to verify |
|---|--------|------------------|
| 1 | **Step 6 in navigation** | Home page nav bar: link "📤 Step 6: Journal Submission" → `/step6` |
| 2 | **Paper selector: 3 papers** | Section "1. Select Paper": Paper 1 (Published), Paper 2 (Submitted), Paper 3 (Active) |
| 3 | **Journal dropdown: 5 templates** | Section "2. Select Journal Template": JCDR, IJCR, IJEM, DMS, Generic |
| 4 | **Quality checklist updates after generation** | Section "3. Quality Checklist": initially gray ⬜; after "Generate Submission Package" → ✅/❌ per item |
| 5 | **"Generate Submission Package" button works** | Section 4: click (with Paper 2 or 3 + any journal) → downloads start, alert on success |
| 6 | **Downloads: Manuscript.docx + Cover_Letter.txt** | After generate: `{JOURNAL}_Manuscript.docx` and `{JOURNAL}_Cover_Letter.txt` (e.g. IJCR_Manuscript.docx, IJCR_Cover_Letter.txt) |
| 7 | **Word doc: formatting (font, spacing, tables)** | Open .docx: IMRAD sections, paragraphs, tables (or "[Table data not available]" if no rows) |
| 8 | **Cover letter: all required sections** | Open .txt: To Editor, Date, STUDY OVERVIEW, KEY FINDINGS, NOVELTY, ETHICAL COMPLIANCE, MANUSCRIPT DETAILS, DECLARATIONS, CORRESPONDING AUTHOR |
| 9 | **Paper 1 (Published): warning, cannot resubmit** | Select Paper 1 → yellow warning "already published"; button disabled, text "🔒 Paper Already Published (Cannot Resubmit)" |
| 10 | **All checks pass → green success** | After generate with Paper 2 or 3: if checklist all ✅ → green box "✅ All quality checks passed! Ready for submission." |

**Quick test:** Select Paper 3 → IJCR → Generate → confirm both files download and checklist updates; then select Paper 1 and confirm button is disabled and warning shows.
