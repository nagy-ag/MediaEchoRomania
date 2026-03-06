import type { AuditCardPayload, ClaimEdge, ClaimNode } from "@/lib/contracts/media-echo";
import type { EventPhase, OutletTypology } from "@/lib/contracts/ui";

export type CoverageBeat = "energy" | "fiscal" | "health" | "infrastructure" | "localBudget" | "weather";

export type FramingStyle = "civic" | "conflict" | "document" | "institutional" | "tabloid";

export interface OutletBeatWeights {
  energy: number;
  fiscal: number;
  health: number;
  infrastructure: number;
  localBudget: number;
  weather: number;
}

export interface MockOutletSeed {
  id: string;
  name: string;
  typology: OutletTypology;
  region: string;
  summary: string;
  monthlyReachEstimate: number;
  monthlyReachLabel: string;
  editorialFingerprint: string;
  anonymousSourceRatio: number;
  factualityScore: number;
  speedScore: number;
  hostilityScore: number;
  baseDailyOutput: number;
  baseEngagement: number;
  framingStyle: FramingStyle;
  beatWeights: OutletBeatWeights;
}

export interface MockOutletAngle {
  outletId: string;
  angle: string;
  alignment: number;
}

export interface MockHeadlineModes {
  baseline: string;
  conflict: string;
  local: string;
}

export interface MockEventSeed {
  id: string;
  title: string;
  summary: string;
  typology: OutletTypology;
  beat: CoverageBeat;
  startDate: string;
  peakDate: string;
  endDate: string;
  baseArticleCount: number;
  baseVirality: number;
  baseDivergence: number;
  baselineFacts: string[];
  omittedFacts: string[];
  outletAngles: MockOutletAngle[];
  nodes: ClaimNode[];
  edges: ClaimEdge[];
  headlineModes: MockHeadlineModes;
  spinWeight: number;
  omissionWeight: number;
}

export interface MockDailyEventSnapshot {
  date: string;
  eventId: string;
  phase: EventPhase;
  intensity: number;
  articleCount: number;
  activeOutlets: number;
  divergenceScore: number;
  viralityScore: number;
  baselineScore: number;
  spinScore: number;
  omissionScore: number;
}

export interface MockCoverageSlice {
  date: string;
  outletId: string;
  eventId: string;
  estimatedArticles: number;
  share: number;
  alignment: number;
}

export interface MockDailyOutletSnapshot {
  date: string;
  outletId: string;
  dominantEventId: string;
  publishedArticles: number;
  engagementScore: number;
  baselineAlignment: number;
  anonymousSourceRatio: number;
  factualityScore: number;
  speedScore: number;
  hostilityScore: number;
  notableHeadline: string;
}

export interface MockArticleDigest {
  id: string;
  date: string;
  outletId: string;
  eventId: string;
  title: string;
  dek: string;
  framing: "baseline" | "spin" | "omission";
  viralityScore: number;
  anonymousSources: boolean;
}

export interface MockArticleDiscovery {
  articleId: string;
  outletId: string;
  eventId: string;
  gdeltDocumentId: string;
  sourceUrl: string;
  sourceDomain: string;
  discoveredAt: string;
  language: "ro" | "hu";
  gdeltTone: number;
  relevanceScore: number;
}

export interface MockScrapeRun {
  articleId: string;
  outletId: string;
  fetchedAt: string;
  scrapeStatus: "full_text" | "fallback_summary" | "retry_success" | "manual_review";
  parser: "trafilatura" | "gdelt_summary";
  retries: number;
  extractedWordCount: number;
  qualityScore: number;
}

export interface MockSocialSnapshot {
  articleId: string;
  facebookShares: number;
  instagramInteractions: number;
  xMentions: number;
  tiktokViews: number;
  aggregateVirality: number;
}

export interface MockExtractionRun {
  articleId: string;
  eventId: string;
  model: string;
  schemaVersion: string;
  attempts: number;
  consensusPasses: number;
  validationStatus: "passed" | "retry_passed" | "manual_review";
  factsExtracted: number;
  subjectiveClaims: number;
  groundedQuoteCount: number;
  entityMentions: number;
  claimEdges: number;
  hostileSpinDetected: boolean;
}

export interface MockEntityDictionaryEntry {
  entityId: string;
  canonicalName: string;
  entityType: "person" | "institution" | "policy" | "document" | "location";
  aliases: string[];
  articleCount: number;
  outletMentions: number;
}

export interface MockEmbeddingPoint {
  articleId: string;
  outletId: string;
  eventId: string;
  clusterId: string;
  x: number;
  y: number;
  z: number;
  noise: boolean;
  similarityBand: number;
}

export interface MockEventStateSnapshot {
  date: string;
  eventId: string;
  state: EventPhase;
  baselineLocked: boolean;
  consensusArticleCount: number;
  spinArticleCount: number;
  omissionCount: number;
  dominantOutletIds: string[];
}

export interface MockPipelineDataset {
  discoveries: MockArticleDiscovery[];
  scrapeRuns: MockScrapeRun[];
  socialSnapshots: MockSocialSnapshot[];
  extractionRuns: MockExtractionRun[];
  entityDictionary: MockEntityDictionaryEntry[];
  embeddingPoints: MockEmbeddingPoint[];
  eventStateSnapshots: MockEventStateSnapshot[];
}

export interface MockDataset {
  anchorDate: string;
  startDate: string;
  endDate: string;
  dateRange: string[];
  outlets: MockOutletSeed[];
  events: MockEventSeed[];
  dailyEvents: MockDailyEventSnapshot[];
  dailyCoverage: MockCoverageSlice[];
  dailyOutlets: MockDailyOutletSnapshot[];
  articles: MockArticleDigest[];
  auditCards: AuditCardPayload[];
  pipeline: MockPipelineDataset;
}

