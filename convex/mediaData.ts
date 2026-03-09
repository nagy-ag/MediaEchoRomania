import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import type {
  AuditCardPayload,
  AuditLibraryItem,
  ComparisonMetric,
  ComparisonRow,
  CoverageGapsOverview,
  DashboardOverview,
  EventClusterDetail,
  EventClusterSummary,
  OutletProfile,
  OutletSummary,
  PipelineOverview,
  PipelineStatusOverview,
  SearchCatalogEntry,
  TypologyDivideOverview,
} from "../lib/contracts/media-echo";
import type { AppLocale } from "../lib/contracts/ui";
import { getMockDashboardOverview } from "../data/seed/mock-data";
import { mockDataset } from "../data/seed/mock-dataset";
import { buildSeededMockPayloads } from "../lib/seed/materialized-views";

const timeWindowValidator = v.union(v.literal("24h"), v.literal("48h"), v.literal("96h"));
const localeValidator = v.union(v.literal("en"), v.literal("ro"), v.literal("hu"));

function parsePayload<T>(payloadJson: string): T {
  return JSON.parse(payloadJson) as T;
}

async function getStoredPayload<T>(ctx: QueryCtx, key: string): Promise<T | null> {
  const document = await ctx.db.query("mockPayloads").withIndex("by_key", (q) => q.eq("key", key)).unique();
  if (!document) {
    return null;
  }

  return parsePayload<T>(document.payloadJson);
}

export const seedMediaPayloads = mutation({
  args: {
    version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const version = args.version ?? `mock-${mockDataset.anchorDate}`;
    const updatedAt = new Date().toISOString();
    const payloads = buildSeededMockPayloads();
    const existingDocuments = await ctx.db.query("mockPayloads").collect();
    const existingByKey = new Map(existingDocuments.map((document) => [document.key, document]));

    for (const payload of payloads) {
      const payloadJson = JSON.stringify(payload.payload);
      const existingDocument = existingByKey.get(payload.key);

      if (existingDocument) {
        await ctx.db.patch(existingDocument._id, {
          payloadJson,
          version,
          updatedAt,
        });
        existingByKey.delete(payload.key);
        continue;
      }

      await ctx.db.insert("mockPayloads", {
        key: payload.key,
        payloadJson,
        version,
        updatedAt,
      });
    }

    for (const staleDocument of existingByKey.values()) {
      await ctx.db.delete(staleDocument._id);
    }

    return {
      version,
      updatedAt,
      payloadCount: payloads.length,
      sourcePayloadCount: payloads.filter((payload) => payload.key.startsWith("source:")).length,
      viewPayloadCount: payloads.filter((payload) => payload.key.startsWith("view:")).length,
    };
  },
});

export const getSeedStatus = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("mockPayloads").collect();
    const latestUpdate = documents.map((document) => document.updatedAt).sort((left, right) => right.localeCompare(left))[0] ?? null;

    return {
      isSeeded: documents.length > 0,
      payloadCount: documents.length,
      keys: documents.map((document) => document.key).sort(),
      version: documents[0]?.version ?? null,
      updatedAt: latestUpdate,
    };
  },
});

export const getDashboardOverview = query({
  args: {
    window: timeWindowValidator,
    locale: localeValidator,
  },
  handler: async (ctx, args) => {
    const dashboards = await getStoredPayload<Record<AppLocale, DashboardOverview>>(ctx, `view:dashboard:${args.window}`);
    const fallback = getMockDashboardOverview(args.window, args.locale);
    const stored = dashboards?.[args.locale];

    return stored ? { ...fallback, ...stored } : fallback;
  },
});

export const getPipelineOverview = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return await getStoredPayload<PipelineOverview>(ctx, `view:pipelineOverview:${args.window}`);
  },
});

export const getPipelineStatus = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return await getStoredPayload<PipelineStatusOverview>(ctx, `view:pipelineStatus:${args.window}`);
  },
});

export const listEvents = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return (await getStoredPayload<EventClusterSummary[]>(ctx, `view:events:${args.window}`)) ?? [];
  },
});

export const getEvent = query({
  args: {
    eventId: v.string(),
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    const events = await getStoredPayload<Record<string, EventClusterDetail>>(ctx, `view:eventDetails:${args.window}`);
    return events?.[args.eventId] ?? null;
  },
});

export const getComparisonMetrics = query({
  args: {},
  handler: async (ctx) => {
    return (await getStoredPayload<ComparisonMetric[]>(ctx, "view:comparisonMetrics")) ?? [];
  },
});

export const getComparisonRows = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return (await getStoredPayload<ComparisonRow[]>(ctx, `view:comparisonRows:${args.window}`)) ?? [];
  },
});

export const getCoverageGapsOverview = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return await getStoredPayload<CoverageGapsOverview>(ctx, `view:coverageGaps:${args.window}`);
  },
});

export const getTypologyDivideOverview = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return await getStoredPayload<TypologyDivideOverview>(ctx, `view:typologyDivide:${args.window}`);
  },
});

export const getSearchCatalog = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return (await getStoredPayload<SearchCatalogEntry[]>(ctx, `view:searchCatalog:${args.window}`)) ?? [];
  },
});

export const listAuditLibrary = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    return (await getStoredPayload<AuditLibraryItem[]>(ctx, `view:auditLibrary:${args.window}`)) ?? [];
  },
});

export const listOutlets = query({
  args: {},
  handler: async (ctx) => {
    return (await getStoredPayload<OutletSummary[]>(ctx, "view:outlets")) ?? [];
  },
});

export const listOutletProfiles = query({
  args: {
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    const outletProfiles = await getStoredPayload<Record<string, OutletProfile>>(ctx, `view:outletProfiles:${args.window}`);
    return outletProfiles ? Object.values(outletProfiles) : [];
  },
});

export const getOutletProfile = query({
  args: {
    outletId: v.string(),
    window: timeWindowValidator,
  },
  handler: async (ctx, args) => {
    const outletProfiles = await getStoredPayload<Record<string, OutletProfile>>(ctx, `view:outletProfiles:${args.window}`);
    return outletProfiles?.[args.outletId] ?? null;
  },
});

export const getAuditCard = query({
  args: {
    cardId: v.string(),
  },
  handler: async (ctx, args) => {
    const auditCards = await getStoredPayload<Record<string, AuditCardPayload>>(ctx, "view:auditCardsById");
    return auditCards?.[args.cardId] ?? null;
  },
});
