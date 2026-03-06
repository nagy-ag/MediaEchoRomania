import type { AppLocale, EventPhase, OutletTypology, TimeWindow } from "@/lib/contracts/ui";

export interface ThemeTokenSet {
  background: string;
  backgroundRaised: string;
  backgroundSubtle: string;
  foreground: string;
  muted: string;
  border: string;
  accent: string;
  accentStrong: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeDefinition {
  mode: "dark" | "light";
  tokens: ThemeTokenSet;
}

export interface ActivityFeedItem {
  id: string;
  headline: string;
  meta: string;
  detail: string;
  severity: "low" | "medium" | "high";
  eventId?: string;
}

export interface EventClusterSummary {
  id: string;
  title: string;
  summary: string;
  phase: EventPhase;
  typology: OutletTypology;
  divergenceScore: number;
  viralityScore: number;
  articleCount: number;
  activeOutlets: number;
  coordinates: { x: number; y: number };
}

export interface EventTimelinePoint {
  label: string;
  baseline: number;
  spin: number;
  omissions: number;
}

export interface ClaimNode {
  id: string;
  label: string;
  kind: "person" | "institution" | "claim" | "document";
  x: number;
  y: number;
}

export interface ClaimEdge {
  id: string;
  source: string;
  target: string;
  relation: "supports" | "frames" | "attacks" | "omits";
}

export interface EventClusterDetail extends EventClusterSummary {
  baselineFacts: string[];
  omittedFacts: string[];
  outletAngles: Array<{ outlet: string; angle: string; alignment: number }>;
  timeline: EventTimelinePoint[];
  nodes: ClaimNode[];
  edges: ClaimEdge[];
}

export interface ComparisonMetric {
  id: string;
  label: string;
  description: string;
  emphasis: "positive" | "warning" | "critical";
}

export interface ComparisonRow {
  outletId: string;
  outletName: string;
  typology: OutletTypology;
  metrics: Record<string, number>;
}

export interface CoverageHeatmapCell {
  outletId: string;
  outletName: string;
  eventId: string;
  eventTitle: string;
  score: number;
}

export interface OutletSummary {
  id: string;
  name: string;
  typology: OutletTypology;
  region: string;
  summary: string;
  monthlyReachLabel: string;
}

export interface OutletProfile extends OutletSummary {
  editorialFingerprint: string;
  anonymousSourceRatio: number;
  factualityScore: number;
  speedScore: number;
  hostilityScore: number;
  recentEvents: string[];
  heatmap: CoverageHeatmapCell[];
}

export interface AuditCardPayload {
  id: string;
  outletName: string;
  eventTitle: string;
  baselineFact: string;
  biasedQuote: string;
  finding: string;
  exportCaption: string;
}

export interface PipelineOverview {
  discoveries: number;
  scrapeSuccessRate: number;
  fallbackRate: number;
  manualReviewCount: number;
  averageConsensus: number;
  hostileSpinCount: number;
  clusteredPointShare: number;
  stageVolumes: Array<{ label: string; value: number }>;
  stateMix: Array<{ label: string; value: number }>;
}

export interface PipelineStatusComponent {
  id: string;
  label: string;
  score: number;
  status: "healthy" | "degraded" | "critical";
  detail: string;
}

export interface PipelineStatusHistoryPoint {
  date: string;
  score: number;
  status: "healthy" | "degraded" | "critical";
}

export interface PipelineStatusOverview {
  score: number;
  status: "healthy" | "degraded" | "critical";
  summary: string;
  components: PipelineStatusComponent[];
  history: PipelineStatusHistoryPoint[];
}

export interface DashboardOverview {
  locale: AppLocale;
  window: TimeWindow;
  headline: string;
  summary: string;
  liveEventCount: number;
  activeOutletCount: number;
  divergenceScore: number;
  pipelineHealthScore: number;
  viralityMapLabel: string;
  eventClusters: EventClusterSummary[];
  activityFeed: ActivityFeedItem[];
  narrativeSurge: Array<{ label: string; value: number }>;
  outletActivity: Array<{ label: string; value: number }>;
  coverageHotspots: CoverageHeatmapCell[];
}
