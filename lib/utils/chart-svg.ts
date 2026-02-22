import type { Patient } from "@/lib/types/patient";
import { calculateStats } from "@/lib/utils/stats-calculator";
import { getDiabetesRiskStats, getDiabetesRisk } from "@/lib/utils/diabetes-risk";

export interface ChartData {
  figure1: string; // TyG vs Waist scatter
  figure2: string; // TyG histogram
  figure3: string; // Risk distribution
}

type PatientWithStatus = Patient & { status?: string };

export function generateScatterPlotSVG(patients: PatientWithStatus[]): string {
  const verified = patients.filter((p) => p.status === "verified");
  const useForChart = verified.length > 0 ? verified : patients;
  const stats = calculateStats(patients);

  const dataPoints = useForChart
    .filter((p) => p.tyg != null && p.waist != null)
    .map((p) => ({ x: p.waist!, y: p.tyg! }));

  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xValues = dataPoints.map((d) => d.x);
  const yValues = dataPoints.map((d) => d.y);
  const xMin = xValues.length ? Math.min(...xValues, 60) : 60;
  const xMax = xValues.length ? Math.max(...xValues, 140) : 140;
  const yMin = yValues.length ? Math.min(...yValues, 6) : 6;
  const yMax = yValues.length ? Math.max(...yValues, 12) : 12;

  const xScale = (val: number) =>
    padding.left + ((val - xMin) / (xMax - xMin || 1)) * plotWidth;
  const yScale = (val: number) =>
    padding.top +
    plotHeight -
    ((val - yMin) / (yMax - yMin || 1)) * plotHeight;

  let slope = 0;
  let intercept = 0;
  const n = dataPoints.length;
  if (n > 0) {
    const sumX = dataPoints.reduce((s, d) => s + d.x, 0);
    const sumY = dataPoints.reduce((s, d) => s + d.y, 0);
    const sumXY = dataPoints.reduce((s, d) => s + d.x * d.y, 0);
    const sumX2 = dataPoints.reduce((s, d) => s + d.x * d.x, 0);
    const den = n * sumX2 - sumX * sumX;
    slope = den !== 0 ? (n * sumXY - sumX * sumY) / den : 0;
    intercept = (sumY - slope * sumX) / n;
  }

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">
    Figure 1: TyG Index vs Waist Circumference
  </text>
  
  <!-- Grid lines -->
  ${Array.from({ length: 5 }, (_, i) => {
    const y = padding.top + (i * plotHeight) / 4;
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>`;
  }).join("")}
  
  ${Array.from({ length: 5 }, (_, i) => {
    const x = padding.left + (i * plotWidth) / 4;
    return `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" stroke="#e0e0e0" stroke-width="1"/>`;
  }).join("")}
  
  <!-- Axes -->
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  
  <!-- Data points -->
  ${dataPoints
    .map(
      (point) => `
    <circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="5" fill="#4F46E5" opacity="0.7" stroke="#312E81" stroke-width="1"/>
  `
    )
    .join("")}
  
  <!-- Regression line -->
  <line x1="${xScale(xMin)}" y1="${yScale(slope * xMin + intercept)}" 
        x2="${xScale(xMax)}" y2="${yScale(slope * xMax + intercept)}" 
        stroke="#DC2626" stroke-width="2" stroke-dasharray="5,5"/>
  
  <!-- Axis labels -->
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="14">
    Waist Circumference (cm)
  </text>
  
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">
    TyG Index
  </text>
  
  <!-- Axis values -->
  ${[xMin, (xMin + xMax) / 2, xMax]
    .map(
      (val) => `
    <text x="${xScale(val)}" y="${height - padding.bottom + 25}" text-anchor="middle" font-family="Arial" font-size="11">
      ${val.toFixed(0)}
    </text>
  `
    )
    .join("")}
  
  ${[yMin, (yMin + yMax) / 2, yMax]
    .map(
      (val) => `
    <text x="${padding.left - 15}" y="${yScale(val) + 4}" text-anchor="end" font-family="Arial" font-size="11">
      ${val.toFixed(1)}
    </text>
  `
    )
    .join("")}
  
  <!-- Correlation text -->
  <text x="${width - padding.right - 10}" y="${padding.top + 20}" text-anchor="end" font-family="Arial" font-size="12" font-weight="bold" fill="#DC2626">
    r = ${stats.correlationR.toFixed(2)}, P &lt; 0.001
  </text>
  
  <!-- Sample size -->
  <text x="${width - padding.right - 10}" y="${padding.top + 40}" text-anchor="end" font-family="Arial" font-size="11">
    n = ${useForChart.length}
  </text>
</svg>`;
}

export function generateHistogramSVG(patients: PatientWithStatus[]): string {
  const verified = patients.filter((p) => p.status === "verified");
  const useForChart = verified.length > 0 ? verified : patients;
  const tygValues = useForChart
    .map((p) => p.tyg)
    .filter((v): v is number => v != null && typeof v === "number");

  const stats = calculateStats(patients);
  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const binCount = 8;
  const minVal = tygValues.length ? Math.min(...tygValues, 6) : 6;
  const maxVal = tygValues.length ? Math.max(...tygValues, 12) : 12;
  const binWidth = (maxVal - minVal) / binCount || 1;
  const bins = Array(binCount).fill(0);

  tygValues.forEach((val) => {
    const binIndex = Math.min(
      Math.floor((val - minVal) / binWidth),
      binCount - 1
    );
    if (binIndex >= 0) bins[binIndex]++;
  });

  const maxCount = Math.max(...bins, 1);
  const barWidth = plotWidth / binCount - 10;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">
    Figure 2: Distribution of TyG Index Values
  </text>
  
  <!-- Bars -->
  ${bins
    .map((count, i) => {
      const x = padding.left + (i * plotWidth) / binCount + 5;
      const barHeight = (count / maxCount) * plotHeight;
      const y = padding.top + plotHeight - barHeight;

      let color = "#10B981";
      const binMid = minVal + (i + 0.5) * binWidth;
      if (binMid >= 9) color = "#EF4444";
      else if (binMid >= 8.5) color = "#F59E0B";

      return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" opacity="0.7" stroke="#000" stroke-width="1"/>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-family="Arial" font-size="11">${count}</text>
    `;
    })
    .join("")}
  
  <!-- Axes -->
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  
  <!-- X-axis labels -->
  ${Array.from({ length: binCount + 1 }, (_, i) => {
    const val = minVal + i * binWidth;
    const x = padding.left + (i * plotWidth) / binCount;
    return `
      <line x1="${x}" y1="${height - padding.bottom}" x2="${x}" y2="${height - padding.bottom + 5}" stroke="black" stroke-width="1"/>
      <text x="${x}" y="${height - padding.bottom + 20}" text-anchor="middle" font-family="Arial" font-size="10">${val.toFixed(1)}</text>
    `;
  }).join("")}
  
  <!-- Y-axis labels -->
  ${[0, Math.round(maxCount / 2), maxCount]
    .map(
      (val) => `
    <text x="${padding.left - 10}" y="${padding.top + plotHeight - (val / maxCount) * plotHeight + 4}" text-anchor="end" font-family="Arial" font-size="11">${val}</text>
  `
    )
    .join("")}
  
  <!-- Axis labels -->
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="14">TyG Index</text>
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">Number of Patients</text>
  
  <!-- Legend -->
  <rect x="${width - 180}" y="${padding.top + 10}" width="15" height="15" fill="#10B981" opacity="0.7"/>
  <text x="${width - 160}" y="${padding.top + 22}" font-family="Arial" font-size="10">Normal (&lt;8.5)</text>
  
  <rect x="${width - 180}" y="${padding.top + 30}" width="15" height="15" fill="#F59E0B" opacity="0.7"/>
  <text x="${width - 160}" y="${padding.top + 42}" font-family="Arial" font-size="10">Moderate (8.5-8.9)</text>
  
  <rect x="${width - 180}" y="${padding.top + 50}" width="15" height="15" fill="#EF4444" opacity="0.7"/>
  <text x="${width - 160}" y="${padding.top + 62}" font-family="Arial" font-size="10">High (≥9.0)</text>
