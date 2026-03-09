"use client";

import Link from "next/link";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useEvents } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ChartCard, LoadingView } from "@/features/platform/shared";

export function EventsPage() {
  const { t } = useUiPreferences();
  const events = useEvents();

  if (!events) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("events.heading")} title={t("events.heading")} summary="Canonical event tracking with salience, participation, framing, and ghosting signals." />
      <ChartCard title="Event salience" points={events.map((event) => ({ label: event.title.split(" ")[0], value: event.salience }))} />
      <DataTableCard title={t("events.heading")} columns={["Event", "First seen", "Mentions", "Outlets", "Speed", "Stability", "Ghosted by", "Open"]} rows={events.map((event) => [event.title, event.firstSeen.slice(0, 10), `${event.salience}`, `${event.activeOutlets}`, `${event.speedScore}`, `${event.stabilityScore}`, `${event.ghostedBy.length}`, `detail -> /events/${event.id}`])} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 hover:border-[var(--border-strong)]">
            <p className="text-sm font-medium text-[var(--text-primary)]">{event.title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{event.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
