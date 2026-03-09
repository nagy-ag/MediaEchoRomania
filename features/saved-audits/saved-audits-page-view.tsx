"use client";

import Link from "next/link";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";
import { useAuditLibrary } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function SavedAuditsPageView() {
  const { t, timeWindow } = useUiPreferences();
  const audits = useAuditLibrary(timeWindow);

  if (!audits) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  return (
    <div className="grid gap-4">
      <ShellCard>
        <CardHeader title={t("savedAudits.heading")} />
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{t("savedAudits.summary")}</p>
      </ShellCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {audits.map((audit) => (
          <Link key={audit.id} href={audit.href} className="block rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{audit.articleTitle}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{audit.outletName} | {audit.eventTitle}</p>
              </div>
              <CardBadge tone="accent">{audit.viralityScore}%</CardBadge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">{audit.finding}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

