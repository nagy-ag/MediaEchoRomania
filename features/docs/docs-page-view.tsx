"use client";

import { ShellCard } from "@/components/dashboard/shell-card";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function DocsPageView() {
  const { t } = useUiPreferences();

  const sections = [
    {
      title: t("docs.discoveryTitle"),
      body: t("docs.discoveryBody"),
    },
    {
      title: t("docs.scrapingTitle"),
      body: t("docs.scrapingBody"),
    },
    {
      title: t("docs.extractionTitle"),
      body: t("docs.extractionBody"),
    },
    {
      title: t("docs.clusteringTitle"),
      body: t("docs.clusteringBody"),
    },
    {
      title: t("docs.stateMachineTitle"),
      body: t("docs.stateMachineBody"),
    },
    {
      title: t("docs.omissionsTitle"),
      body: t("docs.omissionsBody"),
    },
  ];

  return (
    <div className="grid gap-4">
      <ShellCard>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("nav.docs")}</p>
        <h1 className="mt-2 [font-family:var(--font-display)] text-[clamp(2rem,3vw,3rem)] leading-none text-[var(--text-primary)]">
          {t("docs.heading")}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">{t("docs.summary")}</p>
      </ShellCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <ShellCard key={section.title} className="min-h-[220px]">
            <h2 className="[font-family:var(--font-display)] text-lg font-semibold text-[var(--text-primary)]">
              {section.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{section.body}</p>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}
