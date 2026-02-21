# Verification checklist

Run the app: `npm run dev` (port 3030). Then verify:

## Step 5 “nothing working” / all zeros – fixed

**Error:** Step 5 showed Total Patients: 0, Mean TyG: 0.00, blank figures, and Results with all zeros.

**Cause:** Step 5 (and stats/charts/manuscript) used only patients with `status === 'verified'`. That field was never set (Step 2 Verify didn’t add it), so the “verified” list was always empty.

**Fix applied:**
1. **Step 2 (Verify):** Saving from the verification modal now sets `status: 'verified'` on the patient so they count in Step 5.
2. **Fallback when no one is verified:** If no patient has `status === 'verified'`, Step 5 and all downstream logic (stats, manuscript, Table 1, charts, exports) now use **all patients** instead of an empty list. So you see data as soon as you have patients in Step 1, even if you skip Step 2.
3. **Stats/charts/anonymize/IJCPR** use the same rule: prefer verified, otherwise use the full list.

- [ ] **Server starts without errors** – Terminal shows "Ready" and no red errors.
- [ ] **Tab 1–4 still work** – Click "Extract PDFs", "Verify", "Edit Waist", "Analyze"; each tab loads and shows its content.
- [ ] **Tab 5 loads** – Click "Write JCDR"; stats, manuscript sections, Table 1, and export buttons appear.
- [ ] **Export PDF** – On Tab 5, click "Export PDF"; a PDF file downloads and opens/reads correctly.
- [ ] **Export Word** – On Tab 5, click "Export Word"; a .doc file downloads and opens in MS Word.
- [ ] **Export CSV** – On Tab 5, click "Export CSV"; a CSV file downloads with anonymized data (e.g. anonymousId column).

**Note:** Export PDF uses `html2canvas` and `jspdf` in the browser. If the PDF button does nothing, check the browser console (F12) for errors and ensure `npm install` has been run so those packages are present.
