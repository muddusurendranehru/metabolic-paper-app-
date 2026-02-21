# Verification checklist

Run the app: `npm run dev` (port 3030). Then verify:

---

## Common culprits (color / build issues)

If you see lab()/lch() rendering issues or broken styles, check:

| File | What to check |
|------|----------------|
| `tailwind.config.js` | Custom color themes using `lab()` – keep theme colors as hex/RGB or leave `extend: {}` empty. |
| `app/globals.css` | CSS variables with `lab()` or `lch()` – use hex or `rgb()`/`rgba()` only (see comment in file). |
| `components/ui/*` | shadcn components with modern colors – prefer semantic vars (e.g. `var(--primary)`) that are defined in globals.css as hex. |
| `postcss.config.mjs` | Missing or misconfigured plugins – keep `@tailwindcss/postcss` and `autoprefixer`; do not remove. |

---

## Clear cache & restart

If the app behaves oddly after config/CSS changes (e.g. styles not updating), clear the Next.js cache and restart:

1. **Stop the server**  
   `Ctrl + C`

2. **Delete the `.next` folder**  
   - **Windows:** `rmdir /s /q .next`  
   - **Mac/Linux:** `rm -rf .next`

3. **Restart the server**  
   `npm run dev`

---

## Server check & lab() cleanup (full run)

Run this when checking the app locally or hunting lab() color issues:

1. **Stop the server**  
   `Ctrl + C`

2. **Search for lab() in CSS (PowerShell)**  
   ```powershell
   Select-String -Path "*.css" -Pattern "lab\(" -Recurse
   ```  
   (Fix or remove any matches in your source; ignore `.next` if you only care about your code.)

3. **Delete `.next` cache**  
   - **Windows (cmd):** `rmdir /s /q .next`  
   - **PowerShell:** `Remove-Item -Recurse -Force .next` (only when the server is stopped, or you may get “Access denied”.)

4. **Reinstall Tailwind (optional – only if you need v3)**  
   ```bash
   npm uninstall tailwindcss
   npm install -D tailwindcss@3.4.1
   ```  
   **Warning:** This downgrades from Tailwind v4 to v3. Only do this if you intentionally want v3; otherwise keep your current Tailwind version.

5. **Restart the server**  
   `npm run dev`

---

## Step 5 “nothing working” / all zeros – fixed

**Error:** Step 5 showed Total Patients: 0, Mean TyG: 0.00, blank figures, and Results with all zeros.

**Cause:** Step 5 (and stats/charts/manuscript) used only patients with `status === 'verified'`. That field was never set (Step 2 Verify didn’t add it), so the “verified” list was always empty.

**Fix applied:**
1. **Step 2 (Verify):** Saving from the verification modal now sets `status: 'verified'` on the patient so they count in Step 5.
2. **Fallback when no one is verified:** If no patient has `status === 'verified'`, Step 5 and all downstream logic (stats, manuscript, Table 1, charts, exports) now use **all patients** instead of an empty list. So you see data as soon as you have patients in Step 1, even if you skip Step 2.
3. **Stats/charts/anonymize/IJCPR** use the same rule: prefer verified, otherwise use the full list.

---

## App verification

- [ ] **Server starts without errors** – Terminal shows "Ready" and no red errors.
- [ ] **Tab 1–4 still work** – Click "Extract PDFs", "Verify", "Edit Waist", "Analyze"; each tab loads and shows its content.
- [ ] **Tab 5 loads** – Click "Write JCDR"; stats, manuscript sections, Table 1, and export buttons appear.
- [ ] **Export PDF** – On Tab 5, click "Export PDF"; a PDF file downloads and opens/reads correctly.
- [ ] **Export Word** – On Tab 5, click "Export Word"; a .doc file downloads and opens in MS Word.
- [ ] **Export CSV** – On Tab 5, click "Export CSV"; a CSV file downloads with anonymized data (e.g. anonymousId column).

**Note:** Export PDF uses `html2canvas` and `jspdf` in the browser. If the PDF button does nothing, check the browser console (F12) for errors and ensure `npm install` has been run so those packages are present.
