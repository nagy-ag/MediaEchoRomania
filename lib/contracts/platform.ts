import type { Confidence, OutletScope, PageKey, Severity, TimeWindow } from "@/lib/contracts/ui";

export interface TrendPoint {
  label: string;
  value: number;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  deltaLabel: string;
  statusLabel: string;
  tone: Severity | "success";
  trend: TrendPoint[];
  description: string;
}

export interface AlertItem {
  id: string;
  title: string;
  summary: string;
  severity: Severity;
  createdAt: string;
  targetHref?: string;
  whyItTriggered: string;
}

export interface EventSummary {
  id: string;
  title: string;
  summary: string;
  firstSeen: string;
  lastActive: string;
  salience: number;
  activeOutlets: number;
  speedScore: number;
  stabilityScore: number;
  avgToneLabel: string;
  ghostedBy: string[];
  primaryThemes: string[];
  primaryEntities: string[];
  scope: OutletScope;
  confidence: Confidence;
  region: string;
  status: "emerging" | "rising" | "stable" | "cooling";
}

export interface EventDetail extends EventSummary {
  framingProfile: Array<{ label: string; value: number }>;
  participationByOutlet: Array<{
    outletId: string;
    outletName: string;
    lagMinutes: number;
    frameLabel: string;
    toneLabel: string;
  }>;
  propagationPath: Array<{
    from: string;
    to: string;
    lagMinutes: number;
    wave: string;
  }>;
  contradictions: Array<{
    id: string;
    type: string;
    severity: Severity;
    summary: string;
  }>;
  timeline: TrendPoint[];
  explainabilityNotes: string[];
}

export interface OutletSummary {
  id: string;
  name: string;
  scope: OutletScope;
  region: string;
  summary: string;
  speedIndex: number;
  stabilityIndex: number;
  ghostingRate: number;
  breadth: number;
  toneSignature: string;
}

export interface OutletDetail extends OutletSummary {
  selectionAsymmetry: number;
  frameDistinctiveness: number;
  originalityBehavior: string;
  topThemes: Array<{ label: string; value: number }>;
  recentEvents: EventSummary[];
  peerComparison: Array<{ label: string; value: number }>;
  notes: string[];
}

export interface EntitySummary {
  id: string;
  name: string;
  type: "person" | "organization" | "location";
  summary: string;
  mentionTrend: TrendPoint[];
  toneTrend: TrendPoint[];
  topOutlets: string[];
  themes: string[];
}

export interface EntityDetail extends EntitySummary {
  associatedEvents: EventSummary[];
  coEntities: Array<{ label: string; value: number }>;
  seasonalityNotes: string[];
}

export interface CompareOutletsPayload {
  metrics: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  rows: Array<{
    outletId: string;
    outletName: string;
    scope: OutletScope;
    values: Record<string, number>;
  }>;
}

export interface PropagationPayload {
  waveSummary: string;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    strength: number;
    lagMinutes: number;
    eventTitle: string;
  }>;
  topPathways: Array<{
    id: string;
    eventTitle: string;
    summary: string;
    firstMover: string;
    amplifiers: string[];
    silentOutlets: string[];
  }>;
}

export interface ContradictionItem {
  id: string;
  eventId: string;
  eventTitle: string;
  divergenceType: string;
  summary: string;
  severity: Severity;
  firstDetectedAt: string;
}

export interface BiasPanelPayload {
  dimensions: Array<{
    id: string;
    label: string;
    description: string;
    score: number;
    tone: Severity | "success";
  }>;
  outletRows: Array<{
    outletId: string;
    outletName: string;
    selectionBias: number;
    ghostingBias: number;
    framingBias: number;
    toneBias: number;
    entityBias: number;
    attributionBias: number;
  }>;
}

export interface SeasonalityPayload {
  summary: string;
  calendar: Array<{
    label: string;
    intensity: number;
  }>;
  recurringThemes: Array<{
    label: string;
    value: number;
  }>;
  patterns: Array<{
    label: string;
    detail: string;
  }>;
}

export interface LocalVsNationalPayload {
  summary: string;
  nationalHighlights: EventSummary[];
  localHighlights: EventSummary[];
  coverageGaps: Array<{
    eventTitle: string;
    localCoverage: number;
    nationalCoverage: number;
    gapType: string;
  }>;
}

export interface ExplorePoint {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  colorToken: string;
  detail: string;
}

export interface ExplorePayload {
  summary: string;
  points: ExplorePoint[];
}

export interface SearchResult {
  id: string;
  type: "event" | "outlet" | "entity" | "theme";
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
}

export interface DocsPayload {
  sections: Array<{
    id: string;
    title: string;
    summary: string;
    bullets: string[];
  }>;
}

export interface SystemStatusPayload {
  publicStatus: "operational" | "degraded" | "stale";
  summary: string;
  freshnessMinutes: number;
  lastIngestAt: string;
  activeSources: number;
  warnings: string[];
  jobs: Array<{
    id: string;
    label: string;
    status: "healthy" | "degraded" | "critical";
    detail: string;
    lastRunAt: string;
  }>;
  incidents: AlertItem[];
}

export interface OverviewPayload {
  window: TimeWindow;
  headline: string;
  summary: string;
  morningBriefPreview: string;
  kpis: KpiMetric[];
  topAlerts: AlertItem[];
  topEvents: EventSummary[];
  fastestOutlets: OutletSummary[];
  stableOutlets: OutletSummary[];
  entityMovers: EntitySummary[];
  coverageVelocity: TrendPoint[];
  ghostingHeatmap: Array<{
    outlet: string;
    event: string;
    score: number;
  }>;
  biasPreview: BiasPanelPayload["dimensions"];
  propagationPreview: PropagationPayload["topPathways"];
}

export interface MorningBriefPayload {
  generatedAt: string;
  summary: string;
  topDevelopments: Array<{
    eventId: string;
    title: string;
    salience: number;
    speed: number;
    spread: number;
    divergence: number;
    ghosting: number;
  }>;
  changes: string[];
  undercoveredStories: string[];
  outletBehaviorHighlights: string[];
  entityMovers: Array<{
    name: string;
    detail: string;
  }>;
}

export interface EventUniversePayload {
  summary: string;
  nodes: Array<{
    id: string;
    label: string;
    kind: "event" | "entity" | "outlet" | "theme";
    x: number;
    y: number;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    label: string;
  }>;
}

export interface SavedViewRecord {
  _id?: string;
  name: string;
  pageType: PageKey;
  filtersSummary: string;
  updatedAt: string;
  isShared: boolean;
}

export interface WatchlistRecord {
  _id?: string;
  name: string;
  targets: string[];
  updatedAt: string;
}

export interface UserAlertRecord {
  _id?: string;
  title: string;
  summary: string;
  severity: Severity;
  seen: boolean;
  createdAt: string;
}

export interface UserNoteRecord {
  _id?: string;
  targetType: "event" | "outlet" | "entity";
  targetId: string;
  content: string;
  createdAt: string;
}

export interface DashboardPreferenceRecord {
  density: "comfortable" | "compact" | "analyst";
  pinnedWidgets: string[];
}
