"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useContradictions } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function ContradictionsPage() {
  const { t } = useUiPreferences();
  const contradictions = useContradictions();

  if (!contradictions) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("contradictions.heading")} title={t("contradictions.heading")} summary="Disagreement, tone splits, and frame divergence across active event clusters." />
      <DataTableCard title={t("contradictions.heading")} columns={["Event", "Type", "Severity", "Detected", "Summary"]} rows={contradictions.map((item) => [item.eventTitle, item.divergenceType, item.severity, item.firstDetectedAt.slice(0, 16), item.summary])} />
    </div>
  );
}
