import { ShellCard } from "@/components/dashboard/shell-card";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  note?: string;
  tone?: "accent" | "success" | "warning" | "danger";
  actions?: Array<{ label: string; variant: "primary" | "secondary" }>;
  staggerIndex?: number;
}

export function StatCard({
  label,
  value,
  trend,
  note,
  tone = "accent",
  actions,
  staggerIndex,
}: StatCardProps) {
  const trendColor = trend?.positive ? "text-[var(--accent)]" : "text-[var(--danger)]";
  const trendArrow = trend?.positive ? "↑" : "↓";

  return (
    <ShellCard className="flex min-h-[180px] flex-col justify-between" staggerIndex={staggerIndex}>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{label}</p>
          {trend ? (
            <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              {trendArrow} {trend.value}
            </span>
          ) : null}
        </div>
        <p className="mt-3 [font-family:var(--font-display)] text-[clamp(2rem,3vw,2.8rem)] font-bold leading-none tracking-tight text-[var(--text-primary)]">
          {value}
        </p>
      </div>

      <div className="mt-4">
        {note ? (
          <p className="text-sm leading-6 text-[var(--text-muted)]">{note}</p>
        ) : null}
        {actions && actions.length > 0 ? (
          <div className="mt-3 flex gap-2">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={
                  action.variant === "primary"
                    ? "rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] shadow-[var(--shadow-pill)] transition hover:bg-[var(--accent-strong)]"
                    : "rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </ShellCard>
  );
}










