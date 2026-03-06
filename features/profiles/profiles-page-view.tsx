"use client";

import { useOutletProfile, useOutlets } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { HeatmapPreviewCard } from "@/components/dashboard/heatmap-preview-card";
import { OutletDirectoryCard } from "@/components/dashboard/outlet-directory-card";
import { ShellCard } from "@/components/dashboard/shell-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatPercent } from "@/lib/utils";

export function ProfilesPageView() {
  const { t } = useUiPreferences();
  const outlets = useOutlets();

  if (!outlets) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4">
      <OutletDirectoryCard title={t("profiles.directory")} outlets={outlets} />
    </div>
  );
}

export function ProfileDetailPageView({ outletId }: { outletId: string }) {
  const { t, timeWindow } = useUiPreferences();
  const outlet = useOutletProfile(outletId, timeWindow);

  if (outlet === undefined) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  if (!outlet) {
    return <ShellCard>{t("common.noData")}</ShellCard>;
  }

  return (
    <div className="grid gap-4">
      <ShellCard>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("profiles.heading")}</p>
        <h1 className="mt-2 [font-family:var(--font-display)] text-[clamp(1.9rem,3vw,2.8rem)] leading-none text-[var(--text-primary)]">{outlet.name}</h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">{outlet.editorialFingerprint}</p>
      </ShellCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Factuality" value={formatPercent(outlet.factualityScore)} tone="accent" note="Baseline alignment and evidence quality." />
        <StatCard label="Speed" value={formatPercent(outlet.speedScore)} note="Responsiveness in breaking story cycles." />
        <StatCard label="Anonymous" value={formatPercent(outlet.anonymousSourceRatio)} tone="warning" note="Opaque sourcing share in the current profile." />
        <StatCard label="Hostility" value={formatPercent(outlet.hostilityScore)} tone="danger" note="Net adversarial framing against key actors." />
      </div>
      <HeatmapPreviewCard title={t("profiles.coverage")} metrics={outlet.heatmap.slice(0, 2).map((h) => ({ label: h.eventTitle, value: Math.round(h.score * 100), displayValue: `${Math.round(h.score * 100)}%`, tone: h.score > 0.7 ? "var(--danger)" : "var(--accent)" }))} />
    </div>
  );
}
