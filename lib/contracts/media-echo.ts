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

export interface BriefingHighlight {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "accent" | "warning" | "danger" | "muted";
  href?: string;
}

export interface TopViralArticle {
  id: string;
  title: string;
  outletId: string;
  outletName: string;
  eventId: string;
  eventTitle: string;
  viralityScore: number;
  framing: "baseline" | "spin" | "omission";
  publishedAt: string;
  auditCardId?: string;
}

export interface QuickLinkItem {
  id: string;
  label: string;
  description: string;
  href: string;
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
  phaseSummary: string;
  outletAngles: Array<{ outlet: string; angle: string; alignment: number }>;
  timeline: EventTimelinePoint[];
  nodes: ClaimNode[];
  edges: ClaimEdge[];
  relatedAuditCardIds: string[];
  topArticles: TopViralArticle[];
  comparisonOutletIds: string[];
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

export interface CoverageGapRankingItem {
  id: string;
  label: string;
  score: number;
  detail: string;
  href: string;
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
  partisanFingerprint: Array<{ label: string; value: number }>;
  sourceMix: Array<{ label: string; value: number }>;
  speedVsClickbait: {
    speed: number;
    clickbait: number;
    quadrantLabel: string;
  };
  topTargets: string[];
  ignoredTopics: string[];
}

export interface AuditCardPayload {
  id: string;
  outletId: string;
  outletName: string;
  eventId: string;
  eventTitle: string;
  articleTitle: string;
  baselineFact: string;
  biasedQuote: string;
  finding: string;
  exportCaption: string;
  articleSummary: string;
  omissionNotes: string[];
  evidence: Array<{ label: string; value: string }>;
  relatedProfileId: string;
  relatedEventId: string;
  publishedAt: string;
  viralityScore: number;
}

export interface AuditLibraryItem {
  id: string;
  outletId: string;
  outletName: string;
  eventId: string;
  eventTitle: string;
  articleTitle: string;
  finding: string;
  href: string;
  publishedAt: string;
  viralityScore: number;
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
  morningBriefing: string;
  liveEventCount: number;
  activeOutletCount: number;
  divergenceScore: number;
  pipelineHealthScore: number;
  viralityMapLabel: string;
  eventClusters: EventClusterSummary[];
  briefingHighlights: BriefingHighlight[];
  topViralArticles: TopViralArticle[];
  quickLinks: QuickLinkItem[];
  activityFeed: ActivityFeedItem[];
  narrativeSurge: Array<{ label: string; value: number }>;
  outletActivity: Array<{ label: string; value: number }>;
  coverageHotspots: CoverageHeatmapCell[];
}

export interface CoverageGapsOverview {
  summary: string;
  cells: CoverageHeatmapCell[];
  topGhostedEvents: CoverageGapRankingItem[];
  topSelectiveOutlets: CoverageGapRankingItem[];
  events: EventClusterSummary[];
  outlets: OutletSummary[];
}

export interface TypologyDivideOverview {
  summary: string;
  divergenceScore: number;
  nationalHighlights: EventClusterSummary[];
  localHighlights: EventClusterSummary[];
  sharedEvents: Array<{
    eventId: string;
    eventTitle: string;
    nationalAngle: string;
    localAngle: string;
    nationalCoverage: number;
    localCoverage: number;
  }>;
  entityBalance: Array<{
    label: string;
    nationalShare: number;
    localShare: number;
  }>;
}

export interface SearchCatalogEntry {
  id: string;
  type: "event" | "outlet" | "audit" | "entity";
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
}

