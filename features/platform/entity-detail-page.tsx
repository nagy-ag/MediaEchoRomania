"use client";

import { notFound } from "next/navigation";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useEntityDetail } from "@/lib/convex/use-platform-data";
import { ChartCard, ListPanel, LoadingView } from "@/features/platform/shared";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function EntityDetailPage({ entityId }: { entityId: string }) {
  const { t } = useUiPreferences();
  const entity = useEntityDetail(entityId);

  if (entity === undefined) {
    return <LoadingView label={t("common.loading")} />;
  }

  if (entity === null) {
    notFound();
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("entities.heading")} title={entity.name} summary={entity.summary} />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Mention trend" points={entity.mentionTrend} />
        <ChartCard title="Tone trend" points={entity.toneTrend} accent="var(--warning)" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard title="Associated events" columns={["Event", "Speed", "Stability"]} rows={entity.associatedEvents.map((event) => [event.title, `${event.speedScore}`, `${event.stabilityScore}`])} />
        <ListPanel title="Co-entities" items={entity.coEntities.map((item) => ({ id: item.label, title: item.label, detail: `Strength ${item.value}` }))} />
      </div>
      <ListPanel title="Seasonality notes" items={entity.seasonalityNotes.map((item, index) => ({ id: `${entity.id}-${index}`, title: `Pattern ${index + 1}`, detail: item }))} />
    </div>
  );
}
