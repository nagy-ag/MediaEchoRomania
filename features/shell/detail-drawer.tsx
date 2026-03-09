"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ShellCard } from "@/components/dashboard/shell-card";

interface DrawerMetric {
  label: string;
  value: string;
}

interface DrawerPayload {
  title: string;
  subtitle?: string;
  metrics?: DrawerMetric[];
  bullets?: string[];
}

interface DetailDrawerContextValue {
  payload: DrawerPayload | null;
  openDrawer: (payload: DrawerPayload) => void;
  closeDrawer: () => void;
}

const DetailDrawerContext = createContext<DetailDrawerContextValue | null>(null);

export function DetailDrawerProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<DrawerPayload | null>(null);
  const value = useMemo(() => ({
    payload,
    openDrawer: (nextPayload: DrawerPayload) => setPayload(nextPayload),
    closeDrawer: () => setPayload(null),
  }), [payload]);

  return <DetailDrawerContext.Provider value={value}>{children}</DetailDrawerContext.Provider>;
}

export function useDetailDrawer() {
  const context = useContext(DetailDrawerContext);
  if (!context) {
    throw new Error("useDetailDrawer must be used inside DetailDrawerProvider");
  }
  return context;
}

export function DetailDrawerPanel() {
  const { payload, closeDrawer } = useDetailDrawer();

  if (!payload) {
    return null;
  }

  return (
    <aside className="hidden 2xl:block 2xl:w-[22rem] 2xl:shrink-0">
      <ShellCard className="sticky top-4 space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Detail drawer</p>
            <h2 className="mt-2 [font-family:var(--font-display)] text-2xl leading-none text-[var(--text-primary)]">{payload.title}</h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>
        {payload.subtitle ? <p className="text-sm leading-6 text-[var(--text-muted)]">{payload.subtitle}</p> : null}
        {payload.metrics?.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {payload.metrics.map((metric) => (
              <div key={metric.label} className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">{metric.label}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{metric.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        {payload.bullets?.length ? (
          <div className="space-y-2 text-sm leading-6 text-[var(--text-muted)]">
            {payload.bullets.map((bullet) => (
              <p key={bullet}>- {bullet}</p>
            ))}
          </div>
        ) : null}
      </ShellCard>
    </aside>
  );
}