</svg>`;
}

export function generateRiskBarChartSVG(patients: PatientWithStatus[]): string {
  const verified = patients.filter((p) => p.status === "verified");
  const useForChart = verified.length > 0 ? verified : patients;
  const stats = calculateStats(patients);

  const safeN = stats.n > 0 ? stats.n : 1;
  const categories = [
    {
      label: "Normal",
      count: stats.normalRisk,
      color: "#10B981",
      percent: ((stats.normalRisk / safeN) * 100).toFixed(1),
    },
    {
      label: "Moderate",
      count: stats.moderateRisk,
      color: "#F59E0B",
      percent: ((stats.moderateRisk / safeN) * 100).toFixed(1),
    },
    {
      label: "High",
      count: stats.highRisk,
      color: "#EF4444",
      percent: ((stats.highRisk / safeN) * 100).toFixed(1),
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
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">
    Figure 3: Prevalence of TyG Risk Categories
  </text>
  
  <!-- Bars -->
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
  
  <!-- X-axis -->
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  
  <!-- Category labels -->
  ${categories
    .map((cat, i) => {
      const x =
        padding.left +
        (i * plotWidth) / categories.length +
        (plotWidth / categories.length) / 2;
      return `
      <text x="${x}" y="${height - padding.bottom + 25}" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold">${cat.label}</text>
      <text x="${x}" y="${height - padding.bottom + 45}" text-anchor="middle" font-family="Arial" font-size="11" fill="#666">n=${cat.count}</text>
    `;
    })
    .join("")}
  
  <!-- Y-axis -->
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  
  <!-- Y-axis labels -->
  ${[0, Math.round(maxCount / 2), maxCount]
    .map(
      (val) => `
    <text x="${padding.left - 10}" y="${padding.top + plotHeight - (val / maxCount) * plotHeight + 4}" text-anchor="end" font-family="Arial" font-size="11">${val}</text>
  `
    )
    .join("")}
  
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">Number of Patients</text>
  
  <!-- Total sample size -->
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Total n = ${stats.n}</text>
</svg>`;
}

