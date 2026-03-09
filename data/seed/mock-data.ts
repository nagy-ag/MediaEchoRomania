import type {
  ActivityFeedItem,
  AuditCardPayload,
  AuditLibraryItem,
  BriefingHighlight,
  ComparisonMetric,
  ComparisonRow,
  CoverageGapsOverview,
  CoverageGapRankingItem,
  CoverageHeatmapCell,
  DashboardOverview,
  PipelineOverview,
  PipelineStatusOverview,
  EventClusterDetail,
  EventClusterSummary,
  OutletProfile,
  OutletSummary,
  SearchCatalogEntry,
  TopViralArticle,
  TypologyDivideOverview,
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

function getEventById(eventId: string) {
  return mockDataset.events.find((item) => item.id === eventId) ?? null;
}

function getOutletById(outletId: string) {
  return mockDataset.outlets.find((item) => item.id === outletId) ?? null;
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

function buildTopViralArticles(window: TimeWindow): TopViralArticle[] {
  return getWindowArticleDigests(window)
    .sort((left, right) => right.viralityScore - left.viralityScore)
    .slice(0, 6)
    .map((article) => {
      const outlet = getOutletById(article.outletId);
      const event = getEventById(article.eventId);
      const auditCard = mockDataset.auditCards.find((card) => card.eventId === article.eventId && card.outletId === article.outletId);

      return {
        id: article.id,
        title: article.title,
        outletId: article.outletId,
        outletName: outlet?.name ?? article.outletId,
        eventId: article.eventId,
        eventTitle: event?.title ?? article.eventId,
        viralityScore: article.viralityScore,
        framing: article.framing,
        publishedAt: `${article.date}T09:30:00Z`,
        auditCardId: auditCard?.id,
      };
    });
}

function buildBriefingHighlights(window: TimeWindow, events: EventClusterSummary[], hotspots: CoverageHeatmapCell[]): BriefingHighlight[] {
  const topEvent = events[0];
  const topSpin = events.slice().sort((left, right) => right.divergenceScore - left.divergenceScore)[0];
  const topHotspot = hotspots[0];

  return [
    {
      id: "live-events",
      label: "Live events",
      value: `${events.length}`,
      detail: `Tracked across the ${WINDOW_LABELS[window]} monitoring window.`,
      tone: "accent",
      href: "/events",
    },
    {
      id: "largest-divergence",
      label: "Biggest spin shift",
      value: topSpin ? `${topSpin.divergenceScore}%` : "-",
      detail: topSpin ? topSpin.title : "No divergence signal available.",
      tone: "warning",
      href: topSpin ? `/events/${topSpin.id}` : "/events",
    },
    {
      id: "omission-risk",
      label: "Omission risk",
      value: topHotspot ? `${round(topHotspot.score * 100)}%` : "-",
      detail: topHotspot ? `${topHotspot.outletName} vs ${topHotspot.eventTitle}` : "No ghosting hotspot detected.",
      tone: "danger",
      href: "/coverage-gaps",
    },
    {
      id: "lead-story",
      label: "Lead event",
      value: topEvent ? `${topEvent.activeOutlets} outlets` : "-",
      detail: topEvent ? topEvent.title : "No event in focus.",
      tone: "muted",
      href: topEvent ? `/events/${topEvent.id}` : "/events",
    },
  ];
}

function buildQuickLinks(events: EventClusterSummary[]): DashboardOverview["quickLinks"] {
  const leadEvent = events[0];
  const leadLocal = events.find((event) => event.typology === "local");

  return [
    {
      id: "open-lead-event",
      label: "Open lead event",
      description: leadEvent ? leadEvent.title : "Inspect the highest-virality event cluster.",
      href: leadEvent ? `/events/${leadEvent.id}` : "/events",
    },
    {
      id: "compare-outlets",
      label: "Compare outlets",
      description: "Jump into the comparison engine with the current monitoring window.",
      href: "/compare",
    },
    {
      id: "coverage-gaps",
      label: "Coverage gaps",
      description: "Review omission hotspots and selective suppression risk.",
      href: "/coverage-gaps",
    },
    {
      id: "local-divide",
      label: "National vs local",
      description: leadLocal ? `Contrast national framing against ${leadLocal.title.toLowerCase()}.` : "Inspect the narrative split between national and local outlets.",
      href: "/national-vs-local",
    },
  ];
}

function buildMorningBriefing(window: TimeWindow, events: EventClusterSummary[], topViralArticles: TopViralArticle[], hotspots: CoverageHeatmapCell[]): string {
  const topEvent = events[0];
  const topLocal = events.find((event) => event.typology === "local");
  const topArticle = topViralArticles[0];
  const topHotspot = hotspots[0];

  if (!topEvent) {
    return "Good morning. No major events are active in the current monitoring window.";
  }

  const localClause = topLocal
    ? `${topLocal.title} is exposing the local consequences that national coverage is least likely to keep in frame.`
    : "Local coverage is still catching up to the national framing cycle.";
  const hotspotClause = topHotspot
    ? `${topHotspot.outletName} is showing the sharpest omission risk on ${topHotspot.eventTitle}.`
    : "No omission hotspot is currently above the alert threshold.";
  const articleClause = topArticle
    ? `${topArticle.outletName} currently holds the most viral article in the window.`
    : "Virality is broadly distributed across outlets.";

  return `Good morning. ${events.length} major events are active in the ${WINDOW_LABELS[window]}. ${topEvent.title} is the lead divergence cluster. ${articleClause} ${localClause} ${hotspotClause}`;
}

function buildOutletProfile(outletId: string, window: TimeWindow): OutletProfile | null {
  const outlet = getOutletById(outletId);
  if (!outlet) {
    return null;
  }

  const windowOutletSnapshots = getWindowOutletSnapshots(window).filter((item) => item.outletId === outletId);
  const recentCoverage = getWindowCoverageSlices(window).filter((item) => item.outletId === outletId);
  const recentEvents = Array.from(
    new Set(
      recentCoverage
        .sort((left, right) => right.estimatedArticles - left.estimatedArticles)
        .map((item) => getEventById(item.eventId)?.title)
        .filter((title): title is string => Boolean(title)),
    ),
  ).slice(0, 4);
  const sourceMix = [
    { label: "Anonymous", value: round(average(windowOutletSnapshots.map((item) => item.anonymousSourceRatio))) },
    { label: "Documents", value: clamp(round(outlet.factualityScore * 0.72), 8, 90) },
    { label: "Officials", value: clamp(round(100 - outlet.anonymousSourceRatio - outlet.hostilityScore * 0.2), 10, 88) },
  ];
  const topTargets = mockDataset.events
    .filter((event) => event.outletAngles.some((angle) => angle.outletId === outlet.id))
    .sort((left, right) => {
      const leftAlignment = left.outletAngles.find((angle) => angle.outletId === outlet.id)?.alignment ?? 100;
      const rightAlignment = right.outletAngles.find((angle) => angle.outletId === outlet.id)?.alignment ?? 100;
      return leftAlignment - rightAlignment;
    })
    .slice(0, 4)
    .map((event) => event.title);
  const ignoredTopics = buildCoverageHeatmap(window, outlet.id)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((cell) => cell.eventTitle);

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
    partisanFingerprint: [
      { label: "Government", value: clamp(round(outlet.hostilityScore - 14), -70, 90) },
      { label: "Coalition", value: clamp(round(outlet.hostilityScore - 8), -70, 90) },
      { label: "Local power", value: clamp(round(outlet.hostilityScore * 0.76), -70, 90) },
    ],
    sourceMix,
    speedVsClickbait: {
      speed: round(average(windowOutletSnapshots.map((item) => item.speedScore))),
      clickbait: clamp(round(outlet.hostilityScore + outlet.anonymousSourceRatio * 0.32), 8, 96),
      quadrantLabel:
        outlet.speedScore >= 75
          ? outlet.factualityScore >= 75
            ? "Fast and factual"
            : "Fast but reactive"
          : outlet.factualityScore >= 75
            ? "Slow and disciplined"
            : "Late and sensational",
    },
    topTargets,
    ignoredTopics,
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

function buildCoverageGapRankings(window: TimeWindow) {
  const events = getWindowEventSummaries(window);
  const outlets = listMockOutlets();
  const cells = outlets.flatMap((outlet) => buildCoverageHeatmap(window, outlet.id));

  const topGhostedEvents: CoverageGapRankingItem[] = events
    .map((event) => {
      const eventCells = cells.filter((cell) => cell.eventId === event.id);
      const score = average(eventCells.map((cell) => cell.score));
      const missingCount = eventCells.filter((cell) => cell.score >= 0.65).length;
      return {
        id: event.id,
        label: event.title,
        score,
        detail: `${missingCount} outlets are under-covering this event relative to their expected profile.`,
        href: `/events/${event.id}`,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  const topSelectiveOutlets: CoverageGapRankingItem[] = outlets
    .map((outlet) => {
      const outletCells = cells.filter((cell) => cell.outletId === outlet.id);
      const score = average(outletCells.map((cell) => cell.score));
      const worstEvent = outletCells.sort((left, right) => right.score - left.score)[0];
      return {
        id: outlet.id,
        label: outlet.name,
        score,
        detail: worstEvent ? `Highest omission risk on ${worstEvent.eventTitle}.` : "No omission spike in the selected window.",
        href: `/profiles/${outlet.id}`,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);

  return { cells, events, outlets, topGhostedEvents, topSelectiveOutlets };
}

function buildCoverageGapsOverview(window: TimeWindow): CoverageGapsOverview {
  const rankings = buildCoverageGapRankings(window);

  return {
    summary: `Coverage gaps are propensity-weighted in the ${WINDOW_LABELS[window]} so outlets are only penalized when they suppress stories they would normally be expected to cover.`,
    cells: rankings.cells,
    topGhostedEvents: rankings.topGhostedEvents,
    topSelectiveOutlets: rankings.topSelectiveOutlets,
    events: rankings.events,
    outlets: rankings.outlets,
  };
}

function buildTypologyDivideOverview(window: TimeWindow): TypologyDivideOverview {
  const events = getWindowEventSummaries(window);
  const sharedEvents = mockDataset.events.slice(0, 4).map((event) => {
    const nationalAngle = event.outletAngles.find((angle) => getOutletById(angle.outletId)?.typology === "national");
    const localAngle = event.outletAngles.find((angle) => getOutletById(angle.outletId)?.typology === "local");
    const coverage = getWindowCoverageSlices(window).filter((slice) => slice.eventId === event.id);

    return {
      eventId: event.id,
      eventTitle: event.title,
      nationalAngle: nationalAngle?.angle ?? "National coverage remains thin on this story.",
      localAngle: localAngle?.angle ?? "Local coverage remains thin on this story.",
      nationalCoverage: sum(coverage.filter((slice) => getOutletById(slice.outletId)?.typology === "national").map((slice) => slice.estimatedArticles)),
      localCoverage: sum(coverage.filter((slice) => getOutletById(slice.outletId)?.typology === "local").map((slice) => slice.estimatedArticles)),
    };
  });

  return {
    summary: `National and local outlets are compared on the same monitored stories in the ${WINDOW_LABELS[window]} to expose where capital-city framing diverges from regional consequence reporting.`,
    divergenceScore: round(average(sharedEvents.map((item) => Math.abs(item.nationalCoverage - item.localCoverage)))),
    nationalHighlights: events.filter((event) => event.typology === "national").slice(0, 3),
    localHighlights: events.filter((event) => event.typology === "local").slice(0, 3),
    sharedEvents,
    entityBalance: mockDataset.pipeline.entityDictionary.slice(0, 6).map((entity) => ({
      label: entity.canonicalName,
      nationalShare: clamp(round((entity.articleCount * 1.2 + hashString(entity.entityId) % 14) % 100), 12, 92),
      localShare: clamp(round((entity.outletMentions * 11 + hashString(`${entity.entityId}-local`) % 18) % 100), 8, 88),
    })),
  };
}

function buildAuditLibrary(window: TimeWindow): AuditLibraryItem[] {
  const windowArticles = getWindowArticleDigests(window);
  const eventIds = new Set(windowArticles.map((article) => article.eventId));

  return mockDataset.auditCards
    .filter((card) => eventIds.has(card.eventId))
    .map((card) => ({
      id: card.id,
      outletId: card.outletId,
      outletName: card.outletName,
      eventId: card.eventId,
      eventTitle: card.eventTitle,
      articleTitle: card.articleTitle,
      finding: card.finding,
      href: `/audit-cards/${card.id}`,
      publishedAt: card.publishedAt,
      viralityScore: card.viralityScore,
    }))
    .sort((left, right) => right.viralityScore - left.viralityScore);
}

function buildSearchCatalog(window: TimeWindow): SearchCatalogEntry[] {
  const events = getWindowEventSummaries(window).map((event) => ({
    id: `event-${event.id}`,
    type: "event" as const,
    title: event.title,
    subtitle: `${event.articleCount} articles | ${event.divergenceScore}% divergence`,
    href: `/events/${event.id}`,
    keywords: [event.summary, event.typology, event.phase],
  }));
  const outlets = listMockOutlets().map((outlet) => ({
    id: `outlet-${outlet.id}`,
    type: "outlet" as const,
    title: outlet.name,
    subtitle: `${outlet.typology} | ${outlet.region}`,
    href: `/profiles/${outlet.id}`,
    keywords: [outlet.summary, outlet.region, outlet.typology],
  }));
  const audits = buildAuditLibrary(window).map((audit) => ({
    id: `audit-${audit.id}`,
    type: "audit" as const,
    title: audit.articleTitle,
    subtitle: `${audit.outletName} | ${audit.eventTitle}`,
    href: audit.href,
    keywords: [audit.finding, audit.outletName, audit.eventTitle],
  }));
  const entities = mockDataset.pipeline.entityDictionary.slice(0, 12).map((entity) => ({
    id: `entity-${entity.entityId}`,
    type: "entity" as const,
    title: entity.canonicalName,
    subtitle: `${entity.entityType} | ${entity.articleCount} article mentions`,
    href: "/search",
    keywords: entity.aliases,
  }));

  return [...events, ...outlets, ...audits, ...entities];
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
  const topViralArticles = buildTopViralArticles(window);

  return {
    locale,
    window,
    headline: buildHeadline(window, eventClusters),
    summary: buildSummary(window, eventClusters),
    morningBriefing: buildMorningBriefing(window, eventClusters, topViralArticles, coverageHotspots),
    liveEventCount: eventClusters.length,
    activeOutletCount: mockDataset.outlets.length,
    divergenceScore: round(average(eventClusters.map((item) => item.divergenceScore))),
    pipelineHealthScore: getWindowPipelineHealthScore(window),
    viralityMapLabel: `Romanian mock coverage field ending ${mockAnchorDate}`,
    eventClusters,
    briefingHighlights: buildBriefingHighlights(window, eventClusters, coverageHotspots),
    topViralArticles,
    quickLinks: buildQuickLinks(eventClusters),
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

export function getMockCoverageGapsOverview(window: TimeWindow): CoverageGapsOverview {
  return buildCoverageGapsOverview(window);
}

export function getMockTypologyDivideOverview(window: TimeWindow): TypologyDivideOverview {
  return buildTypologyDivideOverview(window);
}

export function getMockSearchCatalog(window: TimeWindow): SearchCatalogEntry[] {
  return buildSearchCatalog(window);
}

export function getMockAuditLibrary(window: TimeWindow): AuditLibraryItem[] {
  return buildAuditLibrary(window);
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









