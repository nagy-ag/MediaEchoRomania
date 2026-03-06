"use client";

import { usePipelineOverview, usePipelineStatus } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { PipelineHistoryCard } from "@/components/dashboard/pipeline-history-card";
import { PipelineOpsCard } from "@/components/dashboard/pipeline-ops-card";
import { PipelineStatusSummaryCard } from "@/components/dashboard/pipeline-status-summary-card";
import { ShellCard } from "@/components/dashboard/shell-card";

export function StatusPageView() {
  const { t, timeWindow } = useUiPreferences();
  const status = usePipelineStatus(timeWindow);
  const overview = usePipelineOverview(timeWindow);

  if (!status || !overview) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4">
      <PipelineStatusSummaryCard
        title={t("status.heading")}
        summary={status.summary}
        status={status}
        uptimeLabel={t("status.uptime")}
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <PipelineHistoryCard title={t("status.history")} history={status.history} />
        <PipelineOpsCard title={t("status.components")} pipeline={overview} />
      </div>
    </div>
  );
}
