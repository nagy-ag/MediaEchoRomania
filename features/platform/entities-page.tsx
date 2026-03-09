"use client";

import Link from "next/link";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useEntities } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function EntitiesPage() {
  const { t } = useUiPreferences();
  const entities = useEntities();

  if (!entities) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("entities.heading")} title={t("entities.heading")} summary="Track people, organizations, and locations across tone, outlet behavior, and associated events." />
      <DataTableCard title={t("entities.heading")} columns={["Entity", "Type", "Top outlets", "Themes"]} rows={entities.map((entity) => [entity.name, entity.type, entity.topOutlets.join(", "), entity.themes.join(", ")])} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {entities.map((entity) => (
          <Link key={entity.id} href={`/entities/${entity.id}`} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-4 hover:border-[var(--border-strong)]">
            <p className="text-sm font-medium text-[var(--text-primary)]">{entity.name}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{entity.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
