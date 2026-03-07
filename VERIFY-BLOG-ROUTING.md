# Step 12 Blog Single-Routing Verification

## Checklist

- [x] Replace `generateBlogPost()` with single-routing version (food / clinical / neutral)
- [x] Comment out/delete code that called multiple generators for one topic (client `blog.ts` now uses one template per short topic)
- [x] **Test: "almonds diabetes"** → Clean food template ONLY (no PubMed, no merged content)
- [x] **Test: "TyG index diabetes"** → Clinical PubMed template ONLY
- [x] **Test: "random topic"** → Simple neutral fallback
- [x] **Verify:** No merged content, no "surrogate marker" for foods (food path never calls knowledge-base)
- [x] **Verify:** Steps 1–6 still load perfectly (no imports from step12 in `app/research/steps`)

---

## How to test locally

1. Start dev server: `npm run dev` (port 3030).
2. Run the requests below (PowerShell or WSL).

### 1. Almonds diabetes → food template only

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3030/api/step12/generate-blog" -ContentType "application/json" -Body '{"topic":"almonds diabetes","language":"en"}' | ForEach-Object { $_.content }
```

**Expected:** One blog with "Simple Nutrition Facts", Quick Nutrition Facts table, "Good in moderation", Smart Pairing Tips. No PubMed sections, no "surrogate marker".

### 2. TyG index diabetes → clinical (PubMed) only

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3030/api/step12/generate-blog" -ContentType "application/json" -Body '{"topic":"TyG index diabetes","language":"en"}' | ForEach-Object { $_.content }
```

**Expected:** Blog with "What Does PubMed Evidence Say?", Recent PubMed Findings / limitations. No food template.

### 3. Random topic → simple neutral fallback

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3030/api/step12/generate-blog" -ContentType "application/json" -Body '{"topic":"random topic","language":"en"}' | ForEach-Object { $_.content }
```

**Expected:** "Evidence Overview", Practical Takeaway, no PubMed trials section, no food table.

---

## Steps 1–6

- Open: `/research`, then `/research/steps/step-1` … `/research/steps/step-6`.
- Confirm pages load with no errors (no dependency on Step 12 blog routing).
