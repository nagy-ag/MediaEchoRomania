"use client";

import { useMemo, useState } from "react";
import {
  useComparisonMetrics,
  useComparisonRows,
  useOutletProfiles,
} from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ComparisonTableCard } from "@/components/dashboard/comparison-table-card";
import { HeatmapPreviewCard } from "@/components/dashboard/heatmap-preview-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";

export function ComparePageView() {
  const { t, timeWindow } = useUiPreferences();
  const metrics = useComparisonMetrics();
  const rows = useComparisonRows(timeWindow);
  const outletProfiles = useOutletProfiles(timeWindow);
  const [selectedOutletIds, setSelectedOutletIds] = useState<string[]>([]);

  const defaultOutletIds = useMemo(() => rows?.slice(0, 3).map((row) => row.outletId) ?? [], [rows]);
  const activeOutletIds = selectedOutletIds.length > 0 ? selectedOutletIds : defaultOutletIds;
  const visibleRows = useMemo(() => rows?.filter((row) => activeOutletIds.includes(row.outletId)) ?? [], [activeOutletIds, rows]);
  const visibleProfiles = useMemo(() => outletProfiles?.filter((profile) => activeOutletIds.includes(profile.id)) ?? [], [activeOutletIds, outletProfiles]);

  if (!metrics || !rows || !outletProfiles) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  const hotspots = visibleProfiles
    .flatMap((outlet) => outlet.heatmap)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return (
    <div className="grid gap-4">
      <ShellCard>
        <CardHeader title={t("compare.heading")} />
        <div className="mt-4 flex flex-wrap gap-2">
          {rows.map((row) => {
            const active = activeOutletIds.includes(row.outletId);
            return (
              <button
                key={row.outletId}
                type="button"
                onClick={() => setSelectedOutletIds((current) => current.includes(row.outletId) ? current.filter((id) => id !== row.outletId) : [...current, row.outletId])}
                className={active ? "rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-contrast)]" : "rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"}
              >
                {row.outletName}
              </button>
            );
          })}
        </div>
      </ShellCard>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("compare.visualArena")} value={`${visibleRows.length}`} note={t("compare.visualArenaBody")} />
        <StatCard label={t("compare.topFactuality")} value={visibleRows.slice().sort((a, b) => b.metrics.factuality - a.metrics.factuality)[0]?.outletName ?? "-"} note={t("compare.topFactualityBody")} />
        <StatCard label={t("compare.highestHostility")} value={visibleRows.slice().sort((a, b) => b.metrics.hostility - a.metrics.hostility)[0]?.outletName ?? "-"} note={t("compare.highestHostilityBody")} tone="danger" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ShellCard>
          <CardHeader title={t("compare.visualArena")} />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {visibleRows.map((row) => (
              <div key={row.outletId} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{row.outletName}</p>
                  <CardBadge tone={row.typology === "national" ? "accent" : "warning"}>{row.typology}</CardBadge>
                </div>
                <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
                  <MetricLine label="Speed" value={row.metrics.speed} tone="var(--accent)" />
                  <MetricLine label="Factuality" value={row.metrics.factuality} tone="var(--accent)" />
                  <MetricLine label="Hostility" value={row.metrics.hostility} tone="var(--danger)" />
                </div>
              </div>
            ))}
          </div>
        </ShellCard>

        <HeatmapPreviewCard title={t("compare.hotspots")} metrics={hotspots.map((h) => ({ label: h.eventTitle, value: Math.round(h.score * 100), displayValue: `${Math.round(h.score * 100)}%`, tone: h.score > 0.7 ? "var(--danger)" : "var(--accent)" }))} />
      </div>

      <ComparisonTableCard title={t("compare.table")} metrics={metrics} rows={visibleRows.length > 0 ? visibleRows : rows} />
    </div>
  );
}

function MetricLine({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-subtle)]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--track-bg)]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: tone }} />
      </div>
    </div>
  );
}
