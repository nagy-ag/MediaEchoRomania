"use client";

import { notFound } from "next/navigation";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useEventDetail } from "@/lib/convex/use-platform-data";
import { ChartCard, LoadingView, ListPanel } from "@/features/platform/shared";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function EventDetailPage({ eventId }: { eventId: string }) {
  const { t } = useUiPreferences();
  const event = useEventDetail(eventId);

  if (event === undefined) {
    return <LoadingView label={t("common.loading")} />;
  }

  if (event === null) {
    notFound();
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("events.heading")} title={event.title} summary={event.summary} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <ChartCard title="Coverage timeline" points={event.timeline} />
        <ListPanel title="Explainability notes" items={event.explainabilityNotes.map((item, index) => ({ id: `${event.id}-note-${index}`, title: `Note ${index + 1}`, detail: item }))} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard title="Outlet participation" columns={["Outlet", "Lag", "Frame", "Tone"]} rows={event.participationByOutlet.map((row) => [row.outletName, `${row.lagMinutes}m`, row.frameLabel, row.toneLabel])} />
        <DataTableCard title="Propagation path" columns={["From", "To", "Lag", "Wave"]} rows={event.propagationPath.map((row) => [row.from, row.to, `${row.lagMinutes}m`, row.wave])} />
      </div>
      <DataTableCard title="Contradictions" columns={["Type", "Severity", "Summary"]} rows={event.contradictions.map((row) => [row.type, row.severity, row.summary])} />
    </div>
  );
}
