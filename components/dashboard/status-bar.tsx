"use client";

import { useSystemStatus } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { formatDateTime } from "@/lib/utils";

export function PlatformStatusBar() {
  const status = useSystemStatus();
  const { t } = useUiPreferences();

  if (!status) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border-soft)] px-3 py-2 text-[11px] text-[var(--text-muted)] md:px-4">
      <span>{t("status.freshness")}: {status.freshnessMinutes}m</span>
      <span>{t("status.lastIngest")}: {formatDateTime(status.lastIngestAt)}</span>
      <span>{t("status.activeSources")}: {status.activeSources}</span>
      <span>{t("status.warnings")}: {status.warnings.length}</span>
    </div>
  );
}
