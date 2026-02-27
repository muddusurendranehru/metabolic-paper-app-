# Desktop migration checklist

Use this before switching from laptop to desktop.

---

## STEP 1: Export patient data (critical)

- [ ] Open **http://localhost:3030** (start with `npm run dev` if needed)
- [ ] Go to **Tab 5 "Write JCDR"**
- [ ] Click **"Export CSV"**
- [ ] Save as: **tyd-patients-backup-Feb20-2026.csv**
- [ ] Save to USB / Google Drive / or email to yourself
- [ ] Optional: Open CSV in Excel and confirm row count matches your patient count

---

## STEP 2: Git commit and push

- [ ] Open **Command Prompt** or **PowerShell** on your laptop.
- [ ] Go to the project folder (use your actual path; example):
  ```bash
  cd C:\Users\MYPC\Desktop\metabolic-paper-app
  ```
  If your project is elsewhere, replace with that path (e.g. `C:\path\to\metabolic-paper-app`).
- [ ] Stage and commit:
  ```bash
  git add .
  git commit -m "Backup before desktop migration"
  ```
- [ ] Push to GitHub (this repo uses branch **master**, not main):
  ```bash
  git push origin master
  ```
- [ ] On GitHub.com, confirm the latest commit is visible

---

## STEP 3: Note patient count

- [ ] In Tab 5, check **"Total Patients"** (e.g. 60 or 62)
- [ ] Write it down so you can verify after restoring on the desktop

---

## STEP 4: Backup .env.local (if you use it)

- [ ] Copy `.env.local` to USB/cloud or copy its contents to a text file / email
- [ ] On the new desktop you’ll need the same env vars (e.g. `OPENAI_API_KEY`)

---

## STEP 5: Shut down

- [ ] Close the browser (sessionStorage is per-session; CSV backup is your durable copy)
- [ ] Stop the dev server: **Ctrl+C** in the terminal
- [ ] Shut down the laptop as usual
