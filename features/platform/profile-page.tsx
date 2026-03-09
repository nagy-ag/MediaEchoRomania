"use client";

import { startTransition, type ReactNode } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import {
  useBriefRuns,
  useDashboardPreferences,
  useSavedViews,
  useUpsertDashboardPreferences,
  useUserAlerts,
  useUserNotes,
  useViewerState,
  useWatchlists,
} from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { cn } from "@/lib/utils";

const densityOptions = ["comfortable", "compact", "analyst"] as const;
const localeOptions = ["en", "ro", "hu"] as const;
const themeOptions = ["dark", "light"] as const;

export function ProfilePage() {
  const { isLoaded: isClerkLoaded, isSignedIn, user } = useUser();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const viewer = useViewerState();
  const preferences = useDashboardPreferences();
  const savedViews = useSavedViews();
  const watchlists = useWatchlists();
  const alerts = useUserAlerts();
  const notes = useUserNotes();
  const briefRuns = useBriefRuns();
  const upsertPreferences = useUpsertDashboardPreferences();
  const { density, setDensity, locale, setLocale, theme, setTheme, t } = useUiPreferences();

  const isSyncingWorkspace = isClerkLoaded && isSignedIn && (isConvexLoading || !isAuthenticated || !viewer);
  const viewerName = viewer?.viewer?.name ?? user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "-";
  const viewerEmail = viewer?.viewer?.email ?? user?.primaryEmailAddress?.emailAddress ?? "-";
  const viewerRole = viewer?.viewer?.role ?? "viewer";

  if (!isClerkLoaded || isSyncingWorkspace) {
    return (
      <div className="grid gap-4">
        <PageHeader eyebrow={t("nav.profile")} title={t("profile.heading")} summary={t("profile.summary")} />
        <ShellCard>
          <p className="text-sm leading-6 text-[var(--text-muted)]">{t("common.loading")}</p>
        </ShellCard>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="grid gap-4">
        <PageHeader eyebrow={t("nav.profile")} title={t("profile.heading")} summary={t("profile.summary")} />
        <ShellCard>
          <p className="text-sm leading-6 text-[var(--text-muted)]">{t("profile.signInBody")}</p>
          <SignInButton mode="modal">
            <button type="button" className="mt-4 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">
              {t("controls.signIn")}
            </button>
          </SignInButton>
        </ShellCard>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("nav.profile")} title={t("profile.heading")} summary={t("profile.summary")} />
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <ShellCard>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t("profile.account")}</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
            <ProfileRow label={t("controls.profile")} value={viewerName} />
            <ProfileRow label={t("profile.email")} value={viewerEmail} />
            <ProfileRow label={t("profile.role")} value={viewerRole} />
            <ProfileRow label={t("profile.density")} value={preferences?.density ?? density} />
          </div>
        </ShellCard>

        <ShellCard>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t("profile.preferences")}</h2>
          <div className="mt-4 grid gap-4">
            <PreferenceGroup label={t("profile.theme")}>
              {themeOptions.map((option) => (
                <PreferencePill key={option} active={theme === option} onClick={() => setTheme(option)}>
                  {option === "dark" ? t("controls.themeDark") : t("controls.themeLight")}
                </PreferencePill>
              ))}
            </PreferenceGroup>
            <PreferenceGroup label={t("profile.locale")}>
              {localeOptions.map((option) => (
                <PreferencePill key={option} active={locale === option} onClick={() => setLocale(option)}>
                  {option.toUpperCase()}
                </PreferencePill>
              ))}
            </PreferenceGroup>
            <PreferenceGroup label={t("profile.density")}>
              {densityOptions.map((option) => (
                <PreferencePill
                  key={option}
                  active={density === option}
                  onClick={() => {
                    setDensity(option);
                    startTransition(() => {
                      void upsertPreferences({ density: option, pinnedWidgets: preferences?.pinnedWidgets ?? [] });
                    });
                  }}
                >
                  {option}
                </PreferencePill>
              ))}
            </PreferenceGroup>
          </div>
        </ShellCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ShellCard>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t("profile.activity")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatTile label={t("savedViews.heading")} value={savedViews?.length ?? 0} />
            <StatTile label="Watchlists" value={watchlists?.length ?? 0} />
            <StatTile label={t("alerts.heading")} value={alerts?.length ?? 0} />
            <StatTile label="Notes" value={notes?.length ?? 0} />
          </div>
        </ShellCard>

        <ShellCard>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t("profile.recentBriefs")}</h2>
          <div className="mt-4 space-y-3">
            {(briefRuns ?? []).slice(0, 4).map((brief) => (
              <div key={brief._id} className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)]">{brief.timeWindow}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{brief.summaryText}</p>
              </div>
            ))}
            {!briefRuns?.length ? <p className="text-sm text-[var(--text-muted)]">{t("common.noData")}</p> : null}
          </div>
        </ShellCard>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
      <span className="text-[var(--text-subtle)]">{label}</span>
      <span className="text-right text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function PreferenceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)]">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PreferencePill({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.12em]",
        active ? "border-[var(--border-strong)] bg-[var(--accent-surface)] text-[var(--text-primary)]" : "border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
      )}
    >
      {children}
    </button>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">{label}</p>
      <p className="mt-2 text-2xl text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
