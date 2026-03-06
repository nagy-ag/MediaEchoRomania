import { ShellCard } from "@/components/dashboard/shell-card";
import { CardBadge, CardHeader } from "@/components/dashboard/card-header";
import { ActivityIcon } from "@/lib/icons/dashboard-icons";
import type { PipelineOverview } from "@/lib/contracts/media-echo";

export function PipelineOpsCard({
  title,
  pipeline,
  staggerIndex,
}: {
  title: string;
  pipeline: PipelineOverview;
  staggerIndex?: number;
}) {
  const maxStage = Math.max(...pipeline.stageVolumes.map((item) => item.value), 1);
  const maxState = Math.max(...pipeline.stateMix.map((item) => item.value), 1);

  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <CardHeader
        title={title}
        icon={<ActivityIcon size={16} />}
        badge={<CardBadge tone="accent">{pipeline.discoveries} discoveries</CardBadge>}
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricTile label="Scrape success" value={`${pipeline.scrapeSuccessRate}%`} />
        <MetricTile label="Fallbacks" value={`${pipeline.fallbackRate}%`} tone="warning" />
        <MetricTile label="Consensus" value={`${pipeline.averageConsensus}%`} />
        <MetricTile label="Manual review" value={`${pipeline.manualReviewCount}`} tone="danger" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Pipeline stages</p>
          <div className="mt-3 space-y-3">
            {pipeline.stageVolumes.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--track-bg)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-[var(--ease-fluid)]"
                    style={{ width: `${(item.value / maxStage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Event states</p>
          <div className="mt-3 space-y-3">
            {pipeline.stateMix.map((item, index) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      index === 0
                        ? "var(--warning)"
                        : index === 1
                          ? "var(--accent)"
                          : index === 2
                            ? "var(--danger)"
                            : "var(--text-subtle)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--track-bg)]">
                    <div
                      className="h-full rounded-full bg-[var(--panel-raised)] transition-[width] duration-700 ease-[var(--ease-fluid)]"
                      style={{ width: `${(item.value / maxState) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-3">
            <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
              <span>Clustered embeddings</span>
              <span>{pipeline.clusteredPointShare}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
              <span>Hostile spin flags</span>
              <span>{pipeline.hostileSpinCount}</span>
            </div>
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

function MetricTile({
  label,
  value,
  tone = "accent",
}: {
  label: string;
  value: string;
  tone?: "accent" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-[var(--danger)]"
      : tone === "warning"
        ? "text-[var(--warning)]"
        : "text-[var(--accent)]";

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{label}</p>
      <p className={`mt-2 [font-family:var(--font-display)] text-xl font-semibold leading-none ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}









