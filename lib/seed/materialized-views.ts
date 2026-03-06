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
import {
  getMockComparisonRows,
  getMockDashboardOverview,
  getMockEvent,
  getMockEvents,
  getMockOutletProfile,
  getMockPipelineOverview,
  getMockPipelineStatus,
  listMockOutlets,
  mockComparisonMetrics,
} from "@/data/seed/mock-data";
import { mockDataset } from "@/data/seed/mock-dataset";
import type { MockDataset } from "@/data/seed/mock-model";

const locales: AppLocale[] = ["en", "ro", "hu"];
const timeWindows: TimeWindow[] = ["24h", "48h", "96h"];
const maxPayloadBytes = 900_000;

export interface SeededMockPayload {
  key: string;
  payload: unknown;
}

interface RawSourceMeta {
  anchorDate: string;
  startDate: string;
  endDate: string;
  dateRange: string[];
}

type LocalizedDashboardPayload = Record<AppLocale, DashboardOverview>;
type EventDetailMap = Record<string, EventClusterDetail>;
type OutletProfileMap = Record<string, OutletProfile>;
type AuditCardMap = Record<string, AuditCardPayload>;

const payloadEncoder = new TextEncoder();

function getPayloadBytes(payload: unknown): number {
  return payloadEncoder.encode(JSON.stringify(payload)).length;
}

function buildChunkedArrayPayloads<T>(baseKey: string, items: T[]): SeededMockPayload[] {
  if (getPayloadBytes(items) <= maxPayloadBytes) {
    return [{ key: baseKey, payload: items }];
  }

  const payloads: SeededMockPayload[] = [];
  let chunk: T[] = [];
  let chunkIndex = 0;

  for (const item of items) {
    const nextChunk = [...chunk, item];
    if (chunk.length > 0 && getPayloadBytes(nextChunk) > maxPayloadBytes) {
      payloads.push({ key: `${baseKey}:${chunkIndex}`, payload: chunk });
      chunk = [item];
      chunkIndex += 1;
      continue;
    }

    chunk = nextChunk;
  }

  if (chunk.length > 0) {
    payloads.push({ key: `${baseKey}:${chunkIndex}`, payload: chunk });
  }

  return payloads;
}

function buildRawSourcePayloads(dataset: MockDataset): SeededMockPayload[] {
  const sourceMeta: RawSourceMeta = {
    anchorDate: dataset.anchorDate,
    startDate: dataset.startDate,
    endDate: dataset.endDate,
    dateRange: dataset.dateRange,
  };

  return [
    { key: "source:meta", payload: sourceMeta },
    ...buildChunkedArrayPayloads("source:outlets", dataset.outlets),
    ...buildChunkedArrayPayloads("source:events", dataset.events),
    ...buildChunkedArrayPayloads("source:dailyEvents", dataset.dailyEvents),
    ...buildChunkedArrayPayloads("source:dailyCoverage", dataset.dailyCoverage),
    ...buildChunkedArrayPayloads("source:dailyOutlets", dataset.dailyOutlets),
    ...buildChunkedArrayPayloads("source:articles", dataset.articles),
    ...buildChunkedArrayPayloads("source:auditCards", dataset.auditCards),
    ...buildChunkedArrayPayloads("source:pipeline:discoveries", dataset.pipeline.discoveries),
    ...buildChunkedArrayPayloads("source:pipeline:scrapeRuns", dataset.pipeline.scrapeRuns),
    ...buildChunkedArrayPayloads("source:pipeline:socialSnapshots", dataset.pipeline.socialSnapshots),
    ...buildChunkedArrayPayloads("source:pipeline:extractionRuns", dataset.pipeline.extractionRuns),
    ...buildChunkedArrayPayloads("source:pipeline:entityDictionary", dataset.pipeline.entityDictionary),
    ...buildChunkedArrayPayloads("source:pipeline:embeddingPoints", dataset.pipeline.embeddingPoints),
    ...buildChunkedArrayPayloads("source:pipeline:eventStateSnapshots", dataset.pipeline.eventStateSnapshots),
  ];
}

function buildAuditCardMap(cards: AuditCardPayload[]): AuditCardMap {
  return Object.fromEntries(cards.map((card) => [card.id, card]));
}

function buildEventDetailMap(window: TimeWindow, events: EventClusterSummary[]): EventDetailMap {
  return Object.fromEntries(
    events
      .map((event) => [event.id, getMockEvent(event.id, window)] as const)
      .filter((entry): entry is [string, EventClusterDetail] => entry[1] !== null),
  );
}

function buildOutletProfileMap(window: TimeWindow, outlets: OutletSummary[]): OutletProfileMap {
  return Object.fromEntries(
    outlets
      .map((outlet) => [outlet.id, getMockOutletProfile(outlet.id, window)] as const)
      .filter((entry): entry is [string, OutletProfile] => entry[1] !== null),
  );
}

function buildLocalizedDashboards(window: TimeWindow): LocalizedDashboardPayload {
  return Object.fromEntries(
    locales.map((locale) => [locale, getMockDashboardOverview(window, locale)]),
  ) as LocalizedDashboardPayload;
}

function buildViewPayloads(): SeededMockPayload[] {
  const outlets = listMockOutlets();
  const payloads: SeededMockPayload[] = [
    { key: "view:comparisonMetrics", payload: mockComparisonMetrics satisfies ComparisonMetric[] },
    { key: "view:outlets", payload: outlets },
    { key: "view:auditCardsById", payload: buildAuditCardMap(mockDataset.auditCards) },
  ];

  for (const window of timeWindows) {
    const events = getMockEvents(window);
    const dashboardPayload = buildLocalizedDashboards(window);
    const pipelineOverview = getMockPipelineOverview(window);
    const pipelineStatus = getMockPipelineStatus(window);
    const comparisonRows = getMockComparisonRows(window);
    const eventDetails = buildEventDetailMap(window, events);
    const outletProfiles = buildOutletProfileMap(window, outlets);

    payloads.push(
      { key: `view:dashboard:${window}`, payload: dashboardPayload satisfies LocalizedDashboardPayload },
      { key: `view:pipelineOverview:${window}`, payload: pipelineOverview satisfies PipelineOverview },
      { key: `view:pipelineStatus:${window}`, payload: pipelineStatus satisfies PipelineStatusOverview },
      { key: `view:events:${window}`, payload: events },
      { key: `view:eventDetails:${window}`, payload: eventDetails },
      { key: `view:comparisonRows:${window}`, payload: comparisonRows satisfies ComparisonRow[] },
      { key: `view:outletProfiles:${window}`, payload: outletProfiles },
    );
  }

  return payloads;
}

export function buildSeededMockPayloads(): SeededMockPayload[] {
  return [...buildRawSourcePayloads(mockDataset), ...buildViewPayloads()];
}


