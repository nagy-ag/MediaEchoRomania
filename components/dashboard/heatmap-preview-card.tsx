"use client";

import { useId } from "react";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";
import { ActivityIcon } from "@/lib/icons/dashboard-icons";

interface HealthMetric {
  label: string;
  value: number;
  displayValue: string;
  tone: string;
}

interface HeatmapPreviewCardProps {
  title: string;
  metrics: HealthMetric[];
  staggerIndex?: number;
}

export function HeatmapPreviewCard({ title, metrics, staggerIndex }: HeatmapPreviewCardProps) {
  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <CardHeader title={title} icon={<ActivityIcon size={16} />} />

      <div className="mt-5 flex items-center justify-center gap-8">
        {metrics.map((metric) => (
          <MetricRing key={metric.label} metric={metric} />
        ))}
      </div>
    </ShellCard>
  );
}

function MetricRing({ metric }: { metric: HealthMetric }) {
  const id = useId();
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - metric.value / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          viewBox="0 0 84 84"
          className="h-[90px] w-[90px]"
          style={{ "--ring-circumference": circumference, "--ring-offset": offset } as React.CSSProperties}
        >
          <circle cx="42" cy="42" r={radius} stroke="var(--track-bg)" strokeWidth="6" fill="none" />
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke={metric.tone}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="origin-center -rotate-90 motion-safe:animate-[drawRing_800ms_var(--ease-fluid)_400ms_both]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="[font-family:var(--font-display)] text-lg font-bold text-[var(--text-primary)]">
            {metric.displayValue}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: metric.tone }} />
        <span className="text-[11px] text-[var(--text-muted)]">{metric.label}</span>
      </div>
    </div>
  );
}





