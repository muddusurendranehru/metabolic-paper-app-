/**
 * Content Ops – utilities.
 * ISOLATION: NEVER import from app/research/steps/ or lib/utils that depend on research steps.
 * research/steps/ must NEVER import from lib/utils/content-ops/.
 */

export const CONTENT_OPS_NAMESPACE = "content-ops" as const;
export {
  parseCsvToQueue,
  parseTopicListToQueue,
  parseBatchUpload,
  getCsvTemplateHeader,
  getCsvTemplateRow,
  CSV_TEMPLATE,
  type QueueItem,
  type QueueStatus,
  type BatchTopic,
} from "./parse-batch";

export {
  syncToGoogleSheet,
  formatTrackerRows,
  toLocalFallbackJson,
  TRACKER_HEADERS,
  type TrackerRow,
  type SyncResult,
} from "./google-sheet-sync";

export {
  generateBatchTopics,
  getDefault30DayBatch,
  DEFAULT_30_TOPICS,
} from "./batch-generator";
export { getPostedSummary, getUnpostedItems, type PostedSummary } from "./social-tracker";
export { toCsv, toJson, toMarkdown, queueToTrackerRows } from "./export-formats";

/** Display name for language code (queue table). */
export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  mr: "Marathi",
};
