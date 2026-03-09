import type { EventClusterDetail } from "@/lib/contracts/media-echo";
import type { TimeWindow, EventPhase } from "@/lib/contracts/ui";
import { mockEventSeeds } from "@/data/seed/event-seeds";
import { mockOutletSeeds } from "@/data/seed/outlet-seeds";
import type {
  MockArticleDigest,
  MockCoverageSlice,
  MockDailyEventSnapshot,
  MockDailyOutletSnapshot,
  MockDataset,
  MockEmbeddingPoint,
  MockEntityDictionaryEntry,
  MockEventSeed,
  MockEventStateSnapshot,
  MockExtractionRun,
  MockPipelineDataset,
  MockScrapeRun,
  MockSocialSnapshot,
  MockArticleDiscovery,
} from "@/data/seed/mock-model";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAY_SPAN: Record<TimeWindow, number> = {
  "24h": 1,
  "48h": 2,
  "96h": 4,
};

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * DAY_MS);
}

function diffDays(left: Date, right: Date): number {
  return Math.round((left.getTime() - right.getTime()) / DAY_MS);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number): number {
  return Math.round(value);
}

function hashString(value: string): number {
  let hash = 0;
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 100000;
  }
  return hash;
}

const outletById = new Map(mockOutletSeeds.map((outlet) => [outlet.id, outlet]));

const anchorDateSource = mockEventSeeds
  .map((event) => toDate(event.peakDate))
  .sort((left, right) => right.getTime() - left.getTime())[0] ?? new Date("2026-03-06T00:00:00Z");

export const mockAnchorDate = formatDate(anchorDateSource);

const datasetStart = mockEventSeeds
  .map((event) => toDate(event.startDate))
  .sort((left, right) => left.getTime() - right.getTime())[0] ?? anchorDateSource;
const datasetEnd = mockEventSeeds
  .map((event) => toDate(event.endDate))
  .sort((left, right) => right.getTime() - left.getTime())[0] ?? anchorDateSource;

const dateRange = Array.from(
  { length: diffDays(datasetEnd, datasetStart) + 1 },
  (_, index) => formatDate(addDays(datasetStart, index)),
);

function getEventPhase(date: string, event: MockEventSeed): EventPhase {
  const current = toDate(date);
  const peak = toDate(event.peakDate);
  const end = toDate(event.endDate);

  if (current.getTime() < peak.getTime() - DAY_MS) {
    return "emerging";
  }
  if (current.getTime() <= peak.getTime()) {
    return "consensus";
  }
  if (current.getTime() < end.getTime()) {
    return "spin";
  }
  return "resolved";
}

function getIntensity(date: string, event: MockEventSeed): number {
  const current = toDate(date);
  const start = toDate(event.startDate);
  const peak = toDate(event.peakDate);
  const end = toDate(event.endDate);

  if (current < start || current > end) {
    return 0;
  }

  if (current <= peak) {
    const total = Math.max(diffDays(peak, start), 1);
    return 0.35 + (diffDays(current, start) / total) * 0.65;
  }

  const total = Math.max(diffDays(end, peak), 1);
  return 0.3 + (1 - diffDays(current, peak) / total) * 0.7;
}

function getParticipantOutlets(event: MockEventSeed): string[] {
  const preferred = new Set(event.outletAngles.map((item) => item.outletId));

  mockOutletSeeds.forEach((outlet) => {
    const beatScore = outlet.beatWeights[event.beat];
    const typologyBoost = outlet.typology === event.typology ? 0.08 : 0;
    if (beatScore + typologyBoost >= 0.98) {
      preferred.add(outlet.id);
    }
  });

  return Array.from(preferred);
}

const dailyEvents: MockDailyEventSnapshot[] = [];
const dailyCoverage: MockCoverageSlice[] = [];

