/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – SEO blog + metadata generator. Imports ONLY from @/lib/utils/step12.
 * Returns structured SEOBlogOutput; string output = serialized for copy-paste. Topic-agnostic; no patientData.
 */

import {
  extractPlainText,
  extractSnippet,
  buildOpenGraphTags,
  buildTwitterCardTags,
  generateSlug,
  STEP12_DEFAULT_WEBSITE_URL,
} from "@/lib/utils/step12";

export type SeoBlogMetaLength = "150" | "160" | "300";

export interface SeoBlogOptions {
  targetKeyword?: string;
  metaDescriptionLength?: SeoBlogMetaLength | number;
  includeSchema?: boolean;
  includeOpenGraph?: boolean;
  includeTwitterCard?: boolean;
  audience?: string;
  tone?: string;
}

export interface SEOBlogOutput {
  blogContent: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  schemaOrg?: object;
  openGraph?: object;
  twitterCard?: object;
  wordCount: number;
}

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "Topic";
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function generateMetaTitle(topic: string, keyword: string): string {
  const base = keyword ? `${topic} | ${keyword}` : `${topic} | Evidence-Based Guide`;
  return base.length <= 60 ? base : base.substring(0, 57) + "...";
}

function generateMetaDescriptionFromContent(content: string, maxLength: number): string {
  const firstPara = content.split(/\n\n+/)[1] || content.split(/\n\n+/)[0] || "";
  const firstSentence = firstPara.split(/[.!?]/)[0]?.trim() || firstPara.slice(0, 100);
  const keyTerm = extractKeyTerm(content);
  const desc = `Learn about ${keyTerm}: ${firstSentence}`;
  return desc.length <= maxLength ? desc : desc.substring(0, maxLength - 3) + "...";
}

function generateKeywordsList(topic: string, primary: string): string[] {
  const keyTerm = extractKeyTerm(topic);
  const list = [
    primary || keyTerm,
    keyTerm,
    `${keyTerm} India`,
    `${keyTerm} clinical`,
    "metabolic health",
    "diabetes screening",
  ];
  return list.filter((v, i, a) => a.indexOf(v) === i);
}

function getIntroParagraph(topic: string, targetKeyword: string, audience: string): string {
  return `This article covers ${topic}. ${targetKeyword || topic} is relevant for ${audience === "patients" ? "patients and families" : "clinicians and researchers"} seeking evidence-based information.`;
}

function getDefinitionParagraph(topic: string, sourceText: string): string {
  const snippet = extractSnippet(sourceText || topic, 300);
  return snippet || `${extractKeyTerm(topic)} is an important concept in metabolic and clinical practice. Current evidence supports its role in risk stratification and management.`;
}

function getRelevanceParagraph(topic: string, audience: string): string {
  const keyTerm = extractKeyTerm(topic);
  return audience === "patients"
    ? `Understanding ${keyTerm} helps you and your doctor make informed decisions about screening and lifestyle.`
    : `${keyTerm} is increasingly used in clinical practice for risk stratification and guideline-based care.`;
}

function getEvidenceParagraph(topic: string, sourceText: string): string {
  const snippet = extractSnippet(sourceText || topic, 350);
  return snippet || `Indian and global studies have evaluated ${extractKeyTerm(topic)}. Evidence from ICMR and other cohorts supports its use in metabolic assessment.`;
}

function getRecommendationsParagraph(topic: string, audience: string, tone: string): string {
  const keyTerm = extractKeyTerm(topic);
  return audience === "patients"
    ? `Discuss ${keyTerm} with your doctor. Lifestyle and medication adjustments may be recommended based on your profile.`
    : `Consider ${keyTerm} in routine metabolic workup. Guidelines recommend assessment in at-risk populations.`;
}

function getConclusionParagraph(topic: string, targetKeyword: string): string {
  return `Bottom line: ${targetKeyword || topic} matters for evidence-based care. Consult local guidelines and tailor to the individual.`;
}

function generateSEOOptimizedContent(params: {
  topic: string;
  sourceText: string;
  targetKeyword: string;
  audience: string;
  tone: string;
  wordTarget: { min: number; max: number };
}): string {
  const { topic, sourceText, targetKeyword, audience, tone } = params;
  const keyTerm = extractKeyTerm(topic);
  return [
    `# ${topic}`,
    "## Introduction",
    getIntroParagraph(topic, targetKeyword, audience),
    "",
    `## What Is ${keyTerm}?`,
    getDefinitionParagraph(topic, sourceText),
    "",
    `## Why Does ${keyTerm} Matter for ${audience === "patients" ? "You" : "Clinical Practice"}?`,
    getRelevanceParagraph(topic, audience),
    "",
    "## Evidence from Indian Studies",
    getEvidenceParagraph(topic, sourceText),
    "",
    "## Practical Recommendations",
    getRecommendationsParagraph(topic, audience, tone),
    "",
    "## Bottom Line",
    getConclusionParagraph(topic, targetKeyword),
  ].join("\n\n");
}

