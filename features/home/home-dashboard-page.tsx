"use client";

import { useDashboardOverview, usePipelineOverview } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ActiveEventCard } from "@/components/dashboard/active-event-card";
import { ActivityFeedCard } from "@/components/dashboard/activity-feed-card";
import { BarsCard } from "@/components/dashboard/bars-card";
import { EventUniverseCard } from "@/components/dashboard/event-universe-card";
import { HeatmapPreviewCard } from "@/components/dashboard/heatmap-preview-card";
import { PipelineOpsCard } from "@/components/dashboard/pipeline-ops-card";
import { LineAreaCard } from "@/components/dashboard/line-area-card";
import { RingsCard } from "@/components/dashboard/rings-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TimelineChartCard } from "@/components/dashboard/timeline-chart-card";

export function HomeDashboardPage() {
  const { locale, t, timeWindow } = useUiPreferences();
  const overview = useDashboardOverview(timeWindow, locale);
  const pipeline = usePipelineOverview(timeWindow);

  if (!overview || !pipeline) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  const topEvent = overview.eventClusters[0];
  const peakSurge = Math.max(...overview.narrativeSurge.map((point) => point.value), 0);
  const totalArticles = overview.eventClusters.reduce((total, event) => total + event.articleCount, 0);
  const nationalArticles = overview.eventClusters
    .filter((event) => event.typology === "national")
    .reduce((total, event) => total + event.articleCount, 0);
  const localArticles = overview.eventClusters
    .filter((event) => event.typology === "local")
    .reduce((total, event) => total + event.articleCount, 0);
  const nationalShare = totalArticles === 0 ? 0 : Math.round((nationalArticles / totalArticles) * 100);
  const localShare = totalArticles === 0 ? 0 : Math.round((localArticles / totalArticles) * 100);
  const topHotspot = overview.coverageHotspots[0];
  const suppressionRisk = topHotspot ? Math.round(topHotspot.score * 100) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {topEvent ? (
        <ActiveEventCard event={topEvent} trackLabel={t("dashboard.openEvent")} staggerIndex={0} />
      ) : null}

      <StatCard
        label={t("dashboard.divergence")}
        value={`${overview.divergenceScore}%`}
        note={overview.summary}
        tone="warning"
        staggerIndex={1}
      />

      <EventUniverseCard title={t("dashboard.viralityMap")} events={overview.eventClusters} staggerIndex={2} />

      <BarsCard title={t("dashboard.outletActivity")} items={overview.outletActivity} staggerIndex={3} />

      <RingsCard
        title={t("dashboard.coverageSplit")}
        badge={`${overview.liveEventCount} live events`}
        items={[
          {
            label: t("common.national"),
            value: nationalShare,
            tone: "var(--accent)",
            sublabel: `${nationalArticles} articles`,
          },
          {
            label: t("common.local"),
            value: localShare,
            tone: "var(--warning)",
            sublabel: `${localArticles} articles`,
          },
        ]}
        staggerIndex={4}
      />

      <TimelineChartCard
        title={t("dashboard.articleTracking")}
        count={totalArticles}
        countLabel={`${timeWindow} window`}
        points={overview.narrativeSurge}
        staggerIndex={5}
      />

      <ActivityFeedCard title={t("dashboard.recentActivity")} items={overview.activityFeed} staggerIndex={6} />

      <LineAreaCard
        title={t("dashboard.narrativeSurge")}
        points={overview.narrativeSurge}
        peakLabel={`${peakSurge}`}
        staggerIndex={7}
      />

      <PipelineOpsCard title={t("dashboard.pipelineOperations")} pipeline={pipeline} staggerIndex={8} />

      <HeatmapPreviewCard
        title={t("dashboard.coverageHotspots")}
        metrics={[
          {
            label: t("dashboard.pipelineHealth"),
            value: overview.pipelineHealthScore,
            displayValue: `${overview.pipelineHealthScore}%`,
            tone: "var(--accent)",
          },
          {
            label: topHotspot ? `${topHotspot.outletName} omission` : t("dashboard.suppressionRisk"),
            value: suppressionRisk,
            displayValue: `${suppressionRisk}%`,
            tone: suppressionRisk > 70 ? "var(--danger)" : "var(--warning)",
          },
        ]}
        staggerIndex={9}
      />
    </div>
  );
}