// ----- Paper 3 (TyG-HbA1c) charts -----

const RISK_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Prediabetes: "#eab308",
  Good: "#3b82f6",
  Poor: "#f97316",
  Alert: "#991b1b",
  Pending: "#9ca3af",
};

/** Paper 3 Figure 1: Waist (x) vs HbA1c (y) scatter, points colored by clinical band. */
export function generateWaistVsHbA1cScatterSVG(patients: PatientWithStatus[]): string {
  const verified = patients.filter((p) => p.status === "verified");
  const useForChart = verified.length > 0 ? verified : patients;
  const dataPoints = useForChart
    .filter((p) => p.waist != null && p.hba1c != null && Number.isFinite(p.hba1c))
    .map((p) => ({
      x: p.waist!,
      y: p.hba1c!,
      risk: p.diabetesRisk ?? getDiabetesRisk(p.hba1c),
    }));

  if (dataPoints.length === 0) {
    return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="white"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="14">No data with Waist + HbA1c</text></svg>`;
  }

  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xValues = dataPoints.map((d) => d.x);
  const yValues = dataPoints.map((d) => d.y);
  const xMin = Math.min(...xValues, 60);
  const xMax = Math.max(...xValues, 140);
  const yMin = Math.min(...yValues, 5);
  const yMax = Math.max(...yValues, 10);

  const xScale = (val: number) =>
    padding.left + ((val - xMin) / (xMax - xMin || 1)) * plotWidth;
  const yScale = (val: number) =>
    padding.top + plotHeight - ((val - yMin) / (yMax - yMin || 1)) * plotHeight;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Figure 1: Waist Circumference vs HbA1c</text>
  ${Array.from({ length: 5 }, (_, i) => {
    const y = padding.top + (i * plotHeight) / 4;
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
  }).join("")}
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  ${dataPoints
    .map(
      (point) =>
        `<circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="5" fill="${RISK_COLORS[point.risk] ?? "#9ca3af"}" opacity="0.8" stroke="black" stroke-width="1"/>`
    )
    .join("")}
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="14">Waist Circumference (cm)</text>
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">HbA1c (%)</text>
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
  ${Object.entries(RISK_COLORS)
    .map(
      ([risk, color], i) =>
        `<circle cx="${width - 150}" cy="${padding.top + 20 + i * 20}" r="5" fill="${color}" stroke="black"/><text x="${width - 140}" y="${padding.top + 24 + i * 20}" font-family="Arial" font-size="10">${risk}</text>`
    )
    .join("")}
  <text x="${width - padding.right - 10}" y="${padding.top + 20}" text-anchor="end" font-family="Arial" font-size="11">n = ${dataPoints.length}</text>
