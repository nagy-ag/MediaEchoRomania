"use client";

import Link from "next/link";
import { useEvent, useEvents } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { EventUniverseCard } from "@/components/dashboard/event-universe-card";
import { LineAreaCard } from "@/components/dashboard/line-area-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { cn, formatPercent } from "@/lib/utils";

export function EventsPageView() {
  const { t, timeWindow } = useUiPreferences();
  const events = useEvents(timeWindow);

  if (!events) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <EventUniverseCard title={t("events.universe")} events={events} />
      <ShellCard>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("events.heading")}</p>
        <div className="mt-4 grid gap-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{event.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{event.summary}</p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]", event.typology === "national" ? "bg-[var(--accent-surface)] text-[var(--text-primary)]" : "bg-[var(--panel-bg)] text-[var(--text-muted)]")}>{event.typology}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-subtle)]">
                <span>{formatPercent(event.divergenceScore)} divergence</span>
                <span>{event.articleCount} articles</span>
              </div>
            </Link>
          ))}
        </div>
      </ShellCard>
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
    <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="grid gap-4">
        <ShellCard>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("events.heading")}</p>
          <h1 className="mt-2 [font-family:var(--font-display)] text-[clamp(1.9rem,3vw,2.8rem)] leading-none text-[var(--text-primary)]">{event.title}</h1>
          <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">{event.summary}</p>
        </ShellCard>
        <LineAreaCard title={t("events.timeline")} points={event.timeline.map((point) => ({ label: point.label, value: point.spin }))} accent="var(--danger)" />
        <ShellCard>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("events.angles")}</p>
          <div className="mt-4 grid gap-3">
            {event.outletAngles.map((item) => (
              <article key={item.outlet} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.outlet}</p>
                  <span className="text-xs text-[var(--text-subtle)]">{formatPercent(item.alignment)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.angle}</p>
              </article>
            ))}
          </div>
        </ShellCard>
      </div>

      <div className="grid gap-4">
        <ShellCard>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("events.baseline")}</p>
          <div className="mt-4 space-y-3">
            {event.baselineFacts.map((fact) => (
              <div key={fact} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)]">{fact}</div>
            ))}
          </div>
        </ShellCard>
        <ShellCard>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--danger)]">{t("events.omissions")}</p>
          <div className="mt-4 space-y-3">
            {event.omittedFacts.map((fact) => (
              <div key={fact} className="rounded-[20px] border border-[color:color-mix(in_srgb,var(--danger)_50%,var(--border-soft))] bg-[color:color-mix(in_srgb,var(--danger)_8%,var(--panel-subtle))] px-4 py-3 text-sm leading-6 text-[var(--text-primary)]">{fact}</div>
            ))}
          </div>
        </ShellCard>
      </div>
    </div>
  );
}
