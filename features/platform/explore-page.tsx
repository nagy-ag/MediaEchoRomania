"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { useExplore } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function ExplorePage() {
  const { t } = useUiPreferences();
  const explore = useExplore();

  if (!explore) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("explore.heading")} title={t("explore.heading")} summary={explore.summary} />
      <ShellCard>
        <div className="relative h-[30rem] rounded-[24px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent),var(--panel-subtle)]">
          {explore.points.map((point) => (
            <div key={point.id} className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-semibold text-black" style={{ left: `${point.x}%`, top: `${point.y}%`, background: point.colorToken, width: `${point.size * 4}px`, height: `${point.size * 4}px` }} title={point.detail}>
              {point.label.split(" ")[0]}
            </div>
          ))}
        </div>
      </ShellCard>
    </div>
  );
}
