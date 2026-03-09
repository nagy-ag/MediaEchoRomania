"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { useCreateAlert, useMarkAlertSeen, useSystemStatus, useUserAlerts } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function AlertsPage() {
  const { t } = useUiPreferences();
  const { isLoaded, isSignedIn } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const status = useSystemStatus();
  const alerts = useUserAlerts();
  const createAlert = useCreateAlert();
  const markAlertSeen = useMarkAlertSeen();
  const canUsePersonalAlerts = isLoaded && isSignedIn && isAuthenticated && !isLoading;

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("alerts.heading")} title={t("alerts.heading")} summary={t("alerts.summary")} />
      <div className="grid gap-4 xl:grid-cols-2">
        <ShellCard>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Public alerts</h2>
          <div className="mt-4 space-y-3">
            {status?.incidents.map((incident) => (
              <div key={incident.id} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">{incident.title}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{incident.summary}</p>
              </div>
            ))}
          </div>
        </ShellCard>
        <ShellCard>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">My alerts</h2>
            {canUsePersonalAlerts ? (
              <button type="button" onClick={() => void createAlert({ title: "Sample alert", summary: "Track a new anomaly or entity surge.", severity: "warning" })} className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">Create</button>
            ) : isLoaded && !isSignedIn ? (
              <SignInButton mode="modal"><button type="button" className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">Sign in</button></SignInButton>
            ) : (
              <button type="button" disabled className="rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs text-[var(--text-muted)]">Syncing</button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {alerts?.map((alert) => (
              <div key={alert._id} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">{alert.title}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{alert.summary}</p>
                {!alert.seen ? <button type="button" onClick={() => alert._id && void markAlertSeen({ id: alert._id })} className="mt-3 text-xs text-[var(--accent)]">Mark seen</button> : null}
              </div>
            ))}
            {isLoaded && isSignedIn && !canUsePersonalAlerts ? <p className="text-sm text-[var(--text-muted)]">{t("common.loading")}</p> : null}
          </div>
        </ShellCard>
      </div>
    </div>
  );
}
