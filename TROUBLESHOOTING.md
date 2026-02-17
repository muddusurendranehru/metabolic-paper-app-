# Why the app might not be working – checklist

## 1. **Whole app stuck on "Loading..." (FIXED)**
- **Cause:** `PatientProvider` waited for `mounted` before rendering children, so the whole app showed "Loading..." until one effect ran.
- **Fix:** Provider now uses `getDefaultPatients` as initial state and syncs from `sessionStorage` in an effect without blocking. The dashboard and table render immediately with the two default patients.

## 2. **PDF upload returns 500**
- **Cause:** `pdf-parse` (v1.1.1) uses a dynamic `require()` for its internal pdf.js build; Next can bundle the route in a way that breaks that.
- **Checks:**
  - `next.config.ts` has `serverExternalPackages: ["pdf-parse"]`.
  - API route uses `import pdf from "pdf-parse"` and `await pdf(buffer)`.
- **If it still fails:** Use dynamic import in the route:  
  `const pdf = (await import("pdf-parse")).default;`  
  then `await pdf(buffer)`.  
  Or run the app and check the terminal for the real error (no PHI in logs).

## 3. **Scanned PDFs / image-only PDFs**
- **Cause:** pdf-parse only extracts **text**. Scanned reports are images, so there is no text to extract.
- **Fix:** Use OCR (e.g. Tesseract.js) or a service that does OCR; not handled in this app.

## 4. **Values not found (422) or wrong values**
- **Cause:** Lab PDFs differ: labels, spacing, units (mg/dL vs mmol/L), tables, reference ranges.
- **Checks:**
  - API converts mmol/L → mg/dL (glucose ×18, TG ×88.57, HDL ×38.67) when the PDF text contains "mmol/l".
  - Regex in the route targets Indian lab wording (triglycerides, glucose/fbs, HDL).
- **If your lab format differs:** Uncomment the DEBUG block in the API route, upload a PDF, and inspect the logged text; then adjust the regex or add more patterns.

## 5. **Route Handler vs page**
- **API routes** (`app/api/.../route.ts`): Read **request body** only (`req.formData()`, `req.json()`). No `searchParams` or page `params`.
- **Pages** (`app/page.tsx`): Use **searchParams** (and **params** for dynamic routes). In Next 15 they are Promises: `const params = await searchParams`.

## 6. **Patient data not persisting**
- **Cause:** Data is stored in **sessionStorage** (per tab, cleared when the tab closes).
- **Intent:** No server save, no PHI on server. For long-term storage you’d add a backend/DB and auth.

## 7. **Run and test**
```bash
npm run dev
# Open http://localhost:3000 (or PORT=3030 → http://localhost:3030)
```
- Home: PDF upload + table (default 2 patients).
- Analyze: Table, scatter, heatmap, stats.
- Export: CSV, PNG, JCDR draft.

If something still doesn’t work, note the exact screen (e.g. “Home table empty”, “500 on upload”) and any error in the browser console or terminal.
