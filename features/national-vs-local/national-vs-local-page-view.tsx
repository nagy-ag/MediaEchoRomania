"use client";

import Link from "next/link";
import { RankedListCard } from "@/components/dashboard/ranked-list-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";
import { useTypologyDivideOverview } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function NationalVsLocalPageView() {
  const { t, timeWindow } = useUiPreferences();
  const overview = useTypologyDivideOverview(timeWindow);

  if (!overview) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4">
      <ShellCard>
        <CardHeader title={t("typology.heading")} badge={<CardBadge tone="warning">{overview.divergenceScore}%</CardBadge>} />
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{overview.summary}</p>
      </ShellCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_220px_1fr]">
        <ShellCard>
          <CardHeader title={t("typology.national")}/>
          <div className="mt-4 space-y-3">
            {overview.nationalHighlights.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 transition hover:border-[var(--border-strong)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">{event.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{event.summary}</p>
              </Link>
            ))}
          </div>
        </ShellCard>

        <ShellCard className="flex min-h-[240px] flex-col items-center justify-center text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("typology.divergence")}</p>
          <p className="mt-3 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-none text-[var(--text-primary)]">{overview.divergenceScore}%</p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{t("typology.divergenceBody")}</p>
        </ShellCard>

        <ShellCard>
          <CardHeader title={t("typology.local")}/>
          <div className="mt-4 space-y-3">
            {overview.localHighlights.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 transition hover:border-[var(--border-strong)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">{event.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{event.summary}</p>
              </Link>
            ))}
          </div>
        </ShellCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RankedListCard
          title={t("typology.sharedEvents")}
          items={overview.sharedEvents.map((item) => ({
            id: item.eventId,
            label: item.eventTitle,
            value: `${item.nationalCoverage}/${item.localCoverage}`,
            detail: `${item.nationalAngle} | ${item.localAngle}`,
            href: `/events/${item.eventId}`,
            tone: "warning",
          }))}
        />
        <RankedListCard
          title={t("typology.entityBalance")}
          items={overview.entityBalance.map((item, index) => ({
            id: `${index}`,
            label: item.label,
            value: `${item.nationalShare}% / ${item.localShare}%`,
            detail: `${t("common.national")}: ${item.nationalShare}% | ${t("common.local")}: ${item.localShare}%`,
            href: "/search",
            tone: "accent",
          }))}
        />
      </div>
    </div>
  );
}

