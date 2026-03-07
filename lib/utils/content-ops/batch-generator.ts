/**
 * Content Ops – generate many topics at once (e.g. 30-day batch).
 * ISOLATION: No imports from app/research/steps/.
 */

import type { QueueItem } from "./parse-batch";

const DEFAULT_LANGUAGE = "en";
const DEFAULT_AUDIENCE = "general";
const DEFAULT_FORMATS = "blog";

export const DEFAULT_30_TOPICS: string[] = [
  "Day 1: TyG vs Insulin Test",
  "Day 2: 5 HbA1c Danger Bands",
  "Day 3: Central Obesity and Waist",
  "Day 4: Fasting Glucose Tips",
  "Day 5: Fiber and Diabetes",
  "Day 6: Mango Season Guide",
  "Day 7: TyG Calculator Demo",
  "Day 8: Pioglitazone Benefits",
  "Day 9: Jackfruit for Diabetics",
  "Day 10: Metabolic Syndrome",
  "Day 11: Insulin Resistance",
  "Day 12: Triglycerides and Heart",
  "Day 13: HbA1c and Diet",
  "Day 14: Waist Circumference",
  "Day 15: Ghee and Diabetes",
  "Day 16: Fasting vs Post-Meal",
  "Day 17: TyG Index Explained",
  "Day 18: Diabetes in India",
  "Day 19: Lifestyle and Glucose",
  "Day 20: Cost-Effective Tests",
  "Day 21: Risk Bands Explained",
  "Day 22: Early Detection",
  "Day 23: Monitoring at Home",
  "Day 24: When to See a Doctor",
  "Day 25: Diet and TyG",
  "Day 26: Exercise and Metabolism",
  "Day 27: Stress and Blood Sugar",
  "Day 28: Family History",
  "Day 29: Screening Guidelines",
  "Day 30: Summary and Next Steps",
];

export function generateBatchTopics(
  topics: string[],
  defaults?: Partial<Pick<QueueItem, "language" | "audience" | "formats">>
): QueueItem[] {
  const lang = defaults?.language ?? DEFAULT_LANGUAGE;
  const audience = defaults?.audience ?? DEFAULT_AUDIENCE;
  const formats = defaults?.formats ?? DEFAULT_FORMATS;
  return topics.map((topic) => ({
    topic: topic.trim(),
    language: lang,
    audience,
    formats,
    scheduledDate: "",
    status: "wait" as const,
  }));
}

export function getDefault30DayBatch(): QueueItem[] {
  return generateBatchTopics(DEFAULT_30_TOPICS);
}
