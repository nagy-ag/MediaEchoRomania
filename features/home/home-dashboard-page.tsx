"use client";

import Link from "next/link";
import { useDashboardOverview } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ActiveEventCard } from "@/components/dashboard/active-event-card";
import { ActivityFeedCard } from "@/components/dashboard/activity-feed-card";
import { EventUniverseCard } from "@/components/dashboard/event-universe-card";
import { HeatmapPreviewCard } from "@/components/dashboard/heatmap-preview-card";
import { RankedListCard } from "@/components/dashboard/ranked-list-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";
import { formatPercent } from "@/lib/utils";

export function HomeDashboardPage() {
  const { locale, t, timeWindow } = useUiPreferences();
  const overview = useDashboardOverview(timeWindow, locale);

  if (!overview) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  const briefingHighlights = overview.briefingHighlights ?? [];
  const topViralArticles = overview.topViralArticles ?? [];
  const quickLinks = overview.quickLinks ?? [];
  const eventClusters = overview.eventClusters ?? [];
  const coverageHotspots = overview.coverageHotspots ?? [];
  const activityFeed = overview.activityFeed ?? [];
  const leadEvent = eventClusters[0];
  const topHotspot = coverageHotspots[0];
  const topHotspotScore = topHotspot ? Math.round(topHotspot.score * 100) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <ShellCard className="xl:col-span-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("dashboard.heading")}</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="[font-family:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-none text-[var(--text-primary)]">
              {t("dashboard.briefing")}
            </h1>
            <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--text-muted)]">{overview.morningBriefing}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {briefingHighlights.map((item) => (
              <Link key={item.id} href={item.href ?? "/"} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{item.label}</p>
                  <CardBadge tone={item.tone}>{item.value}</CardBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{item.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </ShellCard>

      {leadEvent ? <ActiveEventCard event={leadEvent} trackLabel={t("dashboard.openEvent")} staggerIndex={0} /> : null}

      <StatCard
        label={t("dashboard.divergence")}
        value={`${overview.divergenceScore}%`}
        note={overview.summary}
        tone="warning"
        staggerIndex={1}
      />

      <EventUniverseCard title={t("dashboard.viralityMap")} events={eventClusters} staggerIndex={2} />

      <ShellCard>
        <CardHeader title={t("dashboard.topViral")} />
        <div className="mt-4 space-y-3">
          {topViralArticles.map((article) => (
            <Link key={article.id} href={article.auditCardId ? `/audit-cards/${article.auditCardId}` : `/events/${article.eventId}`} className="block rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3.5 transition hover:border-[var(--border-strong)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{article.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{article.outletName} on {article.eventTitle}</p>
                </div>
                <CardBadge tone={article.framing === "spin" ? "danger" : article.framing === "omission" ? "warning" : "accent"}>
                  {formatPercent(article.viralityScore)}
                </CardBadge>
              </div>
            </Link>
          ))}
        </div>
      </ShellCard>

      <ActivityFeedCard title={t("dashboard.recentActivity")} items={activityFeed} staggerIndex={3} />

      <RankedListCard
        title={t("dashboard.quickActions")}
        items={quickLinks.map((item) => ({
          id: item.id,
          label: item.label,
          value: t("dashboard.openEvent"),
          detail: item.description,
          href: item.href,
          tone: "accent",
        }))}
      />

      <HeatmapPreviewCard
        title={t("dashboard.coverageHotspots")}
        metrics={[
          {
            label: topHotspot ? topHotspot.outletName : t("dashboard.suppressionRisk"),
            value: topHotspotScore,
            displayValue: `${topHotspotScore}%`,
            tone: topHotspotScore > 70 ? "var(--danger)" : "var(--warning)",
          },
          {
            label: t("dashboard.pipelineHealth"),
            value: overview.pipelineHealthScore,
            displayValue: `${overview.pipelineHealthScore}%`,
            tone: "var(--accent)",
          },
        ]}
      />
    </div>
  );
}



