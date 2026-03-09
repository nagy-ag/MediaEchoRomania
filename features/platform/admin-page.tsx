"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { useCodebookStatus } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function AdminPage() {
  const { t } = useUiPreferences();
  const codebook = useCodebookStatus();

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("admin.heading")} title={t("admin.heading")} summary={t("admin.summary")} />
      <div className="grid gap-4 xl:grid-cols-2">
        <ShellCard>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Access</h2>
          <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
            This route is isolated behind a URL-level password gate and is intentionally kept outside the main sidebar.
          </p>
        </ShellCard>
        <ShellCard>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">GCAM codebook</h2>
          <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">{codebook ? `${codebook.codeCount} codes across ${codebook.familyCount} families.` : "Loading..."}</p>
        </ShellCard>
      </div>
    </div>
  );
}