/**
 * Step 12 – public API. Step 12 imports ONLY from here (lib/utils/step12/).
 * Never import from app/research/steps/* or other lib/utils in Step 12 code.
 */

export {
  DEFAULT_STEP12_STATE,
  DEFAULT_NEUTRAL_INPUT,
  DEFAULT_STEP12_INPUT,
  formatStep12Label,
  STEP12_CONSTANTS,
  STEP12_DEFAULT_WEBSITE_URL,
  STEP12_DEFAULT_CLINIC,
  WEBSITE_CONFIG,
  STEP12_LANGUAGES,
  STEP12_DEFAULT_LANGUAGE,
  type Step12State,
} from "./step12-config";
export {
  getWebsiteLinkLine,
  appendWebsiteLink,
  ensureWebsiteLinkInContent,
  injectWebsiteLink,
  type LinkInjectorOptions,
} from "./link-injector";
export {
  UNIVERSAL_TRANSLATIONS,
  getUniversalTranslation,
  getLanguageName,
  getLanguageFlag,
  type SupportedLanguage,
} from "./universal-translations";
export { generateNeutralContent } from "./step12-generator";
export {
  generateUniversalContent,
  type UniversalContentInput,
} from "./universal-content-generator";
export {
  generateBlogPost,
  type BlogPostInput,
} from "./blog-with-translate";
export {
  generateBlogWithKnowledgeBase,
  type BlogKnowledgeInput,
} from "./blog-knowledge-content";
export {
  checkGuidelines,
  type GuidelineQuery,
  type GuidelineResult,
} from "./guideline-checker";
export {
  getFoodFacts,
  isFoodTopic,
  extractFoodName,
  type FoodFactResult,
} from "./food-facts";
export {
  buildContentFromNutritionData,
  normalizeNutritionBotJson,
  type NutritionBotContentInput,
  type NutritionBotContentOutput,
  type NutritionBotLanguage,
} from "./nutrition-bot-content";
export {
  fetchNutritionData,
  getNutritionForTopicWithFallback,
  type NutritionBotResponse,
} from "./nutrition-bot-client";
export {
  parseNutritionBotText,
  type ParsedNutritionData,
} from "./nutrition-text-parser";
export {
  generateNaturalContent,
  type NaturalContentInput,
} from "./natural-content-generator";
export type {
  NeutralContentInput,
  NeutralContentOutput,
  Step12Input,
  Step12SourceType,
  Step12TargetFormat,
  Step12Audience,
  Step12Tone,
  Step12Language,
} from "./step12-types";
export { extractPlainText, extractSnippet } from "./text-extractor";
export { formatSection, formatBullets, formatDocument } from "./content-formatter";
export {
  buildMetaBlock,
  deriveSeoMeta,
  buildSchemaOrgArticle,
  buildOpenGraphTags,
  buildTwitterCardTags,
  generateSlug,
  type SeoMeta,
} from "./seo-utils";
export {
  formatBookSection,
  formatAcademicContent,
  type BookSectionInput,
  type AcademicHeading,
  type FormatAcademicContentInput,
} from "./book-formatter";
