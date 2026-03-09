"use client";

import { useMemo, useState } from "react";
import { CoverageGridCard } from "@/components/dashboard/coverage-grid-card";
import { RankedListCard } from "@/components/dashboard/ranked-list-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";
import { useCoverageGapsOverview } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function CoverageGapsPageView() {
  const { t, timeWindow } = useUiPreferences();
  const overview = useCoverageGapsOverview(timeWindow);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedTypology, setSelectedTypology] = useState<string>("all");

  const filteredRows = useMemo(() => {
    if (!overview) {
      return [];
    }

    return overview.events.filter((event) => (selectedEventId === "all" || event.id === selectedEventId) && (selectedTypology === "all" || event.typology === selectedTypology));
  }, [overview, selectedEventId, selectedTypology]);

  if (!overview) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4">
      <ShellCard>
        <CardHeader title={t("coverage.heading")} />
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{overview.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelectedEventId("all")} className={selectedEventId === "all" ? "rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-contrast)]" : "rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"}>{t("coverage.allEvents")}</button>
          {overview.events.slice(0, 5).map((event) => (
            <button key={event.id} type="button" onClick={() => setSelectedEventId(event.id)} className={selectedEventId === event.id ? "rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-contrast)]" : "rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"}>{event.title}</button>
          ))}
          <button type="button" onClick={() => setSelectedTypology(selectedTypology === "national" ? "all" : "national")} className={selectedTypology === "national" ? "rounded-full bg-[var(--accent-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]" : "rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"}>{t("common.national")}</button>
          <button type="button" onClick={() => setSelectedTypology(selectedTypology === "local" ? "all" : "local")} className={selectedTypology === "local" ? "rounded-full bg-[var(--accent-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]" : "rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"}>{t("common.local")}</button>
        </div>
      </ShellCard>

      <CoverageGridCard
        title={t("coverage.matrix")}
        rows={filteredRows.slice(0, 5).map((event) => ({ id: event.id, label: event.title }))}
        columns={overview.outlets.slice(0, 6).map((outlet) => ({ id: outlet.id, label: outlet.name }))}
        cells={overview.cells}
        emptyLabel={t("coverage.noSignal")}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <RankedListCard
          title={t("coverage.ghostedEvents")}
          items={overview.topGhostedEvents.map((item) => ({
            id: item.id,
            label: item.label,
            value: `${Math.round(item.score * 100)}%`,
            detail: item.detail,
            href: item.href,
            tone: "danger",
          }))}
        />
        <RankedListCard
          title={t("coverage.selectiveOutlets")}
          items={overview.topSelectiveOutlets.map((item) => ({
            id: item.id,
            label: item.label,
            value: `${Math.round(item.score * 100)}%`,
            detail: item.detail,
            href: item.href,
            tone: "warning",
          }))}
        />
      </div>
    </div>
  );
}