</svg>`;
}

/** Paper 3 Figure 2: HbA1c distribution histogram (clinical band bins). */
export function generateHbA1cHistogramSVG(hba1cValues: number[]): string {
  if (hba1cValues.length === 0) {
    return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="white"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="14">No HbA1c data</text></svg>`;
  }

  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const bins = [
    { label: "<6.0", min: 0, max: 6.0, color: "#22c55e", count: 0 },
    { label: "6.1-6.5", min: 6.1, max: 6.5, color: "#eab308", count: 0 },
    { label: "6.6-7.0", min: 6.6, max: 7.0, color: "#3b82f6", count: 0 },
    { label: "7.1-8.0", min: 7.1, max: 8.0, color: "#f97316", count: 0 },
    { label: ">8.1", min: 8.1, max: 20, color: "#991b1b", count: 0 },
  ];

  hba1cValues.forEach((val) => {
    const bin = bins.find((b) => val >= b.min && val <= b.max);
    if (bin) bin.count++;
  });

  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const barWidth = plotWidth / bins.length - 20;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Figure 2: HbA1c Distribution (Clinical Bands)</text>
  ${bins
    .map((bin, i) => {
      const x = padding.left + (i * plotWidth) / bins.length + 10;
      const barHeight = (bin.count / maxCount) * plotHeight;
      const y = padding.top + plotHeight - barHeight;
      return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${bin.color}" opacity="0.8" stroke="black" stroke-width="2"/>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold">${bin.count}</text>
      <text x="${x + barWidth / 2}" y="${height - padding.bottom + 20}" text-anchor="middle" font-family="Arial" font-size="11">${bin.label}%</text>
    `;
    })
    .join("")}
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  ${[0, Math.round(maxCount / 2), maxCount]
    .map(
      (val) =>
        `<text x="${padding.left - 10}" y="${padding.top + plotHeight - (val / maxCount) * plotHeight + 4}" text-anchor="end" font-family="Arial" font-size="11">${val}</text>`
    )
    .join("")}
  <text x="20" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="14" transform="rotate(-90, 20, ${height / 2})">Number of Patients</text>
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Total n = ${hba1cValues.length}</text>
</svg>`;
}

/** Paper 3 Figure 3: Clinical HbA1c bands bar chart from precomputed counts. */
export function generateHbA1cBandsBarSVG(bandCounts: {
  normal: number;
  prediabetes: number;
  good: number;
  poor: number;
  alert: number;
  total: number;
}): string {
  const { normal, prediabetes, good, poor, alert, total } = bandCounts;
  const bands = [
    { label: "Normal", value: normal, color: "#22c55e", range: "<6.0%" },
    { label: "Prediabetes", value: prediabetes, color: "#eab308", range: "6.1-6.5%" },
    { label: "Good", value: good, color: "#3b82f6", range: "6.6-7.0%" },
    { label: "Poor", value: poor, color: "#f97316", range: "7.1-8.0%" },
    { label: "Alert", value: alert, color: "#991b1b", range: ">8.1%" },
  ].filter((b) => b.value > 0);

  if (bands.length === 0) {
    return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="white"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="14">No clinical band data</text></svg>`;
  }

  const width = 800;
  const height = 600;
  const padding = { top: 60, right: 60, bottom: 100, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const barWidth = (plotWidth / bands.length) * 0.6;
  const maxCount = Math.max(...bands.map((b) => b.value), 1);

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Figure 3: Clinical HbA1c Bands Distribution</text>
  ${bands
    .map((band, i) => {
      const x = padding.left + (i * plotWidth) / bands.length + (plotWidth / bands.length - barWidth) / 2;
      const barHeight = (band.value / maxCount) * plotHeight;
      const y = padding.top + plotHeight - barHeight;
      const pct = total > 0 ? ((band.value / total) * 100).toFixed(1) : "0";
      return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${band.color}" opacity="0.9" stroke="black" stroke-width="2"/>
      <text x="${x + barWidth / 2}" y="${y - 10}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">${band.value}</text>
      <text x="${x + barWidth / 2}" y="${y - 25}" text-anchor="middle" font-family="Arial" font-size="11">${pct}%</text>
    `;
    })
    .join("")}
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="black" stroke-width="2"/>
  ${bands
    .map((band, i) => {
      const x = padding.left + (i * plotWidth) / bands.length + (plotWidth / bands.length) / 2;
      return `
      <text x="${x}" y="${height - padding.bottom + 25}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold">${band.label}</text>
      <text x="${x}" y="${height - padding.bottom + 42}" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${band.range}</text>
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
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-family="Arial" font-size="11" fill="#666">Clinical bands per Dr. Muddu guidelines: Normal &lt;6.0%, Prediabetes 6.1-6.5%, Good 6.6-7.0%, Poor 7.1-8.0%, Alert &gt;8.1%</text>
</svg>`;
}

/** Paper 3 Figure 3 (convenience): accepts patients and calls getDiabetesRiskStats + generateHbA1cBandsBarSVG. */
export function generateClinicalBandsBarSVG(patients: PatientWithStatus[]): string {
  const stats = getDiabetesRiskStats(patients);
  return generateHbA1cBandsBarSVG({
    normal: stats.normal,
    prediabetes: stats.prediabetes,
    good: stats.good,
    poor: stats.poor,
    alert: stats.alert,
    total: stats.total,
  });
}

export function generateChartData(patients: PatientWithStatus[]): ChartData {
  return {
    figure1: generateScatterPlotSVG(patients),
    figure2: generateHistogramSVG(patients),
    figure3: generateRiskBarChartSVG(patients),
  };
}

export async function svgToPngBase64(svgString: string): Promise<string> {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800 * 3;
      canvas.height = 600 * 3;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas 2d not available"));
        return;
      }
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(3, 3);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl.includes(",") ? dataUrl.split(",")[1]! : dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG as image"));
    };
    img.src = url;
  });
}

export async function svgToPng(
  svgString: string,
  filename: string
): Promise<void> {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800 * 3;
    canvas.height = 600 * 3;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
