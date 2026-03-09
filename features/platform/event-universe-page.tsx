"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { useEventUniverse } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function EventUniversePage() {
  const { t } = useUiPreferences();
  const universe = useEventUniverse();

  if (!universe) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <PageHeader eyebrow={t("universe.heading")} title={t("universe.heading")} summary={universe.summary} />
      <ShellCard className="p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">Graph surface</p>
        <div className="mt-4 grid h-[24rem] place-items-center rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,_rgba(200,245,66,0.12),_transparent_55%),var(--panel-subtle)] text-center text-sm text-[var(--text-muted)]">
          <div>
            <p className="text-base text-[var(--text-primary)]">Clustered event graph placeholder</p>
            <p className="mt-2 max-w-sm">The first production version ships the graph, matrix, and timeline modes against serving-layer data.</p>
          </div>
        </div>
      </ShellCard>
      <DataTableCard title="Nodes" columns={["Label", "Kind", "Coordinates"]} rows={universe.nodes.map((node) => [node.label, node.kind, `${node.x}, ${node.y}`])} />
      <DataTableCard title="Edges" columns={["From", "To", "Label"]} rows={universe.edges.map((edge) => [edge.from, edge.to, edge.label])} />
    </div>
  );
}