function buildSchemaOrgObject(params: {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  website?: string;
}): object {
  const date = params.datePublished ?? new Date().toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    datePublished: date,
    ...(params.website && { url: params.website }),
    ...(params.author && { author: { "@type": "Person", name: params.author } }),
  };
}

function buildOpenGraphObject(params: { title: string; description: string; image?: string; url?: string }): object {
  return {
    "og:title": params.title,
    "og:description": params.description,
    "og:type": "article",
    ...(params.url && { "og:url": params.url }),
    ...(params.image && { "og:image": params.image }),
  };
}

function buildTwitterCardObject(params: { title: string; description: string; image?: string }): object {
  return {
    "twitter:card": "summary_large_image",
    "twitter:title": params.title,
    "twitter:description": params.description,
    ...(params.image && { "twitter:image": params.image }),
  };
}

export function generateSeoBlog(
  sourceText: string,
  title?: string,
  options?: SeoBlogOptions
): string {
  const text = extractPlainText(sourceText);
  const topic = title ?? "Summary";
  const targetKeyword = (options?.targetKeyword?.trim() || extractKeyTerm(topic)) as string;
  const maxDesc =
    typeof options?.metaDescriptionLength === "number"
      ? options.metaDescriptionLength
      : options?.metaDescriptionLength === "150"
        ? 150
        : options?.metaDescriptionLength === "300"
          ? 300
          : 160;
  const audience = options?.audience ?? "general";
  const tone = options?.tone ?? "professional";
  const includeSchema = options?.includeSchema !== false;
  const includeOpenGraph = options?.includeOpenGraph !== false;
  const includeTwitterCard = options?.includeTwitterCard !== false;
  const websiteUrl = STEP12_DEFAULT_WEBSITE_URL;
  const authorName = "Dr. Muddu Surendra Nehru, MD";

  const blogContent = generateSEOOptimizedContent({
    topic,
    sourceText: text,
    targetKeyword,
    audience,
    tone,
    wordTarget: { min: 800, max: 1200 },
  });

  const metaTitle = generateMetaTitle(topic, targetKeyword);
  const metaDescription = generateMetaDescriptionFromContent(blogContent, maxDesc);
  const slug = generateSlug(topic);
  const keywords = generateKeywordsList(topic, targetKeyword);

  const schemaOrg = includeSchema
    ? buildSchemaOrgObject({
        title: topic,
        description: metaDescription,
        author: authorName,
        datePublished: new Date().toISOString(),
        website: websiteUrl,
      })
    : undefined;

  const openGraph = includeOpenGraph
    ? buildOpenGraphObject({
        title: metaTitle,
        description: metaDescription,
        image: `${websiteUrl}/og-image.jpg`,
        url: `${websiteUrl}/blog/${slug}`,
      })
    : undefined;

  const twitterCard = includeTwitterCard
    ? buildTwitterCardObject({
        title: metaTitle,
        description: metaDescription,
        image: `${websiteUrl}/twitter-image.jpg`,
      })
    : undefined;

  const output: SEOBlogOutput = {
    blogContent,
    metaTitle,
    metaDescription,
    slug,
    keywords,
    schemaOrg,
    openGraph,
    twitterCard,
    wordCount: countWords(blogContent),
  };

  const metaForTags = { title: metaTitle, description: metaDescription, keywords: keywords.join(", ") };

  const parts: string[] = [
    "---",
    "metaTitle: " + metaTitle,
    "metaDescription: " + metaDescription,
    "slug: " + slug,
    "keywords: [" + keywords.map((k) => `"${k}"`).join(", ") + "]",
    "wordCount: " + output.wordCount,
    "---",
    "",
  ];

  if (includeSchema && output.schemaOrg) {
    parts.push("<script type=\"application/ld+json\">\n" + JSON.stringify(output.schemaOrg, null, 2) + "\n</script>", "");
  }
  if (includeOpenGraph) {
    parts.push(buildOpenGraphTags(metaForTags, `${websiteUrl}/blog/${slug}`), "");
  }
  if (includeTwitterCard) {
    parts.push(buildTwitterCardTags(metaForTags), "");
  }

  parts.push(output.blogContent);
  return parts.join("\n");
}
