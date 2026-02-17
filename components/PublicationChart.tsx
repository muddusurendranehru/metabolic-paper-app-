"use client";

import * as React from "react";

/**
 * Wrapper for chart/content that can be captured at 300dpi for publication.
 * Use with html2canvas or similar for PNG export.
 */
export const PublicationChart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function PublicationChart({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={className}
      data-publication-chart
      style={{ background: "white", color: "#111" }}
      {...props}
    >
      {children}
    </div>
  );
});
