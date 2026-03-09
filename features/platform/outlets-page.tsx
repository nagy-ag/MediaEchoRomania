"use client";

import Link from "next/link";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useOutlets } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function OutletsPage() {
  const { t } = useUiPreferences();
  const outlets = useOutlets();

  if (!outlets) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("outlets.heading")} title={t("outlets.heading")} summary="Outlet behavior, specialization, speed, stability, and ghosting patterns across the Romanian ecosystem." />
      <DataTableCard title={t("outlets.heading")} columns={["Outlet", "Scope", "Region", "Speed", "Stability", "Ghosting", "Breadth"]} rows={outlets.map((outlet) => [outlet.name, outlet.scope, outlet.region, `${outlet.speedIndex}`, `${outlet.stabilityIndex}`, `${outlet.ghostingRate}%`, `${outlet.breadth}`])} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {outlets.map((outlet) => (
          <Link key={outlet.id} href={`/outlets/${outlet.id}`} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 hover:border-[var(--border-strong)]">
            <p className="text-sm font-medium text-[var(--text-primary)]">{outlet.name}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{outlet.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
