# Step 12 – 30-Day Social Media Content Generator

Use this with Step 12 (`/step12`) or Cursor. **Don’t destroy success:** Steps 1–6 unchanged; Step 12 only.

---

## Batch processing options

### Option A: Manual (one-by-one in Step 12)
1. Open `/step12` in your app.
2. Paste **Day X** topic into the **Topic** field.
3. Select **language** (en / hi / te / ta).
4. Select **formats** (YouTube, Instagram, Facebook, etc.).
5. Click **Generate**.
6. Copy outputs → schedule posts (Buffer/Hootsuite/etc.).
7. Repeat for Days 1–30.

### Option B: Semi-automated (Cursor + CSV)
1. Create a CSV with 30 topics + metadata (language, audience, tone).
2. Use Cursor to generate all 30 in a loop (e.g. call generators per topic).
3. Export results to Google Sheet for scheduling.
4. Use Buffer/Hootsuite for auto-posting.

### Option C: Future API (advanced)
```typescript
// Pseudo-code for batch API call
const topics = [/* 30 topics array */];
const results = await Promise.all(
  topics.map(topic =>
    generateSocialContent({
      topic,
      language: 'te',
      formats: ['youtube', 'instagram', 'facebook'],
      websiteUrl: 'https://dr-muddus-mvp-miracle-value-proposition-2l36.onrender.com'
    })
  )
);
// Export results to CSV for scheduling
```
*(Step 12 currently exposes generators per format; a batch API could wrap them.)*

---

## 30-day topic list (copy-paste)

| Day | Topic |
|-----|------|
| 1 | TyG vs ₹500 Insulin Test (Which Wins?) |
| 2 | 5 HbA1c Danger Bands Explained |
| 3 | Central Obesity = Silent Killer (Waist Test) |
| 4 | Why Indians Can't Wake 5AM (Dopamine Truth) |
| 5 | 3g Fiber vs 25g: India's Diabetes Trap |
| 6 | Mango Season Survival Guide |
| 7 | TyG Calculator Demo (Live!) |
| 8 | Pioglitazone: Benefits vs Side Effects |
| 9 | Jackfruit for Diabetics: Yes or No? |
| 10 | Intermittent Fasting: Indian Diet Plan |
| 11 | Ghee in Diabetes: Myth vs Science |
| 12 | Yoga Poses for Insulin Resistance |
| 13 | Metformin Timing: Morning vs Night? |
| 14 | Stress = High Sugar (Cortisol Truth) |
| 15 | Sleep 6hrs vs 8hrs: Diabetes Risk |
| 16 | Walking 10k Steps: Does It Really Work? |
| 17 | Protein for Indians: Dal vs Eggs vs Chicken |
| 18 | Rice vs Roti: Which Spikes Sugar Less? |
| 19 | Tea/Coffee with Sugar: Hidden Diabetes Risk |
| 20 | Family History: Your Diabetes Clock Starts NOW |
| 21 | PCOS + Diabetes: The Double Trouble |
| 22 | Thyroid + Diabetes: What Doctors Don't Say |
| 23 | Kidney Warning Signs for Diabetics |
| 24 | Eye Check: When Diabetics Go Blind |
| 25 | Foot Care: 1 Minute That Saves Limbs |
| 26 | Monsoon Diabetes: Infection Risk Alert |
| 27 | Festival Food Guide: Diwali Without Sugar Spike |
| 28 | Travel Tips for Diabetics (India Edition) |
| 29 | Medication Adherence: Why You Skip Pills |
| 30 | Your 2026 Metabolic Reset Plan |

---

## Step 12 prompt template (per day)

Copy this block and fill **Day X** topic when using Step 12 or Cursor:

```
TOPIC: [Paste Day X topic here]
LANGUAGE: [en / hi / te / ta]  ← Select per audience
AUDIENCE: [patients / doctors / general]
TONE: [friendly / educational / urgent]
TARGET FORMATS (select all that apply):
☑ YouTube Shorts Script (60 sec)
☑ Instagram Reels Caption + Hashtags
☑ Facebook Post (longer caption)
☑ Twitter Thread (5 tweets)
☑ WhatsApp Message (160 chars)
☑ Blog Snippet (300 words)
```

**Required in every output:**
- Hook (first 3 seconds / first line)
- Problem statement (1 sentence)
- Key fact/stat (from research if applicable)
- Practical tip (actionable for Indian audience)
- **CTA with website link:** 🔗 Free Tools: https://dr-muddus-mvp-miracle-value-proposition-2l36.onrender.com
- Platform-specific hashtags (5–10)
- **Medical terms in English** (TyG, HbA1c, insulin, etc.); explanatory text in selected language

---

## Platform-specific formatting (Step 12 aligns with this)

| Platform | Notes |
|----------|--------|
| **YouTube Shorts** | Title ≤60 chars, script with timestamps [0:00–0:05], description (first 3 lines critical), tags + hashtags, end screen: Subscribe + Visit [website] |
| **Instagram Reels** | Caption ≤2200 chars, first line = hook, 10–15 hashtags, CTA: Link in bio → [website] |
| **Facebook** | Longer caption (400–600 words), engaging question, CTA: Learn more: [website] |
| **Twitter** | Thread: Tweet 1 = hook, 2–4 = facts, Tweet 5 = CTA + link; ≤280 chars per tweet |
| **WhatsApp** | Plain text ≤160 chars, auto-clickable link, emoji-friendly |
| **Blog** | Title + ~300-word summary, meta description ≤160 chars, internal link to calculator/tool |

---

## Example output shape (Day 1: TyG vs ₹500 Insulin Test)

**YouTube Shorts**
- **TITLE:** TyG vs ₹500 Insulin Test: Which Wins? 🩸
- **SCRIPT:** [0:00–0:05] HOOK → [0:05–0:15] PROBLEM → [0:15–0:35] SCIENCE → [0:35–0:50] SOLUTION → [0:50–1:00] CTA (Try free at [website], Subscribe)
- **DESCRIPTION (first 3 lines):** 🔗 FREE TyG Calculator: [URL] + 2 lines summary
- End screen: QR code + website URL

**Instagram Reels**
- **CAPTION:** Hook line → TyG vs ₹500 comparison → CTA link → Hashtags (#TyG #Diabetes #MetabolicHealth #Hyderabad #Telugu #FreeTools #IndianResearch #HOMAClinic etc.)

Step 12 generators (YouTube package, Facebook post, WhatsApp CTA, handout, etc.) already include the website URL and medical-term preservation; use the **Output Language** selector for en/hi/te/ta and **Target formats** for the platforms above.
