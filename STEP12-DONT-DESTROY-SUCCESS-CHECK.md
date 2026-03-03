# Step 12 – Don’t Destroy Success Check

**Date:** Run after any Step 12 or research-steps changes.

---

## 1. Steps 1–6 untouched

**Check:** Zero imports from `app/research/steps/step-1` through `step-6` anywhere in the repo.

**Result:** ✅ **PASS**  
- No imports from `step-1` … `step-6` found in codebase.

---

## 2. Step 12 isolated

**Check:** New Step 12 logic only in `components/step12/`, `lib/utils/step12/`, and `app/step12/`. No research steps import Step 12.

**Result:** ✅ **PASS**  
- All Step 12 code imports only from `@/lib/utils/step12` or `@/components/step12`.
- `app/step12/page.tsx` imports only `ContentGenerator` from `components/step12`.
- No files under `app/research/` import Step 12 or `/step12`.

---

## 3. No patientData

**Check:** Step 12 uses only user-provided text/topic (metadata only). No `patientData` or research metrics.

**Result:** ✅ **PASS**  
- No use of `patientData` in `components/step12/` or `lib/utils/step12/`.
- `ContentGenerator.tsx` has a runtime assert: `!(window as any).patientData` (guard, not usage).
- Comments in generators explicitly state “No patientData.”

---

## 4. Topic-agnostic

**Check:** Works for TyG, HbA1c, Ghee, Jackfruit, dopamine, or any topic. No hardcoded research metrics in generators.

**Result:** ✅ **PASS** (with one optional note)  
- **Generators** (blog, social, handout, YouTube, FAQ, WhatsApp, HyperNatural, infographic) and **lib/utils/step12** have no hardcoded TyG/HbA1c/Waist; content is driven by `topic` + `pastedText`.
- **Note:** `CollaborationTrackerCard.tsx` contains a sample email draft for one specific study (TyG-HbA1c, n=74). This is a copy-paste template only; it does not affect the content generator. Optional: replace with placeholders like `[Study title]` / `[Key finding]` to make that card topic-agnostic too.

---

## 5. Delete-proof

**Check:** Removing Step 12 extensions (or all of Step 12) leaves core Step 12 and Steps 1–6 working 100%.

**Result:** ✅ **PASS**  
- No `app/research/` or steps 1–11 code depends on `app/step12/`, `components/step12/`, or `lib/utils/step12/`.
- Deleting `app/step12/` and `components/step12/` and `lib/utils/step12/` does not break steps 1–6 or the rest of the app (only the Step 12 route and any nav links to it would be removed).

---

## Summary

| Criterion           | Status |
|--------------------|--------|
| Steps 1–6 untouched | ✅     |
| Step 12 isolated     | ✅     |
| No patientData       | ✅     |
| Topic-agnostic       | ✅     |
| Delete-proof         | ✅     |

**Overall:** ✅ **All checks pass.** Step 12 remains isolated, topic-agnostic, and safe; removing it does not affect steps 1–6.
