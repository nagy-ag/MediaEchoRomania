"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { useAddBriefRun, useMorningBrief } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { ListPanel, LoadingView } from "@/features/platform/shared";

export function MorningBriefPage() {
  const { t, timeWindow } = useUiPreferences();
  const brief = useMorningBrief(timeWindow);
  const addBriefRun = useAddBriefRun();

  if (!brief) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("brief.heading")} title={t("brief.heading")} summary={brief.summary} aside={<ShellCard className="p-4"><button type="button" onClick={() => void addBriefRun({ timeWindow, summaryText: brief.summary })} className="w-full rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">{t("brief.generate")}</button></ShellCard>} />
      <DataTableCard title={t("brief.heading")} columns={["Event", "Salience", "Speed", "Spread", "Divergence", "Ghosting"]} rows={brief.topDevelopments.map((item) => [item.title, `${item.salience}`, `${item.speed}`, `${item.spread}`, `${item.divergence}`, `${item.ghosting}`])} />
      <div className="grid gap-4 xl:grid-cols-2">
        <ListPanel title={t("brief.whatChanged")} items={brief.changes.map((item, index) => ({ id: `change-${index}`, title: `Change ${index + 1}`, detail: item }))} />
        <ListPanel title={t("brief.undercovered")} items={brief.undercoveredStories.map((item, index) => ({ id: `under-${index}`, title: `Story ${index + 1}`, detail: item }))} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ListPanel title={t("brief.outletBehavior")} items={brief.outletBehaviorHighlights.map((item, index) => ({ id: `outlet-${index}`, title: `Outlet note ${index + 1}`, detail: item }))} />
        <ListPanel title={t("brief.entityMovers")} items={brief.entityMovers.map((item) => ({ id: item.name, title: item.name, detail: item.detail }))} />
      </div>
    </div>
  );
}
