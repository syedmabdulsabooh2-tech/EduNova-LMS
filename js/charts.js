/**
 * EduNova LMS - SVG Charts Engine (charts.js)
 * High-performance, retina-sharp, theme-reactive SVG charts.
 * Supports Area charts, Bar charts, and Donut charts with tooltips and animations.
 */

const Charts = (() => {
  // Helper to escape HTML in tooltips
  const escapeHtml = (str) => String(str).replace(/[&<>'"]/g, "");

  /**
   * Render an interactive Area Chart (e.g. Monthly Enrollments, Platform Activity)
   */
  function renderAreaChart(container, options = {}) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (!el) return;

    const data = options.data || [
      { label: "Jun", value: 45 },
      { label: "Jul", value: 68 },
      { label: "Aug", value: 92 },
      { label: "Sep", value: 145 },
      { label: "Oct", value: 198 },
      { label: "Nov", value: 248 }
    ];

    const width = options.width || el.clientWidth || 540;
    const height = options.height || 220;
    const padding = { top: 20, right: 25, bottom: 35, left: 45 };

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map((d) => d.value), 10) * 1.15;
    const minVal = 0;

    const getX = (idx) => padding.left + (idx / (data.length - 1)) * innerW;
    const getY = (val) => padding.top + innerH - ((val - minVal) / (maxVal - minVal)) * innerH;

    // Build SVG Path points
    const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value), ...d }));

    // Generate smooth bezier curve path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

    // Horizontal grid lines
    const gridTicks = 4;
    let gridLinesHtml = "";
    for (let i = 0; i <= gridTicks; i++) {
      const val = Math.round(minVal + (i / gridTicks) * (maxVal - minVal));
      const y = padding.top + innerH - (i / gridTicks) * innerH;
      gridLinesHtml += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3 3" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="currentColor" opacity="0.45" font-size="11" text-anchor="end">${val}</text>
      `;
    }

    // X Axis labels
    const xLabelsHtml = points
      .map(
        (p) => `
        <text x="${p.x}" y="${height - 10}" fill="currentColor" opacity="0.55" font-size="11" text-anchor="middle">${p.label}</text>
      `
      )
      .join("");

    // Interactive Points
    const dotsHtml = points
      .map(
        (p, idx) => `
        <g class="chart-dot group cursor-pointer" data-label="${escapeHtml(p.label)}" data-value="${p.value}">
          <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="2" class="transition-all duration-200 group-hover:r-6" />
          <circle cx="${p.x}" cy="${p.y}" r="14" fill="transparent" />
          <title>${p.label}: ${p.value} students</title>
        </g>
      `
      )
      .join("");

    const gradientId = `area-grad-${Math.random().toString(36).substr(2, 6)}`;

    el.innerHTML = `
      <div class="relative w-full overflow-hidden">
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto text-slate-800 dark:text-slate-200">
          <defs>
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2563eb" stop-opacity="0.38"/>
              <stop offset="70%" stop-color="#6366f1" stop-opacity="0.10"/>
              <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          ${gridLinesHtml}
          <path d="${areaPath}" fill="url(#${gradientId})" />
          <path d="${linePath}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          ${dotsHtml}
          ${xLabelsHtml}
        </svg>
      </div>
    `;
  }

  /**
   * Render a Bar Chart (e.g. Grade Distribution or Course Submissions)
   */
  function renderBarChart(container, options = {}) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (!el) return;

    const data = options.data || [
      { label: "A (90-100)", value: 42, color: "#2563eb" },
      { label: "B (80-89)", value: 65, color: "#3b82f6" },
      { label: "C (70-79)", value: 38, color: "#6366f1" },
      { label: "D (60-69)", value: 14, color: "#f59e0b" },
      { label: "F (<60)", value: 4, color: "#ef4444" }
    ];

    const width = options.width || el.clientWidth || 500;
    const height = options.height || 210;
    const padding = { top: 20, right: 20, bottom: 40, left: 35 };

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map((d) => d.value), 10) * 1.15;
    const barWidth = Math.min(42, (innerW / data.length) * 0.58);
    const step = innerW / data.length;

    let barsHtml = "";
    data.forEach((d, idx) => {
      const barH = (d.value / maxVal) * innerH;
      const x = padding.left + idx * step + (step - barWidth) / 2;
      const y = padding.top + innerH - barH;
      const color = d.color || "#2563eb";

      barsHtml += `
        <g class="chart-bar group cursor-pointer">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="5" ry="5" fill="${color}" fill-opacity="0.9" class="transition-all duration-200 group-hover:fill-opacity-100 group-hover:y-${y - 2}">
            <title>${d.label}: ${d.value} submissions</title>
          </rect>
          <text x="${x + barWidth / 2}" y="${y - 6}" fill="currentColor" opacity="0.8" font-size="11" font-weight="600" text-anchor="middle">${d.value}</text>
          <text x="${x + barWidth / 2}" y="${height - 12}" fill="currentColor" opacity="0.6" font-size="11" text-anchor="middle">${d.label}</text>
        </g>
      `;
    });

    // Horizontal baseline
    const baselineY = padding.top + innerH;

    el.innerHTML = `
      <div class="relative w-full overflow-hidden">
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto text-slate-800 dark:text-slate-200">
          <line x1="${padding.left}" y1="${baselineY}" x2="${width - padding.right}" y2="${baselineY}" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" />
          ${barsHtml}
        </svg>
      </div>
    `;
  }

  /**
   * Render a Donut Chart (e.g. Course Progress or Batch Breakdown)
   */
  function renderDonutChart(container, options = {}) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (!el) return;

    const segments = options.segments || [
      { label: "Completed", value: 42, color: "#10b981" },
      { label: "In Progress", value: 48, color: "#2563eb" },
      { label: "Not Started", value: 10, color: "#94a3b8" }
    ];

    const size = options.size || 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
    let accumulatedAngle = 0;

    let circlesHtml = "";
    segments.forEach((seg) => {
      const fraction = seg.value / total;
      const strokeDash = `${fraction * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;

      circlesHtml += `
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none"
          stroke="${seg.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDash}" stroke-dashoffset="${strokeDashoffset}"
          class="transition-all duration-300 hover:opacity-90"
          transform="rotate(-90 ${center} ${center})">
          <title>${seg.label}: ${seg.value}%</title>
        </circle>
      `;
      accumulatedAngle += fraction;
    });

    const legendHtml = segments
      .map(
        (s) => `
        <div class="flex items-center justify-between text-xs py-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${s.color}"></span>
            <span class="text-slate-600 dark:text-slate-300 font-medium">${s.label}</span>
          </div>
          <span class="font-bold text-slate-800 dark:text-white tabular-nums">${s.value}%</span>
        </div>
      `
      )
      .join("");

    const centerLabel = options.centerLabel || `${segments[0].value}%`;
    const centerSub = options.centerSub || "Completed";

    el.innerHTML = `
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <div class="relative w-[${size}px] h-[${size}px] flex items-center justify-center">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="currentColor" stroke-opacity="0.08" stroke-width="${strokeWidth}" />
            ${circlesHtml}
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-2xl font-black text-slate-900 dark:text-white">${centerLabel}</span>
            <span class="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">${centerSub}</span>
          </div>
        </div>
        <div class="w-full sm:w-48 flex flex-col gap-1">
          ${legendHtml}
        </div>
      </div>
    `;
  }

  return {
    renderAreaChart,
    renderBarChart,
    renderDonutChart
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Charts;
} else if (typeof window !== "undefined") {
  window.Charts = Charts;
}
