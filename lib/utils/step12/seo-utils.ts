/**
 * Step 12 – SEO metadata and schema.org. Isolated in lib/utils/step12/.
 * No patientData; topic-agnostic. For use by blog / seo-blog generators.
 */

/**
 * Generate meta title: clean topic + " | Evidence-Based Guide", max 60 chars.
 */
export function generateMetaTitle(topic: string, keyword: string): string {
  const raw = (topic ?? "").replace(/^"+|"+$/g, "").replace(/\s+/g, " ").trim();
  const cleanTopic = raw || (keyword ?? "").replace(/^"+|"+$/g, "").replace(/\s+/g, " ").trim() || "Evidence-Based Health";
  const base = `${cleanTopic} | Evidence-Based Guide`;
  return base.length <= 60 ? base : base.substring(0, 57) + "...";
}

/** Strip YAML front matter (--- ... ---) so metadata is derived from real body only. */
function stripFrontMatter(raw: string): string {
  const s = (raw ?? "").trim();
  if (!s.startsWith("---")) return s;
  const end = s.indexOf("\n---", 3);
  if (end === -1) return s;
  return s.slice(end + 4).trim();
}

/**
 * Generate meta description from content: first meaningful paragraph (skip markdown headers and front matter), cap length.
 * No "#" or placeholder-only output.
 */
export function generateMetaDescription(content: string, maxLength: number): string {
  const body = stripFrontMatter(content ?? "");
  const paragraphs = body.split("\n\n").filter(
    (p) => p.trim() && !p.startsWith("#") && !p.startsWith("##") && !p.startsWith("title:") && !p.startsWith("description:")
  );
  const firstPara = paragraphs[0]?.split(". ")[0] ?? "";
  const cleanPara = firstPara.replace(/[#*_`]/g, "").trim();
  const meaningful = cleanPara.length > 20 ? cleanPara : "Evidence-based health information for patients and clinicians.";
  const desc = `Learn about ${meaningful}`;
  return desc.length <= maxLength ? desc : desc.substring(0, maxLength - 3) + "...";
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string;
}

/**
 * Build YAML-like front matter for title, description, keywords.
 */
export function buildMetaBlock(meta: SeoMeta): string {
  return [
    "---",
    "title: " + meta.title,
    "description: " + meta.description,
    "keywords: " + meta.keywords,
    "---",
  ].join("\n");
}

/**
 * Derive SEO meta from title and summary text (e.g. for blog).
 * Optional targetKeyword prioritised in title/keywords; maxDescLength caps description.
 */
export function deriveSeoMeta(
  title: string,
  summary: string,
  opts?: { targetKeyword?: string; maxDescLength?: number }
): SeoMeta {
  const maxLen = opts?.maxDescLength ?? 160;
  const metaTitle = opts?.targetKeyword
    ? opts.targetKeyword.slice(0, 60)
    : title
      ? title.slice(0, 60)
      : "Medical & Health Insights";
  const metaDesc = summary.slice(0, maxLen);
  const seed = (opts?.targetKeyword ? opts.targetKeyword + " " : "") + title + " " + summary;
  const words = seed.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  const keywords = words
    .filter((w) => w.length > 3 && !seen.has(w.toLowerCase()) && seen.add(w.toLowerCase()))
    .slice(0, 8)
    .join(", ");
  return { title: metaTitle, description: metaDesc, keywords: keywords || metaTitle };
}

/**
 * Build Open Graph meta tags (HTML comment block for copy-paste into head).
 */
export function buildOpenGraphTags(meta: SeoMeta, url?: string): string {
  const lines = [
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:type" content="article" />`,
    ...(url ? [`<meta property="og:url" content="${escapeHtml(url)}" />`] : []),
  ];
  return "<!-- Open Graph -->\n" + lines.join("\n");
}

/**
 * Build Twitter Card meta tags (HTML comment block for copy-paste into head).
 */
export function buildTwitterCardTags(meta: SeoMeta): string {
  const lines = [
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ];
  return "<!-- Twitter Card -->\n" + lines.join("\n");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Generate URL-friendly slug from topic (topic-agnostic).
 */
export function generateSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

/**
 * Generate schema.org Article JSON-LD snippet (optional embed in page).
 */
export function buildSchemaOrgArticle(params: {
  title: string;
  description: string;
  datePublished?: string;
  url?: string;
  authorName?: string;
}): string {
  const date = params.datePublished ?? new Date().toISOString().slice(0, 10);
  const script = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    datePublished: date,
    ...(params.url && { url: params.url }),
    ...(params.authorName && { author: { "@type": "Person", name: params.authorName } }),
  };
  return "<script type=\"application/ld+json\">\n" + JSON.stringify(script, null, 2) + "\n</script>";
}

/**
 * Generate schema.org Article JSON-LD with proper escaping (no broken quotes/newlines).
 */
export function generateSchemaOrg(params: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  website: string;
}): string {
  const script = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: (params.title ?? "").replace(/\n/g, " ").trim(),
    description: (params.description ?? "").replace(/\n/g, " ").trim(),
    author: { "@type": "Person", name: (params.author ?? "").replace(/\n/g, " ").trim() },
    datePublished: params.datePublished ?? new Date().toISOString().slice(0, 10),
    url: params.website ?? "",
  };
  return "<script type=\"application/ld+json\">\n" + JSON.stringify(script, null, 2) + "\n</script>";
}