for (const event of mockEventSeeds) {
  const participants = getParticipantOutlets(event);

  for (const date of dateRange) {
    const intensity = getIntensity(date, event);
    if (intensity <= 0) {
      continue;
    }

    const phase = getEventPhase(date, event);
    const articleCount = round(event.baseArticleCount * intensity);
    const activeOutlets = Math.min(participants.length, Math.max(3, round(participants.length * (0.45 + intensity * 0.35))));
    const divergenceScore = clamp(
      round(event.baseDivergence + (phase === "spin" ? 7 : phase === "resolved" ? -12 : 0) + event.omissionWeight * 8),
      18,
      96,
    );
    const viralityScore = clamp(round(event.baseVirality * (0.72 + intensity * 0.42)), 12, 98);
    const baselineScore = clamp(round((1 - event.spinWeight * 0.35) * 100), 28, 92);
    const spinScore = clamp(round(event.spinWeight * 100 * (phase === "spin" ? 1 : 0.84)), 12, 95);
    const omissionScore = clamp(round(event.omissionWeight * 100 * (phase === "resolved" ? 0.78 : 1)), 12, 94);

    dailyEvents.push({
      date,
      eventId: event.id,
      phase,
      intensity: Number(intensity.toFixed(2)),
      articleCount,
      activeOutlets,
      divergenceScore,
      viralityScore,
      baselineScore,
      spinScore,
      omissionScore,
    });

    const rankedParticipants = participants
      .map((outletId) => {
        const outlet = outletById.get(outletId);
        const explicitAngle = event.outletAngles.find((item) => item.outletId === outletId);
        const alignment = explicitAngle?.alignment ?? round(54 + (outlet?.beatWeights[event.beat] ?? 0.9) * 28);
        const weight = clamp((outlet?.beatWeights[event.beat] ?? 0.9) * (alignment / 100) * (outlet?.typology === event.typology ? 1.12 : 0.9), 0.2, 1.8);
        return { outletId, alignment, weight };
      })
      .sort((left, right) => right.weight - left.weight)
      .slice(0, activeOutlets);

    const totalWeight = rankedParticipants.reduce((sum, item) => sum + item.weight, 0) || 1;

    rankedParticipants.forEach((participant) => {
      const estimatedArticles = Math.max(1, round((participant.weight / totalWeight) * articleCount));
      dailyCoverage.push({
        date,
        outletId: participant.outletId,
        eventId: event.id,
        estimatedArticles,
        share: Number((estimatedArticles / Math.max(articleCount, 1)).toFixed(3)),
        alignment: participant.alignment,
      });
    });
  }
}

const dailyOutlets: MockDailyOutletSnapshot[] = [];

for (const outlet of mockOutletSeeds) {
  for (const date of dateRange) {
    const outletCoverage = dailyCoverage.filter((item) => item.outletId === outlet.id && item.date === date);
    const dominantCoverage = outletCoverage.sort((left, right) => right.estimatedArticles - left.estimatedArticles)[0];
    const dominantEventId = dominantCoverage?.eventId ?? mockEventSeeds[hashString(`${outlet.id}-${date}`) % mockEventSeeds.length]?.id ?? mockEventSeeds[0].id;
    const volume = outletCoverage.reduce((sum, item) => sum + item.estimatedArticles, 0);
    const publishedArticles = Math.max(1, round(outlet.baseDailyOutput * 0.24 + volume));
    const volatility = (hashString(`${outlet.id}:${date}`) % 7) - 3;

    dailyOutlets.push({
      date,
      outletId: outlet.id,
      dominantEventId,
      publishedArticles,
      engagementScore: clamp(round(outlet.baseEngagement + volume * 0.9 + volatility), 18, 98),
      baselineAlignment: clamp(round(outlet.factualityScore - outlet.hostilityScore * 0.12 + volatility), 18, 96),
      anonymousSourceRatio: clamp(round(outlet.anonymousSourceRatio + Math.max(volume - 3, 0) * 0.4), 2, 95),
      factualityScore: clamp(round(outlet.factualityScore - Math.max(volume - 4, 0) * 0.35), 12, 97),
      speedScore: clamp(round(outlet.speedScore + Math.min(volume, 8) * 0.5), 18, 99),
      hostilityScore: clamp(round(outlet.hostilityScore + (dominantCoverage ? (100 - dominantCoverage.alignment) * 0.08 : 0)), 8, 96),
      notableHeadline: `${outlet.name} tracks ${mockEventSeeds.find((event) => event.id === dominantEventId)?.title ?? "regional signal"}`,
    });
  }
}

