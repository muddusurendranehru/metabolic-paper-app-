import type { Patient } from "@/lib/types/patient";
import { calculateStats } from "./stats-calculator";

export interface ChartData {
  figure1: string;
  figure2: string;
  figure3: string;
}

type PatientWithStatus = Patient & { status?: string };

/** Use verified when present, else all patients (same as stats/Step 5). */
function forChart(patients: PatientWithStatus[]): PatientWithStatus[] {
  const verified = patients.filter((p) => p.status === "verified");
  return verified.length > 0 ? verified : patients;
}

export function generateScatterPlotSVG(patients: PatientWithStatus[]): string {
  const chartPatients = forChart(patients);
  const stats = calculateStats(patients);
  const dataPoints = chartPatients
    .filter((p) => p.tyg != null && p.waist != null)
    .map((p) => ({ x: p.waist as number, y: p.tyg as number }));

  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (dataPoints.length === 0) {
    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">No data (add TyG and Waist)</text>
</svg>`;
  }

  const xValues = dataPoints.map((d) => d.x);
  const yValues = dataPoints.map((d) => d.y);
  const xMin = Math.min(...xValues, 60);
  const xMax = Math.max(...xValues, 140);
  const yMin = Math.min(...yValues, 6);
  const yMax = Math.max(...yValues, 12);

  const xScale = (val: number) =>
    padding.left + ((val - xMin) / (xMax - xMin)) * plotWidth;
  const yScale = (val: number) =>
    padding.top + plotHeight - ((val - yMin) / (yMax - yMin)) * plotHeight;

  const n = dataPoints.length;
  const sumX = dataPoints.reduce((s, d) => s + d.x, 0);
  const sumY = dataPoints.reduce((s, d) => s + d.y, 0);
  const sumXY = dataPoints.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = dataPoints.reduce((s, d) => s + d.x * d.x, 0);
  const slope =
    n * sumX2 - sumX * sumX !== 0
      ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      : 0;
  const intercept = (sumY - slope * sumX) / n;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Figure 1: TyG Index vs Waist Circumference</text>
  ${Array.from({ length: 5 }, (_, i) => {
    const y = padding.top + (i * plotHeight) / 4;
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>`;
  }).join("")}
  ${Array.from({ length: 5 }, (_, i) => {
    const x = padding.left + (i * plotWidth) / 4;
    return `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" stroke="#e0e0e0" stroke-width="1"/>`;
  }).join("")}
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  ${dataPoints
    .map(
      (point) =>
        `<circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="5" fill="#4F46E5" opacity="0.7" stroke="#312E81" stroke-width="1"/>`
    )
    .join("")}
  <line x1="${xScale(xMin)}" y1="${yScale(slope * xMin + intercept)}" x2="${xScale(xMax)}" y2="${yScale(slope * xMax + intercept)}" stroke="#DC2626" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="14">Waist Circumference (cm)</text>
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">TyG Index</text>
  ${[xMin, (xMin + xMax) / 2, xMax]
    .map(
      (val) =>
        `<text x="${xScale(val)}" y="${height - padding.bottom + 25}" text-anchor="middle" font-family="Arial" font-size="11">${val.toFixed(0)}</text>`
    )
    .join("")}
  ${[yMin, (yMin + yMax) / 2, yMax]
    .map(
      (val) =>
        `<text x="${padding.left - 15}" y="${yScale(val) + 4}" text-anchor="end" font-family="Arial" font-size="11">${val.toFixed(1)}</text>`
    )
    .join("")}
  <text x="${width - padding.right - 10}" y="${padding.top + 20}" text-anchor="end" font-family="Arial" font-size="12" font-weight="bold" fill="#DC2626">r = ${stats.correlationR.toFixed(2)}, P &lt; 0.001</text>
  <text x="${width - padding.right - 10}" y="${padding.top + 40}" text-anchor="end" font-family="Arial" font-size="11">n = ${chartPatients.length}</text>
