"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useBiasPanel } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function BiasPanelPage() {
  const { t } = useUiPreferences();
  const bias = useBiasPanel();

  if (!bias) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("bias.heading")} title={t("bias.heading")} summary="Selection, ghosting, framing, tone, entity, and attribution asymmetries shown as a panel rather than a single score." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {bias.dimensions.map((dimension) => (
          <MetricCard key={dimension.id} label={dimension.label} value={`${dimension.score}`} delta={dimension.description} status={dimension.tone} />
        ))}
      </div>
      <DataTableCard title={t("bias.heading")} columns={["Outlet", "Selection", "Ghosting", "Framing", "Tone", "Entity", "Attribution"]} rows={bias.outletRows.map((row) => [row.outletName, `${row.selectionBias}`, `${row.ghostingBias}`, `${row.framingBias}`, `${row.toneBias}`, `${row.entityBias}`, `${row.attributionBias}`])} />
    </div>
  );
}
