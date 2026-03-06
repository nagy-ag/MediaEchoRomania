import type { TimeWindow } from "@/lib/contracts/ui";
import type { MockPipelineDataset } from "@/data/seed/mock-model";
import {
  getWindowArticleDigests,
  getWindowEventSnapshots,
  mockDataset,
} from "@/data/seed/mock-dataset";

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number): number {
  return Math.round(value);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export const mockPipelineDataset: MockPipelineDataset = mockDataset.pipeline;

export function getWindowPipeline(window: TimeWindow): MockPipelineDataset {
  const articleIds = new Set(getWindowArticleDigests(window).map((article) => article.id));
  const windowDates = new Set(getWindowEventSnapshots(window).map((snapshot) => snapshot.date));

  return {
    discoveries: mockPipelineDataset.discoveries.filter((item) => articleIds.has(item.articleId)),
    scrapeRuns: mockPipelineDataset.scrapeRuns.filter((item) => articleIds.has(item.articleId)),
    socialSnapshots: mockPipelineDataset.socialSnapshots.filter((item) => articleIds.has(item.articleId)),
    extractionRuns: mockPipelineDataset.extractionRuns.filter((item) => articleIds.has(item.articleId)),
    entityDictionary: mockPipelineDataset.entityDictionary.filter((item) =>
      mockDataset.events.some(
        (event) =>
          item.entityId.startsWith(`${event.id}:`) &&
          (windowDates.has(event.startDate) || windowDates.has(event.peakDate) || windowDates.has(event.endDate)),
      ),
    ),
    embeddingPoints: mockPipelineDataset.embeddingPoints.filter((item) => articleIds.has(item.articleId)),
    eventStateSnapshots: mockPipelineDataset.eventStateSnapshots.filter((item) => windowDates.has(item.date)),
  };
}

export function getWindowPipelineHealthScore(window: TimeWindow): number {
  const pipeline = getWindowPipeline(window);
  const scrapeQuality = average(pipeline.scrapeRuns.map((item) => item.qualityScore));
  const extractionConsensus = average(
    pipeline.extractionRuns.map((item) => (item.consensusPasses / Math.max(item.attempts, 1)) * 100),
  );
  const clusterDensity = average(
    pipeline.embeddingPoints.map((item) => (item.noise ? Math.max(item.similarityBand - 24, 0) : item.similarityBand)),
  );
  const manualReviewPenalty = pipeline.extractionRuns.filter(
    (item) => item.validationStatus === "manual_review",
  ).length * 2.5;

  return round(
    clamp(scrapeQuality * 0.34 + extractionConsensus * 0.42 + clusterDensity * 0.24 - manualReviewPenalty, 48, 98),
  );
}

