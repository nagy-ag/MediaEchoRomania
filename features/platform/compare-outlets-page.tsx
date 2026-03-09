"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useCompareOutlets } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function CompareOutletsPage() {
  const { t } = useUiPreferences();
  const compare = useCompareOutlets();

  if (!compare) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("compare.heading")} title={t("compare.heading")} summary="Side-by-side comparison for speed, stability, ghosting, and frame distinctiveness." />
      <DataTableCard title={t("compare.heading")} columns={["Outlet", "Scope", ...compare.metrics.map((metric) => metric.label)]} rows={compare.rows.map((row) => [row.outletName, row.scope, ...compare.metrics.map((metric) => `${row.values[metric.id]}`)])} />
    </div>
  );
}
