import type {
  ActivityFeedItem,
  AuditCardPayload,
  ComparisonMetric,
  ComparisonRow,
  CoverageHeatmapCell,
  DashboardOverview,
  PipelineOverview,
  PipelineStatusOverview,
  EventClusterDetail,
  EventClusterSummary,
  OutletProfile,
  OutletSummary,
} from "@/lib/contracts/media-echo";
import type { AppLocale, TimeWindow } from "@/lib/contracts/ui";
import {
  getCurrentEventDetail,
  getWindowArticleDigests,
  getWindowCoverageSlices,
  getWindowEventSnapshots,
  getWindowOutletSnapshots,
  mockAnchorDate,
  mockDataset,
} from "@/data/seed/mock-dataset";
import { getWindowPipeline, getWindowPipelineHealthScore, mockPipelineDataset } from "@/data/seed/pipeline-data";

const WINDOW_LABELS: Record<TimeWindow, string> = {
  "24h": "past 24 hours",
  "48h": "past 48 hours",
  "96h": "past 96 hours",
};

const comparisonMetrics: ComparisonMetric[] = [
  { id: "speed", label: "Speed", description: "How quickly the outlet converges on a publishable narrative.", emphasis: "positive" },
  { id: "factuality", label: "Factuality", description: "Baseline alignment and document grounding.", emphasis: "positive" },
  { id: "anonymous", label: "Anonymous", description: "Share of sourcing opacity.", emphasis: "warning" },
  { id: "hostility", label: "Hostility", description: "Net adversarial framing intensity.", emphasis: "critical" },
];

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number): number {
  return Math.round(value);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((accumulator, value) => accumulator + value, 0) / values.length;
}

function sum(values: number[]): number {
  return values.reduce((accumulator, value) => accumulator + value, 0);
}

function hashString(value: string): number {
  let hash = 0;
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 100000;
  }
  return hash;
}

function getPipelineStatusLevel(score: number): "healthy" | "degraded" | "critical" {
  if (score >= 100) {
    return "healthy";
  }

  if (score >= 80) {
    return "degraded";
  }

  return "critical";
}

function getPipelineStatusSummary(score: number): string {
  if (score >= 100) {
    return "Every monitored stage is passing without retries, fallbacks, or unresolved validation debt.";
  }

  if (score >= 80) {
    return "The pipeline is operational, but fallbacks or review queues are reducing confidence in at least one stage.";
  }

  return "The pipeline is degraded. Manual review, scrape failures, or extraction instability are affecting coverage reliability.";
}

function buildEventSummary(window: TimeWindow, eventId: string): EventClusterSummary | null {
  const event = mockDataset.events.find((item) => item.id === eventId);
  if (!event) {
    return null;
  }

  const windowEventSnapshots = getWindowEventSnapshots(window).filter((item) => item.eventId === eventId);
  if (windowEventSnapshots.length === 0) {
    return null;
  }

  const latestSnapshot = windowEventSnapshots[windowEventSnapshots.length - 1];
  const windowCoverage = getWindowCoverageSlices(window).filter((item) => item.eventId === eventId);
  const activeOutlets = new Set(windowCoverage.map((item) => item.outletId)).size;

  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    phase: latestSnapshot.phase,
    typology: event.typology,
    divergenceScore: round(average(windowEventSnapshots.map((item) => item.divergenceScore))),
    viralityScore: round(average(windowEventSnapshots.map((item) => item.viralityScore))),
    articleCount: sum(windowEventSnapshots.map((item) => item.articleCount)),
    activeOutlets,
    coordinates: {
      x: clamp(round(average(windowEventSnapshots.map((item) => item.divergenceScore)) * (event.typology === "national" ? 0.9 : 0.74)), 12, 88),
      y: clamp(round(average(windowEventSnapshots.map((item) => item.viralityScore)) * (event.typology === "national" ? 0.74 : 0.9)), 14, 90),
    },
  };
}

function getWindowEventSummaries(window: TimeWindow): EventClusterSummary[] {
  return mockDataset.events
    .map((event) => buildEventSummary(window, event.id))
    .filter((item): item is EventClusterSummary => item !== null)
    .sort((left, right) => right.viralityScore - left.viralityScore);
}

