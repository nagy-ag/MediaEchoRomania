"use client";

import { useId } from "react";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";

interface LineAreaCardProps {
  title: string;
  points: Array<{ label: string; value: number }>;
  peakLabel?: string;
  accent?: string;
  staggerIndex?: number;
}

export function LineAreaCard({
  title,
  points,
  peakLabel,
  accent = "var(--accent)",
  staggerIndex,
}: LineAreaCardProps) {
  const gradientId = useId();
  const width = 320;
  const height = 120;
  const padding = 10;
  const safePoints = points.length === 1 ? [points[0], points[0]] : points;
  const max = Math.max(...safePoints.map((point) => point.value), 1);
  const peakValue = Math.max(...safePoints.map((point) => point.value));

  const coords = safePoints.map((point, index) => ({
    x: padding + (index / Math.max(safePoints.length - 1, 1)) * (width - padding * 2),
    y: height - padding - (point.value / max) * (height - padding * 2),
  }));

  const linePath = coords
    .map((coordinate, index) => `${index === 0 ? "M" : "L"}${coordinate.x},${coordinate.y}`)
    .join(" ");

  const areaPath = `${linePath} L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`;
  const totalLength = coords.reduce((sum, coordinate, index) => {
    if (index === 0) {
      return 0;
    }

    const previous = coords[index - 1];
    return sum + Math.sqrt((coordinate.x - previous.x) ** 2 + (coordinate.y - previous.y) ** 2);
  }, 0);
  const labelIndexes = new Set([0, Math.floor((safePoints.length - 1) / 2), safePoints.length - 1]);

  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <div className="flex items-start justify-between gap-4">
        <CardHeader title={title} />
        {peakLabel ? (
          <span className="[font-family:var(--font-display)] text-2xl font-bold" style={{ color: accent }}>
            {peakLabel}
          </span>
        ) : null}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-5 h-[160px] w-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#${gradientId})`} className="motion-safe:animate-[fadeInUp_600ms_var(--ease-fluid)_400ms_both]" />
        <path
          d={linePath}
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={totalLength}
          style={{
            animation: `drawLine 1000ms cubic-bezier(0.22,1,0.36,1) 200ms both`,
            ["--line-length" as string]: totalLength,
          }}
        />
        {coords.map((coordinate, index) => (
          <circle
            key={`${coordinate.x}-${coordinate.y}-${index}`}
            cx={coordinate.x}
            cy={coordinate.y}
            r={safePoints[index].value === peakValue ? 4.5 : 3}
            fill={safePoints[index].value === peakValue ? accent : "var(--panel-bg)"}
            stroke={accent}
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between px-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        {safePoints.map((point, index) => (
          <span key={`${point.label}-${index}`} className={index === safePoints.length - 2 && points.length === 1 ? "hidden" : undefined}>
            {labelIndexes.has(index) ? point.label : ""}
          </span>
        ))}
      </div>
    </ShellCard>
  );
}

