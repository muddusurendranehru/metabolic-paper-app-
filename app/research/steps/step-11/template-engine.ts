/**
 * Step 11: Core logic – topic-agnostic content generation.
 * Orchestrates platform-templates. No imports from step-1 to step-6.
 * Patient names are never revealed: keyFindings is redacted before use.
 */

import { redactPatientIdentifiersFromText } from "@/lib/utils/anonymize";
import type { ContentAmplificationInput } from "@/lib/utils/content-amplification-schema";
import type { TopicInput } from "./topic-schema";
import { contentToTopicInput, sanitizeTopicInput } from "./topic-schema";
import { generateTwitterThread, generateLinkedInPost, generateInstagramCaption } from "./platform-templates/social-media";
import { generateShortsScript, generateLongFormScript } from "./platform-templates/youtube-script";
import { generateLectureSlides } from "./platform-templates/lecture-slides";
import { generateBlogPost } from "./platform-templates/blog-post";
import { generateMCQBank, type MCQItem } from "./platform-templates/mcq-generator";

export type { MCQItem };

export interface AmplificationOutput {
  twitter: string[];
  linkedin: string;
  instagram: string;
  youtubeShorts: string;
  youtubeLong: string;
  lectureSlides: string;
  blog: string;
  mcq: MCQItem[];
}

/** Generate all platform content from sanitized topic input. Key findings redacted (no patient names). */
export function generateAll(input: Partial<TopicInput>): AmplificationOutput {
  const safe = sanitizeTopicInput(input);
  safe.keyFindings = redactPatientIdentifiersFromText(safe.keyFindings);
  return {
    twitter: generateTwitterThread(safe),
    linkedin: generateLinkedInPost(safe),
    instagram: generateInstagramCaption(safe),
    youtubeShorts: generateShortsScript(safe),
    youtubeLong: generateLongFormScript(safe),
    lectureSlides: generateLectureSlides(safe),
    blog: generateBlogPost(safe),
    mcq: generateMCQBank(safe),
  };
}

/** Generate from universal ContentAmplificationInput; converts to TopicInput then runs generateAll. */
export function generateAllFromContent(content: Partial<ContentAmplificationInput>): AmplificationOutput {
  return generateAll(contentToTopicInput(content));
}