function buildCoverageHeatmap(window: TimeWindow, outletId: string): CoverageHeatmapCell[] {
  const outlet = mockDataset.outlets.find((item) => item.id === outletId);
  if (!outlet) {
    return [];
  }

  const windowCoverage = getWindowCoverageSlices(window).filter((item) => item.outletId === outletId);
  const totalArticles = Math.max(1, sum(windowCoverage.map((item) => item.estimatedArticles)));
  const eventSnapshots = getWindowEventSnapshots(window);

  return mockDataset.events.map((event) => {
    const eventCoverage = windowCoverage.filter((item) => item.eventId === event.id);
    const actualShare = sum(eventCoverage.map((item) => item.estimatedArticles)) / totalArticles;
    const eventIntensity = average(
      eventSnapshots.filter((item) => item.eventId === event.id).map((item) => item.intensity),
    );
    const expectedShare =
      outlet.beatWeights[event.beat] *
      (outlet.typology === event.typology ? 0.36 : 0.22) *
      Math.max(eventIntensity, 0.18);
    const score = clamp(
      0.24 +
        expectedShare * 0.85 -
        actualShare * 0.9 +
        event.omissionWeight * 0.18 +
        (outlet.framingStyle === "conflict" || outlet.framingStyle === "tabloid" ? 0.06 : 0),
      0.08,
      0.94,
    );

    return {
      outletId: outlet.id,
      outletName: outlet.name,
      eventId: event.id,
      eventTitle: event.title,
      score,
    };
  });
}

function buildOutletProfile(outletId: string, window: TimeWindow): OutletProfile | null {
  const outlet = mockDataset.outlets.find((item) => item.id === outletId);
  if (!outlet) {
    return null;
  }

  const windowOutletSnapshots = getWindowOutletSnapshots(window).filter((item) => item.outletId === outletId);
  const recentCoverage = getWindowCoverageSlices(window).filter((item) => item.outletId === outletId);
  const recentEvents = Array.from(
    new Set(
      recentCoverage
        .sort((left, right) => right.estimatedArticles - left.estimatedArticles)
        .map((item) => mockDataset.events.find((event) => event.id === item.eventId)?.title)
        .filter((title): title is string => Boolean(title)),
    ),
  ).slice(0, 4);

  return {
    id: outlet.id,
    name: outlet.name,
    typology: outlet.typology,
    region: outlet.region,
    summary: outlet.summary,
    monthlyReachLabel: outlet.monthlyReachLabel,
    editorialFingerprint: outlet.editorialFingerprint,
    anonymousSourceRatio: round(average(windowOutletSnapshots.map((item) => item.anonymousSourceRatio))),
    factualityScore: round(average(windowOutletSnapshots.map((item) => item.factualityScore))),
    speedScore: round(average(windowOutletSnapshots.map((item) => item.speedScore))),
    hostilityScore: round(average(windowOutletSnapshots.map((item) => item.hostilityScore))),
    recentEvents,
    heatmap: buildCoverageHeatmap(window, outlet.id),
  };
}

function buildActivityFeed(window: TimeWindow): ActivityFeedItem[] {
  const windowDates = new Set(getWindowEventSnapshots(window).map((item) => item.date));
  const latestArticles = mockDataset.articles
    .filter((item) => windowDates.has(item.date))
    .sort((left, right) => right.date.localeCompare(left.date) || right.viralityScore - left.viralityScore)
    .slice(0, 6);

  return latestArticles.map((article) => {
    const event = mockDataset.events.find((item) => item.id === article.eventId);
    const outlet = mockDataset.outlets.find((item) => item.id === article.outletId);
    const severity =
      article.framing === "spin" ? "high" : article.framing === "omission" ? "medium" : "low";

    return {
      id: article.id,
      headline: article.title,
      meta: article.date,
      detail: `${outlet?.name ?? "Unknown outlet"} tracked on ${event?.title ?? "unknown event"} with virality ${article.viralityScore}.`,
      severity,
      eventId: article.eventId,
    };
  });
}

function buildDailyNarrativeSurge(window: TimeWindow): Array<{ label: string; value: number }> {
  const windowSnapshots = getWindowEventSnapshots(window);
  const uniqueDates = Array.from(new Set(windowSnapshots.map((item) => item.date))).sort();

  return uniqueDates.map((date) => ({
    label: date.slice(5),
    value: sum(windowSnapshots.filter((item) => item.date === date).map((item) => item.articleCount)),
  }));
}

