"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSeasonality } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ChartCard, ListPanel, LoadingView } from "@/features/platform/shared";

export function SeasonalityPage() {
  const { t } = useUiPreferences();
  const seasonality = useSeasonality();

  if (!seasonality) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("seasonality.heading")} title={t("seasonality.heading")} summary={seasonality.summary} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <ChartCard title="Calendar intensity" points={seasonality.calendar.map((item) => ({ label: item.label, value: item.intensity }))} />
        <ListPanel title="Patterns" items={seasonality.patterns.map((pattern) => ({ id: pattern.label, title: pattern.label, detail: pattern.detail }))} />
      </div>
      <DataTableCard title="Recurring themes" columns={["Theme", "Value"]} rows={seasonality.recurringThemes.map((item) => [item.label, `${item.value}`])} />
    </div>
  );
}