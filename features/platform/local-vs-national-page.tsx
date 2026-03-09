"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useLocalVsNational } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ListPanel, LoadingView } from "@/features/platform/shared";

export function LocalVsNationalPage() {
  const { t } = useUiPreferences();
  const divide = useLocalVsNational();

  if (!divide) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("localVsNational.heading")} title={t("localVsNational.heading")} summary={divide.summary} />
      <div className="grid gap-4 xl:grid-cols-2">
        <ListPanel title="National highlights" items={divide.nationalHighlights.map((item) => ({ id: item.id, title: item.title, detail: item.summary, meta: item.region }))} />
        <ListPanel title="Local highlights" items={divide.localHighlights.map((item) => ({ id: item.id, title: item.title, detail: item.summary, meta: item.region }))} />
      </div>
      <DataTableCard title="Coverage gaps" columns={["Event", "Local", "National", "Gap type"]} rows={divide.coverageGaps.map((item) => [item.eventTitle, `${item.localCoverage}`, `${item.nationalCoverage}`, item.gapType])} />
    </div>
  );
}