function buildIntradayNarrativeSurge(window: TimeWindow): Array<{ label: string; value: number }> {
  const slots = ["00", "04", "08", "12", "16", "20"];
  const articles = getWindowArticleDigests(window);
  const buckets = slots.map((label) => ({ label, value: 0 }));

  if (articles.length === 0) {
    return buckets;
  }

  articles.forEach((article, articleIndex) => {
    const bucketIndex = (hashString(article.id) + articleIndex) % buckets.length;
    const weightedValue = 1 + article.viralityScore / 18;
    buckets[bucketIndex].value += weightedValue;
  });

  return buckets.map((bucket, index, allBuckets) => {
    const previous = allBuckets[index - 1]?.value ?? bucket.value;
    const next = allBuckets[index + 1]?.value ?? bucket.value;
    return {
      label: bucket.label,
      value: round((previous * 0.2 + bucket.value * 0.6 + next * 0.2) || 0),
    };
  });
}

function buildNarrativeSurge(window: TimeWindow): Array<{ label: string; value: number }> {
  const dailySeries = buildDailyNarrativeSurge(window);
  return dailySeries.length <= 1 ? buildIntradayNarrativeSurge(window) : dailySeries;
}

function buildOutletActivity(window: TimeWindow): Array<{ label: string; value: number }> {
  const outletSnapshots = getWindowOutletSnapshots(window);

  return mockDataset.outlets
    .map((outlet) => ({
      label: outlet.name,
      value: sum(
        outletSnapshots
          .filter((item) => item.outletId === outlet.id)
          .map((item) => item.publishedArticles),
      ),
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
}

function buildHeadline(window: TimeWindow, events: EventClusterSummary[]): string {
  const topEvent = events[0];
  if (!topEvent) {
    return "No active mock signals.";
  }

  return `${topEvent.title} leads the ${WINDOW_LABELS[window]} mock monitoring cycle as national budget pressure, energy bills, and regional service delivery continue to diverge.`;
}

function buildSummary(window: TimeWindow, events: EventClusterSummary[]): string {
  const topLocal = events.find((event) => event.typology === "local");
  const topNational = events.find((event) => event.typology === "national");

  if (!topLocal || !topNational) {
    return "MediaEcho mock data tracks where outlets converge on baseline facts, where they amplify conflict, and where local consequences get underweighted.";
  }

  return `In the ${WINDOW_LABELS[window]}, ${topNational.title.toLowerCase()} is driving national framing while ${topLocal.title.toLowerCase()} continues to expose the national-local gap.`;
}

function buildPipelineStatusHistory(): PipelineStatusOverview["history"] {
  const lastThirtyDays = mockDataset.dateRange.slice(-30);

  return lastThirtyDays.map((date) => {
    const articleIds = new Set(mockDataset.articles.filter((article) => article.date === date).map((article) => article.id));
    const scrapeRuns = mockDataset.pipeline.scrapeRuns.filter((item) => articleIds.has(item.articleId));
    const extractionRuns = mockDataset.pipeline.extractionRuns.filter((item) => articleIds.has(item.articleId));
    const embeddingPoints = mockDataset.pipeline.embeddingPoints.filter((item) => articleIds.has(item.articleId));

    const scrapeQuality = average(scrapeRuns.map((item) => item.qualityScore * 100));
    const consensus = average(
      extractionRuns.map((item) => (item.consensusPasses / Math.max(item.attempts, 1)) * 100),
    );
    const clusterShare = embeddingPoints.length === 0
      ? 82
      : (embeddingPoints.filter((item) => !item.noise).length / embeddingPoints.length) * 100;
    const fallbackPenalty = scrapeRuns.filter((item) => item.scrapeStatus === "fallback_summary").length * 3;
    const manualPenalty = extractionRuns.filter((item) => item.validationStatus === "manual_review").length * 8;
    const retryPenalty = extractionRuns.filter((item) => item.validationStatus === "retry_passed").length * 2;
    const score = round(clamp(scrapeQuality * 0.35 + consensus * 0.35 + clusterShare * 0.3 - fallbackPenalty - manualPenalty - retryPenalty, 62, 100));

    return {
      date,
      score,
      status: getPipelineStatusLevel(score),
    };
  });
}

export const mockComparisonMetrics = comparisonMetrics;
export const mockEvents = getWindowEventSummaries("24h");
export const mockOutlets = mockDataset.outlets
  .map((outlet) => buildOutletProfile(outlet.id, "24h"))
  .filter((item): item is OutletProfile => item !== null);
export const mockDailyEvents = mockDataset.dailyEvents;
export const mockDailyCoverage = mockDataset.dailyCoverage;
export const mockDailyOutlets = mockDataset.dailyOutlets;
export const mockArticles = mockDataset.articles;
export const mockAuditCards = mockDataset.auditCards;
export const mockDateRange = mockDataset.dateRange;
export const mockDateWindow = {
  anchorDate: mockAnchorDate,
  startDate: mockDataset.startDate,
  endDate: mockDataset.endDate,
};

export function getMockPipelineOverview(window: TimeWindow): PipelineOverview {
  const pipeline = getWindowPipeline(window);
  const scrapeSuccessRate = pipeline.scrapeRuns.length === 0 ? 0 : round((pipeline.scrapeRuns.filter((item) => item.scrapeStatus === "full_text" || item.scrapeStatus === "retry_success").length / pipeline.scrapeRuns.length) * 100);
  const fallbackRate = pipeline.scrapeRuns.length === 0 ? 0 : round((pipeline.scrapeRuns.filter((item) => item.scrapeStatus === "fallback_summary").length / pipeline.scrapeRuns.length) * 100);
  const manualReviewCount = pipeline.scrapeRuns.filter((item) => item.scrapeStatus === "manual_review").length;
  const averageConsensus = pipeline.extractionRuns.length === 0 ? 0 : round(average(pipeline.extractionRuns.map((item) => (item.consensusPasses / Math.max(item.attempts, 1)) * 100)));
  const hostileSpinCount = pipeline.extractionRuns.filter((item) => item.hostileSpinDetected).length;
  const clusteredPointShare = pipeline.embeddingPoints.length === 0 ? 0 : round((pipeline.embeddingPoints.filter((item) => !item.noise).length / pipeline.embeddingPoints.length) * 100);
  const stateCounts = pipeline.eventStateSnapshots.reduce<Record<string, number>>((accumulator, snapshot) => {
    accumulator[snapshot.state] = (accumulator[snapshot.state] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    discoveries: pipeline.discoveries.length,
    scrapeSuccessRate,
    fallbackRate,
    manualReviewCount,
    averageConsensus,
    hostileSpinCount,
    clusteredPointShare,
    stageVolumes: [
      { label: "Discoveries", value: pipeline.discoveries.length },
      { label: "Scrapes", value: pipeline.scrapeRuns.length },
      { label: "Extractions", value: pipeline.extractionRuns.length },
      { label: "Embeddings", value: pipeline.embeddingPoints.length },
    ],
    stateMix: [
      { label: "Emerging", value: stateCounts.emerging ?? 0 },
      { label: "Consensus", value: stateCounts.consensus ?? 0 },
      { label: "Spin", value: stateCounts.spin ?? 0 },
      { label: "Resolved", value: stateCounts.resolved ?? 0 },
    ],
  };
}

export function getMockPipelineStatus(window: TimeWindow): PipelineStatusOverview {
  const pipelineOverview = getMockPipelineOverview(window);
  const score = getWindowPipelineHealthScore(window);
  const status = getPipelineStatusLevel(score);

  return {
    score,
    status,
    summary: getPipelineStatusSummary(score),
    components: [
      {
        id: "discovery",
        label: "Discovery feed",
        score: clamp(round(100 - pipelineOverview.manualReviewCount * 4), 72, 100),
        status: getPipelineStatusLevel(clamp(round(100 - pipelineOverview.manualReviewCount * 4), 72, 100)),
        detail: `${pipelineOverview.discoveries} GDELT discoveries indexed in the active monitoring window.`,
      },
      {
        id: "scraping",
        label: "Scraping and fallback",
        score: clamp(round(pipelineOverview.scrapeSuccessRate - pipelineOverview.fallbackRate * 0.4), 58, 100),
        status: getPipelineStatusLevel(clamp(round(pipelineOverview.scrapeSuccessRate - pipelineOverview.fallbackRate * 0.4), 58, 100)),
        detail: `${pipelineOverview.scrapeSuccessRate}% full-text success with ${pipelineOverview.fallbackRate}% fallback usage.`,
      },
      {
        id: "extraction",
        label: "Extraction consensus",
        score: clamp(pipelineOverview.averageConsensus, 60, 100),
        status: getPipelineStatusLevel(clamp(pipelineOverview.averageConsensus, 60, 100)),
        detail: `${pipelineOverview.averageConsensus}% agreement across self-consistency validation passes.`,
      },
      {
        id: "clustering",
        label: "Embedding and clustering",
        score: clamp(pipelineOverview.clusteredPointShare, 56, 100),
        status: getPipelineStatusLevel(clamp(pipelineOverview.clusteredPointShare, 56, 100)),
        detail: `${pipelineOverview.clusteredPointShare}% of embedding points resolved into stable event clusters.`,
      },
    ],
    history: buildPipelineStatusHistory(),
  };
}

export function getMockDashboardOverview(window: TimeWindow, locale: AppLocale): DashboardOverview {
  const eventClusters = getWindowEventSummaries(window);
  const coverageHotspots = mockDataset.outlets
    .flatMap((outlet) => buildCoverageHeatmap(window, outlet.id))
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);

  return {
    locale,
    window,
    headline: buildHeadline(window, eventClusters),
    summary: buildSummary(window, eventClusters),
    liveEventCount: eventClusters.length,
    activeOutletCount: mockDataset.outlets.length,
    divergenceScore: round(average(eventClusters.map((item) => item.divergenceScore))),
    pipelineHealthScore: getWindowPipelineHealthScore(window),
    viralityMapLabel: `Romanian mock coverage field ending ${mockAnchorDate}`,
    eventClusters,
    activityFeed: buildActivityFeed(window),
    narrativeSurge: buildNarrativeSurge(window),
    outletActivity: buildOutletActivity(window),
    coverageHotspots,
  };
}

export function getMockEvents(window: TimeWindow): EventClusterSummary[] {
  return getWindowEventSummaries(window);
}

export function getMockEvent(eventId: string, window: TimeWindow = "24h"): EventClusterDetail | null {
  const detail = getCurrentEventDetail(eventId);
  if (!detail) {
    return null;
  }

  const windowSummary = getWindowEventSummaries(window).find((item) => item.id === eventId);
  if (!windowSummary) {
    return detail;
  }

  return {
    ...detail,
    phase: windowSummary.phase,
    divergenceScore: windowSummary.divergenceScore,
    viralityScore: windowSummary.viralityScore,
    articleCount: windowSummary.articleCount,
    activeOutlets: windowSummary.activeOutlets,
    coordinates: windowSummary.coordinates,
  };
}

export function getMockComparisonRows(window: TimeWindow): ComparisonRow[] {
  return mockDataset.outlets
    .map((outlet) => {
      const snapshots = getWindowOutletSnapshots(window).filter((item) => item.outletId === outlet.id);

      return {
        outletId: outlet.id,
        outletName: outlet.name,
        typology: outlet.typology,
        metrics: {
          speed: round(average(snapshots.map((item) => item.speedScore))),
          factuality: round(average(snapshots.map((item) => item.factualityScore))),
          anonymous: round(average(snapshots.map((item) => item.anonymousSourceRatio))),
          hostility: round(average(snapshots.map((item) => item.hostilityScore))),
        },
      };
    })
    .sort((left, right) => right.metrics.factuality - left.metrics.factuality);
}

export function getMockOutletProfiles(window: TimeWindow): OutletProfile[] {
  return mockDataset.outlets
    .map((outlet) => buildOutletProfile(outlet.id, window))
    .filter((item): item is OutletProfile => item !== null);
}

export function getMockOutletProfile(outletId: string, window: TimeWindow = "24h"): OutletProfile | null {
  return buildOutletProfile(outletId, window);
}

export function getMockAuditCard(cardId: string): AuditCardPayload | null {
  return mockDataset.auditCards.find((card) => card.id === cardId) ?? null;
}

export function listMockOutlets(): OutletSummary[] {
  return mockDataset.outlets.map((outlet) => ({
    id: outlet.id,
    name: outlet.name,
    typology: outlet.typology,
    region: outlet.region,
    summary: outlet.summary,
    monthlyReachLabel: outlet.monthlyReachLabel,
  }));
}

export const mockPipeline = mockPipelineDataset;
export function getMockPipeline(window: TimeWindow) {
  return getWindowPipeline(window);
}

