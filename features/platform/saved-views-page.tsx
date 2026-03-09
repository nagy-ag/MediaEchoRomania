"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { useCreateSavedView, useCreateWatchlist, useRemoveSavedView, useRemoveWatchlist, useSavedViews, useWatchlists } from "@/lib/convex/use-platform-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function SavedViewsPage() {
  const { t } = useUiPreferences();
  const { isLoaded, isSignedIn } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const savedViews = useSavedViews();
  const watchlists = useWatchlists();
  const createSavedView = useCreateSavedView();
  const removeSavedView = useRemoveSavedView();
  const createWatchlist = useCreateWatchlist();
  const removeWatchlist = useRemoveWatchlist();

  const authRequired = isLoaded && !isSignedIn;
  const isSyncingWorkspace = isLoaded && isSignedIn && (isLoading || !isAuthenticated);

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t("savedViews.heading")} title={t("savedViews.heading")} summary={t("savedViews.summary")} />
      {authRequired ? <GateCard /> : null}
      {isSyncingWorkspace ? (
        <ShellCard>
          <p className="text-sm text-[var(--text-muted)]">{t("common.loading")}</p>
        </ShellCard>
      ) : null}
      {!authRequired && !isSyncingWorkspace ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <ShellCard>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Saved views</h2>
              <button type="button" onClick={() => void createSavedView({ name: "overview snapshot", pageType: "overview", filtersSummary: "{}", layoutJson: undefined, isShared: false })} className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">Create</button>
            </div>
            <div className="mt-4 space-y-3">
              {savedViews?.map((view) => (
                <div key={view._id} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{view.name}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{view.pageType}</p>
                  <button type="button" onClick={() => view._id && void removeSavedView({ id: view._id })} className="mt-3 text-xs text-[var(--danger)]">Delete</button>
                </div>
              ))}
            </div>
          </ShellCard>
          <ShellCard>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Watchlists</h2>
              <button type="button" onClick={() => void createWatchlist({ name: "Energy and elections", targets: ["Energy", "Elections"] })} className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">Create</button>
            </div>
            <div className="mt-4 space-y-3">
              {watchlists?.map((watchlist) => (
                <div key={watchlist._id} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{watchlist.name}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{watchlist.targets.join(", ")}</p>
                  <button type="button" onClick={() => watchlist._id && void removeWatchlist({ id: watchlist._id })} className="mt-3 text-xs text-[var(--danger)]">Delete</button>
                </div>
              ))}
            </div>
          </ShellCard>
        </div>
      ) : null}
    </div>
  );
}

function GateCard() {
  return (
    <ShellCard>
      <p className="text-sm text-[var(--text-muted)]">Sign in to persist saved views and watchlists.</p>
      <SignInButton mode="modal">
        <button type="button" className="mt-4 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">Sign in</button>
      </SignInButton>
    </ShellCard>
  );
}
