"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useCodebookStatus, useSystemStatus } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function StatusPage() {
  const { t } = useUiPreferences();
  const status = useSystemStatus();
  const codebook = useCodebookStatus();

  if (!status || !codebook) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("status.heading")} title={t("status.heading")} summary={status.summary} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Freshness" value={`${status.freshnessMinutes}m`} delta={status.publicStatus} status={status.lastIngestAt} />
        <MetricCard label="Sources" value={`${status.activeSources}`} delta="Tracked Romanian outlets" status="Serving layer" />
        <MetricCard label="Warnings" value={`${status.warnings.length}`} delta="Open warnings" status={status.warnings[0] ?? "No warnings"} />
        <MetricCard label="GCAM codes" value={`${codebook.codeCount}`} delta="Reference metadata" status={`Families ${codebook.familyCount}`} />
      </div>
      <DataTableCard title="Jobs" columns={["Job", "Status", "Last run", "Detail"]} rows={status.jobs.map((job) => [job.label, job.status, job.lastRunAt, job.detail])} />
      <DataTableCard title="Incidents" columns={["Title", "Severity", "Why it triggered"]} rows={status.incidents.map((incident) => [incident.title, incident.severity, incident.whyItTriggered])} />
    </div>
  );
}
