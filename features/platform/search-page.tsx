"use client";

import { useMemo, useState } from "react";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSearchResults } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { LoadingView } from "@/features/platform/shared";

export function SearchPage() {
  const { t } = useUiPreferences();
  const results = useSearchResults();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!results) {
      return [];
    }
    if (!query.trim()) {
      return results;
    }
    const normalized = query.toLowerCase();
    return results.filter((item) => [item.title, item.subtitle, ...item.keywords].join(" ").toLowerCase().includes(normalized));
  }, [query, results]);

  if (!results) {
    return <LoadingView label={t("common.loading")} />;
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("search.heading")} title={t("search.heading")} summary="Keyboard-first search across events, outlets, entities, and themes." />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("controls.search")} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none" />
      <DataTableCard title={t("search.heading")} columns={["Type", "Title", "Subtitle", "Href"]} rows={filtered.map((item) => [item.type, item.title, item.subtitle, item.href])} />
    </div>
  );
}
