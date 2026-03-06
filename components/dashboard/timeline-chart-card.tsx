import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";

interface TimelineChartCardProps {
  title: string;
  count: number;
  countLabel: string;
  points: Array<{ label: string; value: number }>;
  staggerIndex?: number;
}

export function TimelineChartCard({
  title,
  count,
  countLabel,
  points,
  staggerIndex,
}: TimelineChartCardProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const lastIndex = Math.max(points.length - 1, 0);

  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <div className="flex items-start justify-between gap-4">
        <CardHeader title={title} />
        <div className="text-right">
          <span className="[font-family:var(--font-display)] text-3xl font-bold text-[var(--text-primary)]">
            {count.toLocaleString()}
          </span>
          <p className="text-xs text-[var(--text-muted)]">{countLabel}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-5">
        <div className="flex h-[116px] items-end gap-2">
          {points.map((point, index) => {
            const isCurrent = index === lastIndex;
            return (
              <div key={`${point.label}-${index}`} className="relative flex flex-1 items-end justify-center">
                {isCurrent ? (
                  <span className="absolute -top-4 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-bold text-[var(--accent-contrast)] shadow-[var(--shadow-pill)]">
                    NOW
                  </span>
                ) : null}
                <div className="flex h-full w-full items-end rounded-full bg-[var(--track-bg)]/70 p-[2px]">
                  <div
                    className="w-full rounded-full transition-[height,background-color] duration-700 ease-[var(--ease-fluid)]"
                    style={{
                      height: `${Math.max((point.value / maxValue) * 100, 12)}%`,
                      background: isCurrent
                        ? "linear-gradient(180deg, var(--accent-strong) 0%, var(--accent) 100%)"
                        : "linear-gradient(180deg, color-mix(in srgb, var(--accent) 34%, transparent) 0%, color-mix(in srgb, var(--accent) 78%, transparent) 100%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          <span>{points[0]?.label ?? "-"}</span>
          <span>{points[Math.floor(points.length / 2)]?.label ?? "-"}</span>
          <span>{points[lastIndex]?.label ?? "-"}</span>
        </div>
      </div>
    </ShellCard>
  );
}
