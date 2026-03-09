"use client";

import { useAuditLibrary, useOutletProfile, useOutlets } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { HeatmapPreviewCard } from "@/components/dashboard/heatmap-preview-card";
import { OutletDirectoryCard } from "@/components/dashboard/outlet-directory-card";
import { RankedListCard } from "@/components/dashboard/ranked-list-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";
import { formatPercent } from "@/lib/utils";

export function ProfilesPageView() {
  const { t, timeWindow } = useUiPreferences();
  const outlets = useOutlets();
  const auditLibrary = useAuditLibrary(timeWindow);

  if (!outlets || !auditLibrary) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4">
      <OutletDirectoryCard title={t("profiles.directory")} outlets={outlets} />
      <RankedListCard
        title={t("profiles.recentAudits")}
        items={auditLibrary.slice(0, 6).map((audit) => ({
          id: audit.id,
          label: audit.articleTitle,
          value: `${audit.viralityScore}%`,
          detail: `${audit.outletName} | ${audit.eventTitle}`,
          href: audit.href,
          tone: "accent",
        }))}
      />
    </div>
  );
}

export function ProfileDetailPageView({ outletId }: { outletId: string }) {
  const { t, timeWindow } = useUiPreferences();
  const outlet = useOutletProfile(outletId, timeWindow);
  const auditLibrary = useAuditLibrary(timeWindow);

  if (outlet === undefined || auditLibrary === undefined) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  if (!outlet) {
    return <ShellCard>{t("common.noData")}</ShellCard>;
  }

  const relatedAudits = auditLibrary.filter((item) => item.outletId === outlet.id).slice(0, 4);

  return (
    <div className="grid gap-4">
      <ShellCard>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("profiles.heading")}</p>
        <h1 className="mt-2 [font-family:var(--font-display)] text-[clamp(1.9rem,3vw,2.8rem)] leading-none text-[var(--text-primary)]">{outlet.name}</h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">{outlet.editorialFingerprint}</p>
      </ShellCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("profiles.factuality")} value={formatPercent(outlet.factualityScore)} tone="accent" note={t("profiles.factualityBody")} />
        <StatCard label={t("profiles.speed")} value={formatPercent(outlet.speedScore)} note={t("profiles.speedBody")} />
        <StatCard label={t("profiles.anonymous")} value={formatPercent(outlet.anonymousSourceRatio)} tone="warning" note={t("profiles.anonymousBody")} />
        <StatCard label={t("profiles.hostility")} value={formatPercent(outlet.hostilityScore)} tone="danger" note={t("profiles.hostilityBody")} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ShellCard>
          <CardHeader title={t("profiles.partisanFingerprint")} />
          <div className="mt-4 space-y-3">
            {outlet.partisanFingerprint.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-subtle)]">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--track-bg)]">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(item.value), 100)}%`, backgroundColor: item.value >= 0 ? "var(--danger)" : "var(--accent)" }} />
                </div>
              </div>
            ))}
          </div>
        </ShellCard>

        <ShellCard>
          <CardHeader title={t("profiles.sourceMix")} />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {outlet.sourceMix.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{item.value}%</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{t("profiles.speedVsClickbait")}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{outlet.speedVsClickbait.quadrantLabel}</p>
              </div>
              <CardBadge tone="accent">{outlet.speedVsClickbait.speed}/{outlet.speedVsClickbait.clickbait}</CardBadge>
            </div>
          </div>
        </ShellCard>
      </div>

      <HeatmapPreviewCard title={t("profiles.coverage")} metrics={outlet.heatmap.slice(0, 2).map((h) => ({ label: h.eventTitle, value: Math.round(h.score * 100), displayValue: `${Math.round(h.score * 100)}%`, tone: h.score > 0.7 ? "var(--danger)" : "var(--accent)" }))} />

      <div className="grid gap-4 xl:grid-cols-2">
        <RankedListCard
          title={t("profiles.topTargets")}
          items={outlet.topTargets.map((item, index) => ({ id: `${index}`, label: item, value: t("profiles.targetShort"), detail: item, href: "/compare", tone: "warning" }))}
        />
        <RankedListCard
          title={t("profiles.ignoredTopics")}
          items={outlet.ignoredTopics.map((item, index) => ({ id: `${index}`, label: item, value: t("profiles.omissionShort"), detail: item, href: "/coverage-gaps", tone: "danger" }))}
        />
      </div>

      <RankedListCard
        title={t("profiles.recentAudits")}
        items={relatedAudits.map((audit) => ({
          id: audit.id,
          label: audit.articleTitle,
          value: `${audit.viralityScore}%`,
          detail: `${audit.eventTitle}`,
          href: audit.href,
          tone: "accent",
        }))}
      />
    </div>
  );
}