const articles: MockArticleDigest[] = dailyCoverage.flatMap((slice) => {
  const event = mockEventSeeds.find((item) => item.id === slice.eventId);
  const outlet = outletById.get(slice.outletId);
  if (!event || !outlet) {
    return [];
  }

  const framing =
    slice.alignment >= 78 ? "baseline" : slice.alignment >= 58 ? "omission" : "spin";
  const headline =
    framing === "baseline"
      ? event.headlineModes.baseline
      : framing === "spin"
        ? event.headlineModes.conflict
        : event.headlineModes.local;

  return Array.from({ length: Math.min(slice.estimatedArticles, 2) }, (_, index) => ({
    id: `${slice.date}-${slice.outletId}-${slice.eventId}-${index + 1}`,
    date: slice.date,
    outletId: slice.outletId,
    eventId: slice.eventId,
    title: headline,
    dek: `${outlet.name} frames ${event.title.toLowerCase()} through a ${outlet.framingStyle} lens.`,
    framing,
    viralityScore: clamp(round((event.baseVirality + outlet.baseEngagement) / 2 + index * 4), 18, 98),
    anonymousSources: outlet.anonymousSourceRatio >= 18,
  } satisfies MockArticleDigest));
});

function buildAuditCards(events: MockEventSeed[]) {
  return events.slice(0, 6).map((event, index) => {
    const angle = event.outletAngles[index % event.outletAngles.length];
    const outlet = outletById.get(angle.outletId) ?? mockOutletSeeds[0];
    const article =
      articles.find((item) => item.eventId === event.id && item.outletId === outlet.id) ??
      articles.find((item) => item.eventId === event.id) ??
      articles[index];

    return {
      id: `${event.id}-a${index + 1}`,
      outletId: outlet.id,
      outletName: outlet.name,
      eventId: event.id,
      eventTitle: event.title,
      articleTitle: article?.title ?? event.headlineModes.conflict,
      baselineFact: event.baselineFacts[0],
      biasedQuote: event.headlineModes.conflict,
      finding: `${outlet.name} over-indexed on conflict and underweighted baseline context for ${event.title.toLowerCase()}.`,
      exportCaption: `Audit receipt for ${outlet.name} on ${event.title}`,
      articleSummary: article?.dek ?? `${outlet.name} pushed the conflict frame ahead of the baseline facts.`,
      omissionNotes: event.omittedFacts.slice(0, 2),
      evidence: [
        { label: "Event phase", value: getEventPhase(mockAnchorDate, event) },
        { label: "Alignment score", value: `${angle.alignment}%` },
        { label: "Source discipline", value: outlet.anonymousSourceRatio >= 18 ? "Anonymous-source heavy" : "Document-driven" },
      ],
      relatedProfileId: outlet.id,
      relatedEventId: event.id,
      publishedAt: `${article?.date ?? event.peakDate}T09:30:00Z`,
      viralityScore: article?.viralityScore ?? event.baseVirality,
    };
  });
}

const auditCards = buildAuditCards(mockEventSeeds);

const discoveries: MockArticleDiscovery[] = articles.map((article, index) => ({
  articleId: article.id,
  outletId: article.outletId,
  eventId: article.eventId,
  gdeltDocumentId: `gdelt-${100000 + index}`,
  sourceUrl: `https://example.com/${article.outletId}/${article.id}`,
  sourceDomain: `${article.outletId}.example.com`,
  discoveredAt: `${article.date}T0${index % 9}:15:00Z`,
  language: article.outletId === "maszol" ? "hu" : "ro",
  gdeltTone: clamp((article.viralityScore - 50) / 5, -10, 10),
  relevanceScore: clamp(Number((article.viralityScore / 100).toFixed(2)), 0.2, 0.99),
}));

const scrapeRuns: MockScrapeRun[] = articles.map((article, index) => ({
  articleId: article.id,
  outletId: article.outletId,
  fetchedAt: `${article.date}T1${index % 9}:05:00Z`,
  scrapeStatus: index % 9 === 0 ? "fallback_summary" : "full_text",
  parser: index % 9 === 0 ? "gdelt_summary" : "trafilatura",
  retries: index % 9 === 0 ? 1 : 0,
  extractedWordCount: 320 + (index % 6) * 70,
  qualityScore: clamp(0.72 + (index % 5) * 0.05, 0.72, 0.96),
}));

