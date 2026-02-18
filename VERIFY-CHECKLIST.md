# Verification checklist

Run the app: `npm run dev` (port 3030). Then verify:

- [ ] **Server starts without errors** – Terminal shows "Ready" and no red errors.
- [ ] **Tab 1–4 still work** – Click "Extract PDFs", "Verify", "Edit Waist", "Analyze"; each tab loads and shows its content.
- [ ] **Tab 5 loads** – Click "Write JCDR"; stats, manuscript sections, Table 1, and export buttons appear.
- [ ] **Export PDF** – On Tab 5, click "Export PDF"; a PDF file downloads and opens/reads correctly.
- [ ] **Export Word** – On Tab 5, click "Export Word"; a .doc file downloads and opens in MS Word.
- [ ] **Export CSV** – On Tab 5, click "Export CSV"; a CSV file downloads with anonymized data (e.g. anonymousId column).

**Note:** Export PDF uses `html2canvas` and `jspdf` in the browser. If the PDF button does nothing, check the browser console (F12) for errors and ensure `npm install` has been run so those packages are present.
