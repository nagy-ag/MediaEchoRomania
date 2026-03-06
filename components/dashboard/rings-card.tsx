"use client";

import { useId } from "react";
import { formatPercent } from "@/lib/utils";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";

interface RingItem {
  label: string;
  value: number;
  tone: string;
  sublabel?: string;
}

interface RingsCardProps {
  title: string;
  items: RingItem[];
  badge?: string;
  staggerIndex?: number;
}

export function RingsCard({ title, items, badge, staggerIndex }: RingsCardProps) {
  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <CardHeader
        title={title}
        badge={
          badge ? (
            <span className="rounded-full bg-[var(--panel-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
              {badge}
            </span>
          ) : undefined
        }
      />
      <div className="mt-5 flex items-center justify-center gap-6">
        {items.map((item) => (
          <RingGauge key={item.label} item={item} />
        ))}
      </div>
    </ShellCard>
  );
}

function RingGauge({ item }: { item: RingItem }) {
  const id = useId();
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - item.value / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="h-[100px] w-[100px]" style={{ "--ring-circumference": circumference, "--ring-offset": offset } as React.CSSProperties}>
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="var(--track-bg)"
            strokeWidth="8"
            fill="none"
          />
          {/* Value arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={item.tone}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="origin-center -rotate-90 motion-safe:animate-[drawRing_800ms_var(--ease-fluid)_300ms_both]"
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="[font-family:var(--font-display)] text-xl font-bold text-[var(--text-primary)]">
            {formatPercent(item.value)}
          </span>
          {item.sublabel ? (
            <span className="text-[10px] text-[var(--text-subtle)]">{item.sublabel}</span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.tone }} />
        <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
      </div>
    </div>
  );
}