const socialSnapshots: MockSocialSnapshot[] = articles.map((article, index) => ({
  articleId: article.id,
  facebookShares: 80 + index * 3,
  instagramInteractions: 30 + index * 2,
  xMentions: 12 + (index % 11),
  tiktokViews: 500 + index * 18,
  aggregateVirality: article.viralityScore,
}));

const extractionRuns: MockExtractionRun[] = articles.map((article, index) => ({
  articleId: article.id,
  eventId: article.eventId,
  model: "gemini-3.1-flash-lite-preview",
  schemaVersion: "v1",
  attempts: 1,
  consensusPasses: 1,
  validationStatus: index % 13 === 0 ? "retry_passed" : "passed",
  factsExtracted: 3 + (index % 4),
  subjectiveClaims: 1 + (index % 3),
  groundedQuoteCount: 1 + (index % 2),
  entityMentions: 4 + (index % 5),
  claimEdges: 2 + (index % 4),
  hostileSpinDetected: article.framing === "spin",
}));

const entityDictionary: MockEntityDictionaryEntry[] = mockEventSeeds.flatMap((event) =>
  event.nodes.map((node, index) => ({
    entityId: `${event.id}-${node.id}`,
    canonicalName: node.label,
    entityType:
      node.kind === "claim"
        ? "policy"
        : node.kind === "document"
          ? "document"
          : node.kind === "institution"
            ? "institution"
            : "person",
    aliases: [node.label],
    articleCount: 8 + index,
    outletMentions: 3 + (index % 4),
  })),
);

const embeddingPoints: MockEmbeddingPoint[] = articles.slice(0, 80).map((article, index) => ({
  articleId: article.id,
  outletId: article.outletId,
  eventId: article.eventId,
  clusterId: article.eventId,
  x: Number((((hashString(article.id) % 100) / 100) * 2 - 1).toFixed(3)),
  y: Number((((hashString(`${article.id}-y`) % 100) / 100) * 2 - 1).toFixed(3)),
  z: Number((((hashString(`${article.id}-z`) % 100) / 100) * 2 - 1).toFixed(3)),
  noise: index % 17 === 0,
  similarityBand: 1 + (index % 5),
}));

const eventStateSnapshots: MockEventStateSnapshot[] = dailyEvents.map((snapshot) => ({
  date: snapshot.date,
  eventId: snapshot.eventId,
  state: snapshot.phase,
  baselineLocked: snapshot.phase !== "emerging",
  consensusArticleCount: round(snapshot.articleCount * (snapshot.baselineScore / 100)),
  spinArticleCount: round(snapshot.articleCount * (snapshot.spinScore / 100) * 0.35),
  omissionCount: round(snapshot.articleCount * (snapshot.omissionScore / 100) * 0.2),
  dominantOutletIds: dailyCoverage
    .filter((slice) => slice.date === snapshot.date && slice.eventId === snapshot.eventId)
    .sort((left, right) => right.estimatedArticles - left.estimatedArticles)
    .slice(0, 3)
    .map((slice) => slice.outletId),
}));

const pipeline: MockPipelineDataset = {
  discoveries,
  scrapeRuns,
  socialSnapshots,
  extractionRuns,
  entityDictionary,
  embeddingPoints,
  eventStateSnapshots,
};

export const mockDataset: MockDataset = {
  anchorDate: mockAnchorDate,
  startDate: dateRange[0],
  endDate: dateRange[dateRange.length - 1],
  dateRange,
  outlets: mockOutletSeeds,
  events: mockEventSeeds,
  dailyEvents,
  dailyCoverage,
  dailyOutlets,
  articles,
  auditCards,
  pipeline,
};

function getWindowStart(window: TimeWindow): string {
  return formatDate(addDays(toDate(mockAnchorDate), -(WINDOW_DAY_SPAN[window] - 1)));
}