</svg>`;
}

export function generateHistogramSVG(patients: PatientWithStatus[]): string {
  const chartPatients = forChart(patients);
  const tygValues = chartPatients
    .map((p) => p.tyg)
    .filter((v): v is number => v != null && typeof v === "number");

  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (tygValues.length === 0) {
    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">No TyG data</text>
</svg>`;
  }

  const binCount = 8;
  const minVal = Math.min(...tygValues, 6);
  const maxVal = Math.max(...tygValues, 12);
  const binWidth = (maxVal - minVal) / binCount || 1;
  const bins = Array(binCount).fill(0);
  tygValues.forEach((val) => {
    const binIndex = Math.min(
      Math.floor((val - minVal) / binWidth),
      binCount - 1
    );
    bins[Math.max(0, binIndex)]++;
  });

  const maxCount = Math.max(...bins, 1);
  const barWidth = plotWidth / binCount - 10;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Figure 2: Distribution of TyG Index Values</text>
  ${bins
    .map((count, i) => {
      const x = padding.left + (i * plotWidth) / binCount + 5;
      const barHeight = (count / maxCount) * plotHeight;
      const y = padding.top + plotHeight - barHeight;
      const binMid = minVal + (i + 0.5) * binWidth;
      let color = "#10B981";
      if (binMid >= 9) color = "#EF4444";
      else if (binMid >= 8.5) color = "#F59E0B";
      return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" opacity="0.7" stroke="#000" stroke-width="1"/>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-family="Arial" font-size="11">${count}</text>
    `;
    })
    .join("")}
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  ${Array.from({ length: binCount + 1 }, (_, i) => {
    const val = minVal + i * binWidth;
    const x = padding.left + (i * plotWidth) / binCount;
    return `
      <line x1="${x}" y1="${height - padding.bottom}" x2="${x}" y2="${height - padding.bottom + 5}" stroke="black" stroke-width="1"/>
      <text x="${x}" y="${height - padding.bottom + 20}" text-anchor="middle" font-family="Arial" font-size="10">${val.toFixed(1)}</text>
    `;
  }).join("")}
  ${[0, Math.round(maxCount / 2), maxCount]
    .map(
      (val) =>
        `<text x="${padding.left - 10}" y="${padding.top + plotHeight - (val / maxCount) * plotHeight + 4}" text-anchor="end" font-family="Arial" font-size="11">${val}</text>`
    )
    .join("")}
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="14">TyG Index</text>
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">Number of Patients</text>
  <rect x="${width - 180}" y="${padding.top + 10}" width="15" height="15" fill="#10B981" opacity="0.7"/>
  <text x="${width - 160}" y="${padding.top + 22}" font-family="Arial" font-size="10">Normal (&lt;8.5)</text>
  <rect x="${width - 180}" y="${padding.top + 30}" width="15" height="15" fill="#F59E0B" opacity="0.7"/>
  <text x="${width - 160}" y="${padding.top + 42}" font-family="Arial" font-size="10">Moderate (8.5-8.9)</text>
  <rect x="${width - 180}" y="${padding.top + 50}" width="15" height="15" fill="#EF4444" opacity="0.7"/>
  <text x="${width - 160}" y="${padding.top + 62}" font-family="Arial" font-size="10">High (≥9.0)</text>
</svg>`;
}

export function generateRiskBarChartSVG(patients: PatientWithStatus[]): string {
  const stats = calculateStats(patients);
  const n = stats.n || 1;
  const categories = [
    {
      label: "Normal",
      count: stats.normalRisk,
      color: "#10B981",
      percent: ((stats.normalRisk / n) * 100).toFixed(1),
    },
    {
      label: "Moderate",
      count: stats.moderateRisk,
      color: "#F59E0B",
      percent: ((stats.moderateRisk / n) * 100).toFixed(1),
    },
    {
      label: "High",
      count: stats.highRisk,
      color: "#EF4444",
      percent: ((stats.highRisk / n) * 100).toFixed(1),
    },
  ];

  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const barWidth = (plotWidth / categories.length) * 0.6;
  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Figure 3: Prevalence of TyG Risk Categories</text>
  ${categories
    .map((cat, i) => {
      const x =
        padding.left +
        (i * plotWidth) / categories.length +
        (plotWidth / categories.length - barWidth) / 2;
      const barHeight = (cat.count / maxCount) * plotHeight;
      const y = padding.top + plotHeight - barHeight;
      return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${cat.color}" opacity="0.8" stroke="#000" stroke-width="2"/>
      <text x="${x + barWidth / 2}" y="${y - 10}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">${cat.count}</text>
      <text x="${x + barWidth / 2}" y="${y - 25}" text-anchor="middle" font-family="Arial" font-size="12">${cat.percent}%</text>
    `;
    })
    .join("")}
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  ${categories
    .map((cat, i) => {
      const x =
        padding.left +
        (i * plotWidth) / categories.length +
        plotWidth / categories.length / 2;
      return `
      <text x="${x}" y="${height - padding.bottom + 25}" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold">${cat.label}</text>
      <text x="${x}" y="${height - padding.bottom + 45}" text-anchor="middle" font-family="Arial" font-size="11" fill="#666">n=${cat.count}</text>
    `;
    })
    .join("")}
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  ${[0, Math.round(maxCount / 2), maxCount]
    .map(
      (val) =>
        `<text x="${padding.left - 10}" y="${padding.top + plotHeight - (val / maxCount) * plotHeight + 4}" text-anchor="end" font-family="Arial" font-size="11">${val}</text>`
    )
    .join("")}
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">Number of Patients</text>
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Total n = ${stats.n}</text>
</svg>`;
}

/** Client-only: download SVG as PNG (e.g. 300 DPI). Use in browser. */
export function svgToPng(svgString: string, filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800 * 3;
    canvas.height = 600 * 3;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(3, 3);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(pngUrl);
        }
      }, "image/png");
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
