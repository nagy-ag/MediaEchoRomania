"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";
import { useSearchCatalog } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function SearchPageView() {
  const { t, timeWindow } = useUiPreferences();
  const catalog = useSearchCatalog(timeWindow);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const needle = query.trim().toLowerCase();
    if (!needle) {
      return catalog;
    }

    return catalog.filter((entry) => [entry.title, entry.subtitle, ...entry.keywords].join(" ").toLowerCase().includes(needle));
  }, [catalog, query]);

  if (!catalog) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  const groups = ["event", "outlet", "audit", "entity"] as const;
  const groupLabels = {
    event: t("search.event"),
    outlet: t("search.outlet"),
    audit: t("search.audit"),
    entity: t("search.entity"),
  };

  return (
    <div className="grid gap-4">
      <ShellCard>
        <CardHeader title={t("search.heading")} />
        <div className="mt-4 rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
          />
        </div>
      </ShellCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const items = filtered.filter((entry) => entry.type === group).slice(0, 8);
          return (
            <ShellCard key={group}>
              <CardHeader title={groupLabels[group]} badge={<CardBadge tone="muted">{items.length}</CardBadge>} />
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <Link key={item.id} href={item.href} className="block rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3.5 transition hover:border-[var(--border-strong)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.subtitle}</p>
                      </div>
                      <CardBadge tone="accent">{group}</CardBadge>
                    </div>
                  </Link>
                ))}
              </div>
            </ShellCard>
          );
        })}
      </div>
    </div>
  );
}

