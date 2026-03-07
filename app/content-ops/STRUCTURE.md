# Content Ops – Batch Content Manager (SAFE, ISOLATED)

## Safety

- **Steps 1–6:** LOCKED. Do not modify `app/research/steps/step-1` through `step-6`.
- **Content-ops** does not import from `app/research/steps/*`.
- If the entire `/content-ops` tree is deleted, Steps 1–13 continue to work unchanged.

## Folder structure

```
app/content-ops/
├── page.tsx              # Main dashboard
├── batch-uploader.tsx    # CSV/topic list upload (re-export)
├── content-queue.tsx     # Generation queue UI (re-export)
├── social-tracker.tsx    # Posted? Yes/No tracker
├── export-utils.ts       # CSV/JSON export helpers
├── STRUCTURE.md          # This file

components/content-ops/
├── BatchUploader.tsx     # CSV upload + paste → add to queue
├── ContentQueue.tsx      # Queue table: # | Topic | Language | Formats | Status | Actions
├── TopicCard.tsx         # Single topic card
├── StatusBadge.tsx       # Wait / Gen / Done / Posted badge
├── BatchProgress.tsx     # Progress bar (e.g. 5/30 done)
├── SheetSync.tsx         # Sync to Google Sheet button
└── README.md             # Isolation rules

lib/utils/content-ops/
├── index.ts              # Public exports
├── parse-batch.ts        # CSV + one-per-line → QueueItem[]
├── batch-generator.ts    # Generate 30 topics at once
├── social-tracker.ts     # Track posted status (logic)
├── google-sheet-sync.ts  # Optional: sync to Sheets
└── export-formats.ts     # CSV, JSON, Markdown export

data/content-ops/
├── topics-batch.csv      # Upload template
├── content-queue.json    # Local queue storage (placeholder)
└── social-tracker.json   # Posted status log (placeholder)
```

## Allowed imports (content-ops only)

- `app/content-ops/*` → `@/components/content-ops/*`, `@/lib/utils/content-ops`
- `components/content-ops/*` → `@/lib/utils/content-ops`
- `lib/utils/content-ops/*` → only within this folder (no research, no step12 unless explicitly allowed)

## Forbidden

- Any import from `app/research/steps/*` into content-ops.
- Any import from `app/content-ops/*` or `components/content-ops/*` or `lib/utils/content-ops/*` into research steps.
