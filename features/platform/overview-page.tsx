"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { useOverview } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ChartCard, ListPanel, LoadingView, useOpenDetail } from "@/features/platform/shared";

export function OverviewPage() {
  const { t, timeWindow } = useUiPreferences();
  const overview = useOverview(timeWindow);
  const openDetail = useOpenDetail();

  if (!overview) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("overview.heading")} title={overview.headline} summary={overview.summary} aside={<ShellCard className="p-4"><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">{t("nav.morningBrief")}</p><p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{overview.morningBriefPreview}</p></ShellCard>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overview.kpis.map((metric) => (
          <MetricCard key={metric.id} label={metric.label} value={metric.value} delta={metric.deltaLabel} status={metric.statusLabel} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title={t("overview.coverageVelocity")} points={overview.coverageVelocity} />
        <ListPanel
          title={t("nav.alerts")}
          items={overview.topAlerts.map((alert) => ({
            id: alert.id,
            title: alert.title,
            detail: alert.summary,
            meta: alert.whyItTriggered,
            onOpen: () => openDetail({ title: alert.title, subtitle: alert.summary, bullets: [alert.whyItTriggered] }),
          }))}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ListPanel title={t("overview.topEvents")} items={overview.topEvents.map((event) => ({ id: event.id, title: event.title, detail: event.summary, meta: `${event.activeOutlets} outlets � speed ${event.speedScore} � stability ${event.stabilityScore}`, onOpen: () => openDetail({ title: event.title, subtitle: event.summary, metrics: [{ label: "Speed", value: `${event.speedScore}` }, { label: "Stability", value: `${event.stabilityScore}` }, { label: "Outlets", value: `${event.activeOutlets}` }] }) }))} />
        <ListPanel title={t("overview.fastestOutlets")} items={overview.fastestOutlets.map((outlet) => ({ id: outlet.id, title: outlet.name, detail: outlet.summary, meta: `Speed ${outlet.speedIndex} � Ghosting ${outlet.ghostingRate}%`, onOpen: () => openDetail({ title: outlet.name, subtitle: outlet.summary, metrics: [{ label: "Speed", value: `${outlet.speedIndex}` }, { label: "Stability", value: `${outlet.stabilityIndex}` }] }) }))} />
        <ListPanel title={t("overview.stableOutlets")} items={overview.stableOutlets.map((outlet) => ({ id: outlet.id, title: outlet.name, detail: outlet.summary, meta: `Stability ${outlet.stabilityIndex} � Breadth ${outlet.breadth}`, onOpen: () => openDetail({ title: outlet.name, subtitle: outlet.summary, bullets: [outlet.toneSignature] }) }))} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ListPanel title={t("overview.entityMovers")} items={overview.entityMovers.map((entity) => ({ id: entity.id, title: entity.name, detail: entity.summary, meta: entity.themes.join(" � "), onOpen: () => openDetail({ title: entity.name, subtitle: entity.summary, bullets: entity.topOutlets }) }))} />
        <ListPanel title={t("overview.ghostingPreview")} items={overview.ghostingHeatmap.map((item, index) => ({ id: `${item.outlet}-${item.event}`, title: `${item.outlet} x ${item.event}`, detail: `Ghosting score ${item.score}`, meta: index === 0 ? "Highest current selective silence signal" : undefined }))} />
        <ListPanel title={t("overview.propagationPreview")} items={overview.propagationPreview.map((path) => ({ id: path.id, title: path.eventTitle, detail: path.summary, meta: `Lead: ${path.firstMover}`, onOpen: () => openDetail({ title: path.eventTitle, subtitle: path.summary, bullets: [...path.amplifiers, ...path.silentOutlets.map((item) => `Silent: ${item}`)] }) }))} />
      </div>
    </div>
  );
}
