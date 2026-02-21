# What Cursor Can Do (TyG Research Dashboard)

**Rule: Don't destroy success.** Add or fix in a minimal, safe way. Backend → frontend order. Test before changing.

---

## Paper 1 vs Paper 2

| Paper 1 (Published) | Paper 2 (In Progress) |
|---------------------|------------------------|
| **READ-ONLY REFERENCE** | **ACTIVE WORKSPACE** |
| Display publication info | Full editing |
| DOI link to published paper | Manuscript generation |
| No code changes allowed | Export to Word/PDF |
| No data modification | Data can be updated |
| Static badge only | Dynamic analysis |

When adding features or fixing bugs: do not change Paper 1 behavior or data. All active development (HbA1c, new exports, new analyses) belongs to Paper 2.

---

## Capabilities

| Task | Notes |
|------|--------|
| Generate Title Page, References, Ethics statements | Manuscript content / templates |
| Update Tab5JCDR with publication badges | e.g. Published Research, Paper 1/2 |
| Create HbA1c manuscript generator | For Paper 2 (TyG–HbA1c) when ready |
| Fix build errors (Tailwind, dependencies) | See `VERIFY-CHECKLIST.md`, clear `.next`, restart |
| Export Word/PDF with embedded figures | Already in place; keep `data-pdf-hide` for Edit buttons |
| Maintain "Don't Destroy Success" rule | No breaking changes; verify insert/fetch before UI |

---

## How to Use

- **@-mentions:** Reference this file (`@CURSOR-GUIDE.md`), `VERIFY-CHECKLIST.md`, or specific components when asking for changes.
- **Structured prompts:** e.g. "Add X to Tab5JCDR without changing export flow" or "Fix Tailwind: [error]; don't remove working styles."
- **Order:** Database/backend success first, then frontend. Clear cache (`rmdir /s /q .next` or delete `.next`) and `npm run dev` after config changes.

---

---

## Architecture

```
app/
├── page.tsx                    # Main nav (unchanged)
├── published/                  # Paper 1 (READ-ONLY)
│   └── page.tsx                # Display published paper info
└── research/                   # Paper 2 (ACTIVE)
    └── page.tsx                # Full TyG-HbA1c workflow

components/
├── tabs/
│   ├── Tab1Extract.tsx         # SHARED: Data entry (both papers)
│   ├── Tab2Verify.tsx          # SHARED: Verification
│   ├── Tab3Waist.tsx           # SHARED: Waist input
│   ├── Tab4Analyze.tsx         # SHARED: Charts/stats
│   └── Tab5JCDR.tsx            # PAPER 2 ONLY: Manuscript generator
├── published/                   # Paper 1 (READ-ONLY)
│   ├── PublicationBadge.tsx   # Display published paper info
│   ├── Paper1View.tsx          # Static view of published manuscript
│   └── DOILink.tsx             # Clickable DOI to published paper

lib/utils/
├── ijcpr-manuscript.ts         # PAPER 1: Frozen (no edits)
├── hba1c-manuscript.ts         # PAPER 2: Active development
└── stats-calculator.ts         # SHARED: Statistics

.cursorrules                     # Enforce Paper 1 / Paper 2 separation
```

*TyG Research Dashboard – JCCP 2025 published; Paper 2 (TyG-HbA1c) in progress.*
