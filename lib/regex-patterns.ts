/**
 * Indian lab report regex patterns for TG, Glucose, HDL extraction.
 * Used by PDF parsing and API routes.
 */

export const TG_PATTERNS = [
  /triglycerides?[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /tg[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /trig[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /serum\s*triglycerides?[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /triglyceride[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
];

export const GLUCOSE_PATTERNS = [
  /glucose[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /fbs[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /fasting\s*(?:blood\s*)?sugar[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /blood\s*sugar[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /fasting\s*glucose[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /random\s*glucose[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /s\.?\s*glucose[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /(?:plasma|serum)\s*glucose[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
];

export const HDL_PATTERNS = [
  /hdl[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /hdl\s*cholesterol[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
  /hdl-c[:\s\n\r-]*(\d+(?:\.\d+)?)/i,
];
