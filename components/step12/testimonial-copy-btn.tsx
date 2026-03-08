"use client";

import { useState } from "react";
import {
  getSimpleTestimonialScript,
  getSimpleTestimonialVideoBrief,
} from "@/lib/utils/testimonials/simple";

const btnClass =
  "inline-flex items-center gap-2 rounded-lg bg-white border-2 border-violet-600 text-violet-700 px-4 py-2 text-sm font-medium hover:bg-violet-50";

/**
 * Copy testimonial script or full 45s video brief to clipboard. Isolated: no research steps, no clinical generators.
 */
export default function TestimonialCopyBtn() {
  const [copiedWhich, setCopiedWhich] = useState<"script" | "brief" | null>(null);

  const copyScript = () => {
    navigator.clipboard?.writeText(getSimpleTestimonialScript());
    setCopiedWhich("script");
    setTimeout(() => setCopiedWhich(null), 2000);
  };

  const copyBrief = () => {
    navigator.clipboard?.writeText(getSimpleTestimonialVideoBrief());
    setCopiedWhich("brief");
    setTimeout(() => setCopiedWhich(null), 2000);
  };

  return (
    <div className="inline-flex flex-wrap gap-2">
      <button type="button" onClick={copyScript} className={btnClass}>
        {copiedWhich === "script" ? "Copied!" : "Copy testimonial script"}
      </button>
      <button type="button" onClick={copyBrief} className={btnClass}>
        {copiedWhich === "brief" ? "Copied!" : "Copy full brief"}
      </button>
    </div>
  );
}
