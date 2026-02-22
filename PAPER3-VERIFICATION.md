# Paper 3 (TyG–HbA1c) – Verification & GitHub Push

## Context

- **Paper 1:** Published (JCCP 2025) – READ-ONLY  
- **Paper 2:** Submitted (TyG–Waist) – READ-ONLY  
- **Paper 3:** TyG–HbA1c – READY FOR SUBMISSION  
- **Manuscript:** `tyd-hba1c-manuscript-SUBMISSION-READY.docx` (export from app)  
- **Data:** `tyg-study-final77a.csv` (77 patients, 75 with TyG + HbA1c)  
- **Correlation:** r = 0.46, P = 0.001 (strong, significant)

---

## Task 1: Verify Manuscript Matches CSV Data

The app generates the manuscript from the **same cohort** and **same formulae** as below. After loading `tyg-study-final77a.csv` in the app (Step 1 Extract → Import CSV), the exported Word doc should match these values.

### 1. Cohort and n

- **Cohort:** Rows with both `tyg` and `hba1c` present and numeric.  
- **App:** `filterPatientsWithTyGAndHbA1c(patients)` in `lib/utils/hba1c-manuscript.ts`.  
- **Expected:** n = 75 (if all 75 with HbA1c also have TyG).

### 2. Mean HbA1c and SD

- **App:** `stats.meanHbA1c`, `stats.sdHbA1c` from `calculateHbA1cStats(patients)` (population variance: divide by n).  
- **Manuscript:** Abstract, Results, Table 1, Table 2 use these values (e.g. 6.92% ± 2.06%).  
- **Python:** For exact SD match use `df['hba1c'].std(ddof=0)` (population); `df['hba1c'].std()` uses sample (ddof=1).

### 3. Correlation (r and P)

- **App:** `correlation(tygValues, hba1cValues)` and `correlationPValue(r, n)` in `lib/tyg.ts` (Pearson r; p is an approximation).  
- **Manuscript:** Abstract, Results, Correlation Analysis, Table 2.  
- **Note:** r matches standard Pearson; p is approximate (e.g. P &lt; 0.001 when |t| large). For exact p, use the Python snippet below.

### 4. Clinical bands (% add to 100%)

- **Thresholds (Dr. Muddu):** Normal &lt;6.0%, Prediabetes 6.1–6.5%, Good 6.6–7.0%, Poor 7.1–8.0%, Alert &gt;8.1%.  
- **App:** `getDiabetesRiskStatsForCohort(withBoth)` in `lib/utils/diabetes-risk.ts`; uses CSV column `diabetesRisk` when present, else `getDiabetesRisk(hba1c)`.  
- **Manuscript:** Abstract, Results, Table 1. Bands add to 100% (Pending/Missing row added when &gt; 0).

### Python snippet (external check)

Run against `tyg-study-final77a.csv` to verify n, mean HbA1c, correlation, and band counts:

```python
# From tyg-study-final77a.csv
import pandas as pd
from scipy.stats import pearsonr

df = pd.read_csv('tyg-study-final77a.csv')
df = df[df['hba1c'].notna() & df['tyg'].notna()]  # cohort with both TyG and HbA1c

# Verify these match manuscript:
n = len(df)
print(f"n = {n}")  # Should be 75
print(f"Mean HbA1c = {df['hba1c'].mean():.2f}% ± {df['hba1c'].std():.2f}%")
r, p = pearsonr(df['tyg'], df['hba1c'])
print(f"Correlation r = {r:.2f}, p = {p:.4f}")

# Clinical bands (Dr. Muddu thresholds) – should add to 100%:
bands = {
    'Normal': len(df[df['hba1c'] < 6.0]),
    'Prediabetes': len(df[(df['hba1c'] >= 6.1) & (df['hba1c'] <= 6.5)]),
    'Good': len(df[(df['hba1c'] >= 6.6) & (df['hba1c'] <= 7.0)]),
    'Poor': len(df[(df['hba1c'] >= 7.1) & (df['hba1c'] <= 8.0)]),
    'Alert': len(df[df['hba1c'] > 8.1]),
}
total = sum(bands.values())
for name, count in bands.items():
    pct = count / total * 100 if total else 0
    print(f"{name}: {count} ({pct:.1f}%)")
print(f"Total: {total} (100%)")
```

If the CSV has a `diabetesRisk` column, the app uses it for band counts (so bands in the manuscript may match that column rather than the HbA1c thresholds above).

---

## Prepare for GitHub Push – Safe & Clean

- [ ] **No secrets** – No API keys, tokens, or passwords in repo; use env vars (e.g. `.env.local` in `.gitignore`).  
- [ ] **.gitignore** – `.env*`, `node_modules`, `.next`, `*.docx` (if you don’t want Word files in repo), and any local data paths.  
- [ ] **No local paths** – No hardcoded paths to your machine; manuscript filename is fixed in code (`tyd-hba1c-manuscript-SUBMISSION-READY.docx`).  
- [ ] **Paper 1 & 2** – Unchanged; only Paper 3 and shared infra touched.  
- [ ] **Build** – `npm run build` and `npm run lint` pass.  
- [ ] **Export test** – Load `tyg-study-final77a.csv`, go to Step 5, select Paper 3, export Word; open and spot-check n, mean HbA1c, r, P, and band %.

After verification, you can push Paper 3 (TyG–HbA1c) branch to GitHub for submission.
