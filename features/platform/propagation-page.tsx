"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { usePropagation } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ListPanel, LoadingView } from "@/features/platform/shared";

export function PropagationPage() {
  const { t } = useUiPreferences();
  const propagation = usePropagation();

  if (!propagation) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("propagation.heading")} title={t("propagation.heading")} summary={propagation.waveSummary} />
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard title="Edges" columns={["From", "To", "Lag", "Strength", "Event"]} rows={propagation.edges.map((edge) => [edge.from, edge.to, `${edge.lagMinutes}m`, `${edge.strength}`, edge.eventTitle])} />
        <ListPanel title="Top pathways" items={propagation.topPathways.map((path) => ({ id: path.id, title: path.eventTitle, detail: path.summary, meta: `Lead: ${path.firstMover}` }))} />
      </div>
    </div>
  );
}
