"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { TimeWindow } from "@/lib/contracts/ui";

export function useOverview(window: TimeWindow) {
  return useQuery(api.analytics.overview, { window });
}

export function useMorningBrief(window: TimeWindow) {
  return useQuery(api.analytics.morningBrief, { window });
}

export function useEventUniverse() {
  return useQuery(api.analytics.eventUniverse, {});
}

export function useEvents() {
  return useQuery(api.analytics.events, {});
}

export function useEventDetail(eventId: string) {
  return useQuery(api.analytics.eventDetail, { eventId });
}

export function useOutlets() {
  return useQuery(api.analytics.outlets, {});
}

export function useOutletDetail(outletId: string) {
  return useQuery(api.analytics.outletDetail, { outletId });
}

export function useCompareOutlets() {
  return useQuery(api.analytics.compareOutlets, {});
}

export function useEntities() {
  return useQuery(api.analytics.entities, {});
}

export function useEntityDetail(entityId: string) {
  return useQuery(api.analytics.entityDetail, { entityId });
}

export function usePropagation() {
  return useQuery(api.analytics.propagation, {});
}

export function useContradictions() {
  return useQuery(api.analytics.contradictions, {});
}

export function useBiasPanel() {
  return useQuery(api.analytics.biasPanel, {});
}

export function useSeasonality() {
  return useQuery(api.analytics.seasonality, {});
}

export function useLocalVsNational() {
  return useQuery(api.analytics.localVsNational, {});
}

export function useExplore() {
  return useQuery(api.analytics.explore, {});
}

export function useSearchResults() {
  return useQuery(api.analytics.search, {});
}

export function useDocs() {
  return useQuery(api.analytics.docs, {});
}

export function useSystemStatus() {
  return useQuery(api.analytics.status, {});
}

export function useViewerState() {
  return useQuery(api.userState.viewerState, {});
}

export function useSavedViews() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return useQuery(api.userState.savedViews, isLoading || !isAuthenticated ? "skip" : {});
}

export function useWatchlists() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return useQuery(api.userState.watchlists, isLoading || !isAuthenticated ? "skip" : {});
}

export function useUserAlerts() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return useQuery(api.userState.alerts, isLoading || !isAuthenticated ? "skip" : {});
}

export function useUserNotes() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return useQuery(api.userState.notes, isLoading || !isAuthenticated ? "skip" : {});
}

export function useDashboardPreferences() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return useQuery(api.userState.dashboardPreferences, isLoading || !isAuthenticated ? "skip" : {});
}

export function useBriefRuns() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return useQuery(api.userState.briefRuns, isLoading || !isAuthenticated ? "skip" : {});
}

export function useAdminSummary() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return useQuery(api.userState.adminSummary, isLoading || !isAuthenticated ? "skip" : {});
}

export function useCodebookStatus() {
  return useQuery(api.gcam.getCodebookStatus, {});
}

export function useCreateSavedView() {
  return useMutation(api.userState.createSavedView);
}

export function useRemoveSavedView() {
  return useMutation(api.userState.removeSavedView);
}

export function useCreateWatchlist() {
  return useMutation(api.userState.createWatchlist);
}

export function useRemoveWatchlist() {
  return useMutation(api.userState.removeWatchlist);
}

export function useCreateAlert() {
  return useMutation(api.userState.createAlert);
}

export function useMarkAlertSeen() {
  return useMutation(api.userState.markAlertSeen);
}

export function useCreateNote() {
  return useMutation(api.userState.createNote);
}

export function useDeleteNote() {
  return useMutation(api.userState.deleteNote);
}

export function useUpsertDashboardPreferences() {
  return useMutation(api.userState.upsertDashboardPreferences);
}

export function useAddBriefRun() {
  return useMutation(api.userState.addBriefRun);
}

export function useStoreCurrentUser() {
  return useMutation(api.userState.storeCurrentUser);
}
