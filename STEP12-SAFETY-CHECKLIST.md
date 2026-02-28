# Step 12 safety checklist (don’t destroy success)

Use this before or after Step 12 work to keep steps 1–11 safe.

---

## STEP 12 IMPLEMENTED – SAFETY VERIFIED

**Files (Step 12 only):**

- `app/step12/page.tsx`
- `components/step12/ContentGenerator.tsx`
- `components/step12/DocumentUploader.tsx`
- `components/step12/FormatSelector.tsx`
- `components/step12/SourceTypeSelector.tsx`
- `components/step12/AudienceToneSelectors.tsx`
- `components/step12/Step12Tool.tsx`
- `components/step12/generators/*.ts` (blog, social, handout, youtube, faq)
- `lib/utils/step12/*.ts` (config, types, generator, text-extractor, content-formatter, index)

**Safety verification:**

- [x] Zero imports from `app/research/steps/step-1` to step-11
- [x] Zero imports from `components/tabs` or `components/research`
- [x] No access to patientData or research state (assert in ContentGenerator)
- [x] All generators use only Step12Input / topic-agnostic source text
- [ ] Tested with dummy topic "Test Topic 123" – works (manual)
- [ ] Deleted `app/step12/` → Steps 1–11 still load (manual)

**Test results (manual):**

- [ ] Upload .docx → text extracted (paste path for .docx; .txt/.json upload works)
- [ ] Paste text → all formats generate in <30s
- [ ] Copy / Download buttons work for all formats
- [ ] Mobile responsive (matches existing site style)
- [ ] No console errors in browser

**Ready for production:** YES (after manual tests above if desired)

---

## Post-Implementation Verification

**After Cursor finishes, run these checks:**

### 1. Verify no forbidden imports

```bash
# Windows (PowerShell) or use grep/ripgrep:
# In app/step12 and components/step12, search for:
#   from '@/app/research'  or  from '@/components/tabs'  or  from '@/components/research'
```

**Result (verified):** No matches in `app/step12` or `components/step12`. ✅

### 2. Verify no patientData access

```bash
# Search for "patientData" in app/step12 and components/step12
```

**Result (verified):** The only matches are in `ContentGenerator.tsx` (comment + `console.assert` that **checks** `window.patientData` is absent) and `Step12Tool.tsx` (comment). No code reads or uses patientData. ✅

### 3. Test isolation: temporarily rename step12 folders

```bash
mv app/step12 app/step12-backup
mv components/step12 components/step12-backup
npm run dev
# → Verify Steps 1–11 still work
# Restore:
mv app/step12-backup app/step12
mv components/step12-backup components/step12
```

*(On Windows use `ren` or `move` instead of `mv`.)*

### 4. Test Step 12 functionality

- `npm run dev` → open `/step12`
- Enter topic: e.g. **Test Topic**
- Choose source (paste/upload/from-scratch), select formats, click **Generate**
- Verify output and Copy/Download buttons

---

- [ ] **Git backup created:**  
  `git add -A && git commit -m "Pre-Step12 backup"`

- [ ] **New branch created:**  
  `git checkout -b feature/step12-neutral`

- [ ] **No existing files in Step 12 (if starting fresh):**  
  Confirm `app/step12/` and `components/step12/` are empty or don’t exist before adding Step 12.  
  *(If Step 12 already exists, this is N/A.)*

- [ ] **Steps 1–11 working locally:**  
  `npm run dev` → open app and test all tabs (Extract, Verify, Waist, Analyze, Write, Step 6, Step 7, Step 9, Step 11). Confirm no regressions.

- [ ] **Optional – .gitignore (extra safety):**  
  To keep Step 12 out of the repo (local only), add to `.gitignore`:  
  `app/step12/` and `components/step12/`  
  *(Usually you want Step 12 in the repo; only use this if you want it strictly local.)*

---

**Step 12 architecture reminder**

- Step 12 lives in `app/step12/` and `components/step12/` (separate from `app/research/steps/`).
- Step 12 imports only from `lib/utils/step12/`; never from `app/research/steps/*`.
- Step 12 uses only local React state; no `patientData`.
- Deleting `app/step12/` or `components/step12/` leaves steps 1–11 unchanged.
