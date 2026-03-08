# AI Content – Two Tracks (Never Mix)

| Feature | Neutral Content (`/ai/notebook/`) | Patient Reviews (`/ai/testimonials/`) |
|--------|-----------------------------------|--------------------------------------|
| **Purpose** | Clinical education, PubMed-style | Patient testimonials, trust-building |
| **Tone** | Neutral, evidence-aware | Warm, emotional, personal |
| **Language** | 70% English, 30% Telugu | 70% Telugu, 30% English |
| **Claims** | "Evidence is evolving" | "I experienced…" (generic composite) |
| **Safety** | No patient claims | Generic composite, no identifiers |
| **Mixing risk** | ❌ NEVER mix with testimonials | ❌ NEVER mix with clinical content |

- **Notebook** output must not be used in testimonial or patient-review content.
- **Testimonials** output must not be mixed with clinical/evidence content from the notebook or Step 12.

**Patient Review Generator (safe & isolated):** See [testimonials/SAFE-ISOLATED.md](testimonials/SAFE-ISOLATED.md). Folder: `/ai/testimonials/`. Zero imports from notebook or step12; generic composite only; Steps 1–6 untouched. **Action:** Add content here → Generate → Post.
