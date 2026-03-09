"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useDocs, useSystemStatus } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function DocsPage() {
  const { t } = useUiPreferences();
  const docs = useDocs();
  const status = useSystemStatus();

  if (!docs || !status) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("docs.heading")} title={t("docs.heading")} summary="Methodology, data source notes, metric explanations, confidence rules, and GCAM interpretation support." />
      {docs.sections.map((section) => (
        <DataTableCard key={section.id} title={section.title} columns={["Summary", "Details"]} rows={section.bullets.map((bullet) => [section.summary, bullet])} />
      ))}
      <DataTableCard title="Operational caveats" columns={["Warning"]} rows={status.warnings.map((warning) => [warning])} />
    </div>
  );
}