export function getWindowEventSnapshots(window: TimeWindow): MockDailyEventSnapshot[] {
  const start = getWindowStart(window);
  return mockDataset.dailyEvents.filter((item) => item.date >= start && item.date <= mockAnchorDate);
}

export function getWindowCoverageSlices(window: TimeWindow): MockCoverageSlice[] {
  const start = getWindowStart(window);
  return mockDataset.dailyCoverage.filter((item) => item.date >= start && item.date <= mockAnchorDate);
}

export function getWindowOutletSnapshots(window: TimeWindow): MockDailyOutletSnapshot[] {
  const start = getWindowStart(window);
  return mockDataset.dailyOutlets.filter((item) => item.date >= start && item.date <= mockAnchorDate);
}

export function getWindowArticleDigests(window: TimeWindow): MockArticleDigest[] {
  const start = getWindowStart(window);
  return mockDataset.articles.filter((item) => item.date >= start && item.date <= mockAnchorDate);
}

export function getCurrentEventDetail(eventId: string): EventClusterDetail | null {
  const event = mockDataset.events.find((item) => item.id === eventId);
  if (!event) {
    return null;
  }

  const eventTimeline = mockDataset.dailyEvents.filter((item) => item.eventId === eventId);
  const latest = eventTimeline[eventTimeline.length - 1];
  const activeOutletIds = new Set(
    mockDataset.dailyCoverage
      .filter((item) => item.eventId === eventId && item.date >= getWindowStart("96h"))
      .map((item) => item.outletId),
  );
  const topArticles = mockDataset.articles
    .filter((item) => item.eventId === eventId)
    .sort((left, right) => right.viralityScore - left.viralityScore)
    .slice(0, 4)
    .map((article) => ({
      id: article.id,
      title: article.title,
      outletId: article.outletId,
      outletName: outletById.get(article.outletId)?.name ?? article.outletId,
      eventId: article.eventId,
      eventTitle: event.title,
      viralityScore: article.viralityScore,
      framing: article.framing,
      publishedAt: `${article.date}T09:30:00Z`,
      auditCardId: mockDataset.auditCards.find((card) => card.eventId === article.eventId && card.outletId === article.outletId)?.id,
    }));
  const relatedAuditCardIds = mockDataset.auditCards.filter((card) => card.eventId === eventId).map((card) => card.id);

  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    phase: latest?.phase ?? "consensus",
    typology: event.typology,
    divergenceScore: latest?.divergenceScore ?? event.baseDivergence,
    viralityScore: latest?.viralityScore ?? event.baseVirality,
    articleCount: eventTimeline.reduce((sum, item) => sum + item.articleCount, 0),
    activeOutlets: activeOutletIds.size,
    coordinates: {
      x: clamp(round(event.baseDivergence * (event.typology === "national" ? 0.9 : 0.72)), 12, 88),
      y: clamp(round(event.baseVirality * (event.typology === "national" ? 0.72 : 0.88)), 14, 90),
    },
    baselineFacts: event.baselineFacts,
    omittedFacts: event.omittedFacts,
    phaseSummary:
      latest?.phase === "spin"
        ? `${event.title} is now in the spin phase, with outlet-level framing divergence outpacing baseline agreement.`
        : latest?.phase === "consensus"
          ? `${event.title} is consolidating around baseline facts, but editorial angles are already separating.`
          : latest?.phase === "resolved"
            ? `${event.title} has cooled, making omission patterns and late framing shifts easier to audit.`
            : `${event.title} is still emerging, with early coverage shaping the baseline narrative.`,
    outletAngles: event.outletAngles.map((angle) => ({
      outlet: outletById.get(angle.outletId)?.name ?? angle.outletId,
      angle: angle.angle,
      alignment: angle.alignment,
    })),
    timeline: eventTimeline.map((item) => ({
      label: item.date.slice(5),
      baseline: item.baselineScore,
      spin: item.spinScore,
      omissions: item.omissionScore,
    })),
    nodes: event.nodes,
    edges: event.edges,
    relatedAuditCardIds,
    topArticles,
    comparisonOutletIds: event.outletAngles.slice(0, 3).map((angle) => angle.outletId),
  };
}






