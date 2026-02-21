# Metabolic Paper App – Setup Checklist

Use this after cloning on a new machine (e.g. Desktop). Port: **3030**.

---

## STEP 1: Install Prerequisites

- [ ] **Node.js** (same version as laptop or newer)  
  Download: https://nodejs.org/
- [ ] **Verify:** Run in terminal:
  ```powershell
  node -v
  npm -v
  ```
- [ ] **Git**  
  Download: https://git-scm.com/
- [ ] **Verify:**
  ```powershell
  git --version
  ```

---

## STEP 2: Clone Repository

- [x] **Clone** (already done):
  ```powershell
  cd C:\Users\pc\Desktop
  git clone https://github.com/muddusurendranehru/metabolic-paper-app-.git
  cd metabolic-paper-app-
  ```

---

## STEP 3: Restore .env.local

- [ ] Create new file in project root: **`.env.local`**
- [ ] Paste content from laptop backup (same folder as `package.json`)
- [ ] **Verify** (PowerShell):
  ```powershell
  Get-Item .env.local
  ```
  Or: `dir .env.local`

---

## STEP 4: Install Dependencies

- [x] **Install** (already done):
  ```powershell
  npm install
  ```
  Wait for completion (~1–2 mins).  
  If errors: try `npm install --legacy-peer-deps`

---

## STEP 5: Restore Patient Data (If Needed)

**Option A – sessionStorage (same browser profile)**  
- [ ] Skip – data should auto-load

**Option B – Import CSV backup**  
- [ ] Open http://localhost:3030
- [ ] Go to **Tab 1 "Extract"**
- [ ] Click **"Import CSV"** (if available)
- [ ] Select `tyd-patients-backup-YYYY-MM-DD.csv`
- [ ] Confirm patients appear in table

---

## STEP 6: Start Server & Test

- [ ] **Start dev server:**
  ```powershell
  npm run dev
  ```
  Wait for: `✓ Ready in XXXms`

- [ ] **Open:** http://localhost:3030

- [ ] **Checks:**
  - [ ] Tab 1 loads without errors
  - [ ] Patient count matches laptop (if data restored)
  - [ ] Edit a value → TyG recalculates
  - [ ] Navigate to Tab 5 → Stats match
  - [ ] Export CSV → Opens correctly

---

## Quick reference

| Step | Status   | Action |
|------|----------|--------|
| 1    | [ ]      | Node + Git installed, `node -v` / `git --version` |
| 2    | Done     | Clone to `Desktop\metabolic-paper-app-` |
| 3    | [ ]      | Create `.env.local`, paste from laptop |
| 4    | Done     | `npm install` |
| 5    | [ ]      | Optional: Import CSV or use same browser profile |
| 6    | [ ]      | `npm run dev` → http://localhost:3030 |
