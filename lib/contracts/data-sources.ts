import type {
  AuditCardPayload,
  ComparisonMetric,
  ComparisonRow,
  DashboardOverview,
  PipelineOverview,
  PipelineStatusOverview,
  EventClusterDetail,
  EventClusterSummary,
  OutletProfile,
  OutletSummary,
} from "@/lib/contracts/media-echo";
import type { AppLocale, TimeWindow } from "@/lib/contracts/ui";

export interface DashboardDataSource {
  getDashboardOverview(window: TimeWindow, locale: AppLocale): DashboardOverview;
  getPipelineOverview(window: TimeWindow): PipelineOverview;
  getPipelineStatus(window: TimeWindow): PipelineStatusOverview;
}

export interface EventsDataSource {
  listEvents(window: TimeWindow): EventClusterSummary[];
  getEvent(eventId: string, window: TimeWindow): EventClusterDetail | null;
}

export interface ComparisonDataSource {
  getComparisonMetrics(): ComparisonMetric[];
  getComparisonRows(window: TimeWindow): ComparisonRow[];
}

export interface ProfilesDataSource {
  listOutlets(): OutletSummary[];
  getOutletProfile(outletId: string, window: TimeWindow): OutletProfile | null;
}

export interface AuditCardsDataSource {
  getAuditCard(cardId: string): AuditCardPayload | null;
}
