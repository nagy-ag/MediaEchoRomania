"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useEvent, useEvents } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { EventUniverseCard } from "@/components/dashboard/event-universe-card";
import { RankedListCard } from "@/components/dashboard/ranked-list-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardBadge, CardHeader } from "@/components/dashboard/card-header";
import { formatPercent } from "@/lib/utils";

const filterOptions = ["all", "national", "local"] as const;
const phaseOptions = ["all", "emerging", "consensus", "spin", "resolved"] as const;

export function EventsPageView() {
  const { t, timeWindow } = useUiPreferences();
  const events = useEvents(timeWindow);
  const [typology, setTypology] = useState<(typeof filterOptions)[number]>("all");
  const [phase, setPhase] = useState<(typeof phaseOptions)[number]>("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!events) {
      return [];
    }

    return events.filter((event) => (typology === "all" || event.typology === typology) && (phase === "all" || event.phase === phase));
  }, [events, phase, typology]);

  const effectiveSelectedEventId = selectedEventId && filteredEvents.some((event) => event.id === selectedEventId)
    ? selectedEventId
    : filteredEvents[0]?.id ?? null;
  const selectedEvent = filteredEvents.find((event) => event.id === effectiveSelectedEventId);
  const eventDetail = useEvent(effectiveSelectedEventId ?? "", timeWindow);

  if (!events) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-4">
        <ShellCard>
          <CardHeader title={t("events.universe")} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTypology(option)}
                className={typology === option ? "rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-contrast)]" : "rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"}
              >
                {option}
              </button>
            ))}
            {phaseOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPhase(option)}
                className={phase === option ? "rounded-full bg-[var(--accent-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]" : "rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"}
              >
                {option}
              </button>
            ))}
          </div>
        </ShellCard>
        <EventUniverseCard title={t("events.universeMap")} events={filteredEvents} />
        <ShellCard>
          <CardHeader title={t("events.eventList")} />
          <div className="mt-4 grid gap-3">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEventId(event.id)}
                className={effectiveSelectedEventId === event.id ? "rounded-[22px] border border-[var(--border-strong)] bg-[var(--accent-surface)] px-4 py-4 text-left" : "rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 text-left transition hover:border-[var(--border-strong)]"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{event.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{event.summary}</p>
                  </div>
                  <CardBadge tone={event.typology === "national" ? "accent" : "warning"}>{event.typology}</CardBadge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-subtle)]">
                  <span>{formatPercent(event.divergenceScore)} divergence</span>
                  <span>{event.articleCount} articles</span>
                </div>
              </button>
            ))}
          </div>
        </ShellCard>
      </div>

      <div className="grid gap-4">
        {selectedEvent ? (
          <ShellCard>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("events.selected")}</p>
            <h1 className="mt-2 [font-family:var(--font-display)] text-[clamp(1.9rem,3vw,2.8rem)] leading-none text-[var(--text-primary)]">{selectedEvent.title}</h1>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{eventDetail?.phaseSummary ?? selectedEvent.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{t("events.divergenceLabel")}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{formatPercent(selectedEvent.divergenceScore)}</p>
              </div>
              <div className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{t("events.viralityLabel")}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{formatPercent(selectedEvent.viralityScore)}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/events/${selectedEvent.id}`} className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)]">
                {t("events.openDetail")}
              </Link>
              <Link href="/compare" className="rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)]">
                {t("events.compareAction")}
              </Link>
            </div>
          </ShellCard>
        ) : (
          <ShellCard>{t("common.noData")}</ShellCard>
        )}

        {eventDetail ? (
          <RankedListCard
            title={t("events.auditLinks")}
            items={eventDetail.topArticles.map((article) => ({
              id: article.id,
              label: article.title,
              value: `${article.viralityScore}%`,
              detail: `${article.outletName} | ${article.eventTitle}`,
              href: article.auditCardId ? `/audit-cards/${article.auditCardId}` : `/events/${article.eventId}`,
              tone: article.framing === "spin" ? "danger" : article.framing === "omission" ? "warning" : "accent",
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}

export function EventDetailPageView({ eventId }: { eventId: string }) {
  const { t, timeWindow } = useUiPreferences();
  const event = useEvent(eventId, timeWindow);

  if (event === undefined) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  if (!event) {
    return <ShellCard>{t("common.noData")}</ShellCard>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4">
        <ShellCard>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("events.heading")}</p>
          <h1 className="mt-2 [font-family:var(--font-display)] text-[clamp(1.9rem,3vw,2.8rem)] leading-none text-[var(--text-primary)]">{event.title}</h1>
          <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">{event.phaseSummary}</p>
        </ShellCard>

        <ShellCard>
          <CardHeader title={t("events.timeline")} />
          <div className="mt-4 space-y-3">
            {event.timeline.map((point) => (
              <div key={point.label} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-subtle)]">
                  <span>{point.label}</span>
                  <span>{point.baseline}/{point.spin}/{point.omissions}</span>
                </div>
                <div className="mt-3 grid gap-2">
                  <TimelineBar label="Baseline" value={point.baseline} tone="var(--accent)" />
                  <TimelineBar label="Spin" value={point.spin} tone="var(--warning)" />
                  <TimelineBar label="Omissions" value={point.omissions} tone="var(--danger)" />
                </div>
              </div>
            ))}
          </div>
        </ShellCard>

        <RankedListCard
          title={t("events.angles")}
          items={event.outletAngles.map((item) => ({
            id: item.outlet,
            label: item.outlet,
            value: `${item.alignment}%`,
            detail: item.angle,
            href: "/compare",
            tone: item.alignment >= 75 ? "accent" : item.alignment >= 55 ? "warning" : "danger",
          }))}
        />
      </div>

      <div className="grid gap-4">
        <RankedListCard
          title={t("events.baseline")}
          items={event.baselineFacts.map((fact, index) => ({ id: `${index}`, label: fact, value: t("events.baselineShort"), detail: fact, tone: "accent" }))}
        />
        <RankedListCard
          title={t("events.omissions")}
          items={event.omittedFacts.map((fact, index) => ({ id: `${index}`, label: fact, value: t("events.omissionShort"), detail: fact, tone: "danger" }))}
        />
        <RankedListCard
          title={t("events.relatedAudits")}
          items={event.topArticles.map((article) => ({
            id: article.id,
            label: article.title,
            value: `${article.viralityScore}%`,
            detail: `${article.outletName} on ${article.eventTitle}`,
            href: article.auditCardId ? `/audit-cards/${article.auditCardId}` : `/events/${article.eventId}`,
            tone: article.framing === "spin" ? "danger" : article.framing === "omission" ? "warning" : "accent",
          }))}
        />
      </div>
    </div>
  );
}

function TimelineBar({ label, value, tone }: { label: string; value: number; tone: string }) {
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
