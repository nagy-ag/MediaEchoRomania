import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";

interface BarsCardProps {
  title: string;
  items: Array<{ label: string; value: number }>;
  staggerIndex?: number;
}

export function BarsCard({ title, items, staggerIndex }: BarsCardProps) {
  const max = Math.max(...items.map((item) => item.value), 1);
  const peakIndex = items.reduce((best, item, index) =>
    item.value > items[best].value ? index : best, 0,
  );

  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <CardHeader title={title} />

      {/* Peak value label */}
      <div className="mt-3 flex items-center gap-2">
        <span className="[font-family:var(--font-display)] text-2xl font-bold text-[var(--accent)]">
          {items[peakIndex]?.value}
        </span>
        <span className="rounded-full bg-[var(--accent-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
          Peak
        </span>
      </div>

      {/* Bars */}
      <div className="mt-4 flex h-[160px] items-end gap-2">
        {items.map((item, index) => {
          const height = (item.value / max) * 100;
          const isPeak = index === peakIndex;
          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-[var(--radius-xs)] transition-all duration-700 ease-[var(--ease-fluid)] motion-safe:animate-[growHeight_600ms_var(--ease-fluid)_both] origin-bottom"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isPeak ? "var(--accent)" : "var(--track-bg)",
                    animationDelay: `${index * 60 + 200}ms`,
                  }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </ShellCard>
  );
}




