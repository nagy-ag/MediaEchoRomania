"use client";

import { notFound } from "next/navigation";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useOutletDetail } from "@/lib/convex/use-platform-data";
import { ListPanel, LoadingView } from "@/features/platform/shared";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function OutletDetailPage({ outletId }: { outletId: string }) {
  const { t } = useUiPreferences();
  const outlet = useOutletDetail(outletId);

  if (outlet === undefined) {
    return <LoadingView label={t("common.loading")} />;
  }

  if (outlet === null) {
    notFound();
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("outlets.heading")} title={outlet.name} summary={outlet.summary} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <DataTableCard title="Peer comparison" columns={["Metric", "Value"]} rows={outlet.peerComparison.map((item) => [item.label, `${item.value}`])} />
        <ListPanel title="Top themes" items={outlet.topThemes.map((item) => ({ id: item.label, title: item.label, detail: `Value ${item.value}` }))} />
      </div>
      <DataTableCard title="Recent events" columns={["Event", "Speed", "Stability", "Scope"]} rows={outlet.recentEvents.map((event) => [event.title, `${event.speedScore}`, `${event.stabilityScore}`, event.scope])} />
      <ListPanel title="Notes" items={outlet.notes.map((item, index) => ({ id: `${outlet.id}-note-${index}`, title: `Analyst note ${index + 1}`, detail: item }))} />
    </div>
  );
}
