"use client";

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

export function ComparePageView() {
  const { t, timeWindow } = useUiPreferences();
  const metrics = useComparisonMetrics();
  const rows = useComparisonRows(timeWindow);
  const outletProfiles = useOutletProfiles(timeWindow);

  if (!metrics || !rows || !outletProfiles) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  const hotspots = outletProfiles
    .flatMap((outlet) => outlet.heatmap)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("compare.heading")} value={`${rows.length}`} note="Outlets currently compared in the matrix view." />
        <StatCard label="Top factuality" value={rows.slice().sort((a, b) => b.metrics.factuality - a.metrics.factuality)[0]?.outletName ?? "-"} note="Highest current baseline alignment in the selected window." />
        <StatCard label="Highest hostility" value={rows.slice().sort((a, b) => b.metrics.hostility - a.metrics.hostility)[0]?.outletName ?? "-"} tone="danger" note="Outlet with the strongest adversarial framing signal right now." />
      </div>
      <ComparisonTableCard title={t("compare.table")} metrics={metrics} rows={rows} />
      <HeatmapPreviewCard title={t("compare.hotspots")} metrics={hotspots.map((h) => ({ label: h.eventTitle, value: Math.round(h.score * 100), displayValue: `${Math.round(h.score * 100)}%`, tone: h.score > 0.7 ? "var(--danger)" : "var(--accent)" }))} />
    </div>
  );
}
