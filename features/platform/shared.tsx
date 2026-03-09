"use client";

import { ShellCard } from "@/components/dashboard/shell-card";
import { useDetailDrawer } from "@/features/shell/detail-drawer";
import { cn } from "@/lib/utils";

export function LoadingView({ label }: { label: string }) {
  return <ShellCard>{label}</ShellCard>;
}

export function EmptyView({ label }: { label: string }) {
  return <ShellCard>{label}</ShellCard>;
}

export function ListPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; detail: string; meta?: string; onOpen?: () => void }>;
}) {
  return (
    <ShellCard>
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onOpen}
            className={cn(
              "w-full rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3 text-left",
              item.onOpen && "transition hover:border-[var(--border-strong)]",
            )}
          >
            <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.detail}</p>
            {item.meta ? <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">{item.meta}</p> : null}
          </button>
        ))}
      </div>
    </ShellCard>
  );
}

export function ChartCard({
  title,
  points,
  accent = "var(--accent)",
}: {
  title: string;
  points: Array<{ label: string; value: number }>;
  accent?: string;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <ShellCard>
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="mt-6 flex items-end gap-3">
        {points.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-[11px] text-[var(--text-subtle)]">{point.value}</div>
            <div className="flex h-36 w-full items-end rounded-[18px] bg-[var(--panel-subtle)] p-1.5">
              <div className="w-full rounded-[14px]" style={{ height: `${(point.value / max) * 100}%`, background: accent }} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{point.label}</div>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}

export function InsightPills({
  items,
}: {
  items: Array<{ label: string; value: number; tone?: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item.label} className="rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-2 text-xs text-[var(--text-muted)]">
          <span className="text-[var(--text-primary)]">{item.label}</span> {item.value}
        </span>
      ))}
    </div>
  );
}

export function useOpenDetail() {
  const { openDrawer } = useDetailDrawer();
  return openDrawer;
}
