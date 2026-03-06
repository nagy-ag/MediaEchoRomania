import { ShellCard } from "@/components/dashboard/shell-card";
import { CardBadge, CardHeader } from "@/components/dashboard/card-header";
import type { PipelineStatusOverview } from "@/lib/contracts/media-echo";

function getTone(score: number) {
  if (score >= 100) {
    return "var(--accent)";
  }

  if (score >= 80) {
    return "var(--warning)";
  }

  return "var(--danger)";
}

export function PipelineStatusSummaryCard({
  title,
  summary,
  status,
  uptimeLabel,
}: {
  title: string;
  summary: string;
  status: PipelineStatusOverview;
  uptimeLabel: string;
}) {
  const tone = getTone(status.score);

  return (
    <ShellCard className="min-h-[280px]">
      <CardHeader
        title={title}
        badge={<CardBadge tone={status.status === "critical" ? "danger" : status.status === "degraded" ? "warning" : "accent"}>{status.score}%</CardBadge>}
      />
      <div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_1.4fr] md:items-center">
        <div>
          <p className="[font-family:var(--font-display)] text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-none" style={{ color: tone }}>
            {status.score}%
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--track-bg)]">
            <div className="h-full rounded-full" style={{ width: `${status.score}%`, backgroundColor: tone }} />
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">{summary}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {status.components.map((component) => (
            <article key={component.id} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">{component.label}</p>
                <span className="text-xs font-semibold" style={{ color: getTone(component.score) }}>
                  {component.score}%
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--track-bg)]">
                <div className="h-full rounded-full" style={{ width: `${component.score}%`, backgroundColor: getTone(component.score) }} />
              </div>
              <p className="mt-3 text-[11px] leading-5 text-[var(--text-muted)]">{component.detail}</p>
            </article>
          ))}
        </div>
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{uptimeLabel}</p>
    </ShellCard>
  );
}
