import type { EventClusterSummary } from "@/lib/contracts/media-echo";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader, CardBadge, LiveDot } from "@/components/dashboard/card-header";

interface ActiveEventCardProps {
  event: EventClusterSummary;
  trackLabel: string;
  staggerIndex?: number;
}

const phaseLabels: Record<string, string> = {
  emerging: "Emerging",
  consensus: "Consensus",
  spin: "Spin phase",
  resolved: "Resolved",
};

export function ActiveEventCard({ event, trackLabel, staggerIndex }: ActiveEventCardProps) {
  return (
    <ShellCard className="min-h-[180px]" staggerIndex={staggerIndex}>
      <CardHeader
        title={event.title}
        badge={
          <CardBadge tone="accent">
            <LiveDot />
            {phaseLabels[event.phase] ?? event.phase}
          </CardBadge>
        }
      />

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent-surface)]">
          <span className="text-lg font-bold text-[var(--accent)]">{event.activeOutlets}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {event.articleCount} articles tracked
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {event.activeOutlets} outlets · {event.typology}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{event.summary}</p>

      <div className="mt-4">
        <button
          type="button"
          className="rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:text-[var(--accent)]"
        >
          {trackLabel}
        </button>
      </div>
    </ShellCard>
  );
}






