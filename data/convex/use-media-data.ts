"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type {
  AuditCardPayload,
  ComparisonMetric,
  ComparisonRow,
  DashboardOverview,
  EventClusterDetail,
  EventClusterSummary,
  OutletProfile,
  OutletSummary,
  PipelineOverview,
  PipelineStatusOverview,
} from "@/lib/contracts/media-echo";
import type { AppLocale, TimeWindow } from "@/lib/contracts/ui";

export function useDashboardOverview(window: TimeWindow, locale: AppLocale): DashboardOverview | null | undefined {
  return useQuery(api.mediaData.getDashboardOverview, { window, locale });
}

export function usePipelineOverview(window: TimeWindow): PipelineOverview | null | undefined {
  return useQuery(api.mediaData.getPipelineOverview, { window });
}

export function usePipelineStatus(window: TimeWindow): PipelineStatusOverview | null | undefined {
  return useQuery(api.mediaData.getPipelineStatus, { window });
}

export function useEvents(window: TimeWindow): EventClusterSummary[] | undefined {
  return useQuery(api.mediaData.listEvents, { window });
}

export function useEvent(eventId: string, window: TimeWindow): EventClusterDetail | null | undefined {
  return useQuery(api.mediaData.getEvent, { eventId, window });
}

export function useComparisonMetrics(): ComparisonMetric[] | undefined {
  return useQuery(api.mediaData.getComparisonMetrics, {});
}

export function useComparisonRows(window: TimeWindow): ComparisonRow[] | undefined {
  return useQuery(api.mediaData.getComparisonRows, { window });
}

export function useOutlets(): OutletSummary[] | undefined {
  return useQuery(api.mediaData.listOutlets, {});
}

export function useOutletProfiles(window: TimeWindow): OutletProfile[] | undefined {
  return useQuery(api.mediaData.listOutletProfiles, { window });
}

export function useOutletProfile(outletId: string, window: TimeWindow): OutletProfile | null | undefined {
  return useQuery(api.mediaData.getOutletProfile, { outletId, window });
}

export function useAuditCard(cardId: string): AuditCardPayload | null | undefined {
  return useQuery(api.mediaData.getAuditCard, { cardId });
}

