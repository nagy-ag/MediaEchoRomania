import { v } from "convex/values";
import { query } from "./_generated/server";
import {
  getBiasPanelSnapshot,
  getCompareSnapshot,
  getDocsSnapshot,
  getEventSnapshot,
  getExploreSnapshot,
  getLocalVsNationalSnapshot,
  getMorningBriefSnapshot,
  getOutletSnapshot,
  getOverviewSnapshot,
  getPropagationSnapshot,
  getSearchSnapshot,
  getSeasonalitySnapshot,
  getSystemStatusSnapshot,
  getUniverseSnapshot,
  getEntitySnapshot,
  listContradictionsSnapshot,
  listEntitiesSnapshot,
  listEventsSnapshot,
  listOutletsSnapshot,
} from "../data/seed/platform-snapshots";

const timeWindow = v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"));

export const overview = query({
  args: { window: timeWindow },
  handler: async (_ctx, args) => getOverviewSnapshot(args.window),
});

export const morningBrief = query({
  args: { window: timeWindow },
  handler: async (_ctx, args) => getMorningBriefSnapshot(args.window),
});

export const eventUniverse = query({
  args: {},
  handler: async () => getUniverseSnapshot(),
});

export const events = query({
  args: {},
  handler: async () => listEventsSnapshot(),
});

export const eventDetail = query({
  args: { eventId: v.string() },
  handler: async (_ctx, args) => getEventSnapshot(args.eventId),
});

export const outlets = query({
  args: {},
  handler: async () => listOutletsSnapshot(),
});

export const outletDetail = query({
  args: { outletId: v.string() },
  handler: async (_ctx, args) => getOutletSnapshot(args.outletId),
});

export const compareOutlets = query({
  args: {},
  handler: async () => getCompareSnapshot(),
});

export const entities = query({
  args: {},
  handler: async () => listEntitiesSnapshot(),
});

export const entityDetail = query({
  args: { entityId: v.string() },
  handler: async (_ctx, args) => getEntitySnapshot(args.entityId),
});

export const propagation = query({
  args: {},
  handler: async () => getPropagationSnapshot(),
});

export const contradictions = query({
  args: {},
  handler: async () => listContradictionsSnapshot(),
});

export const biasPanel = query({
  args: {},
  handler: async () => getBiasPanelSnapshot(),
});

export const seasonality = query({
  args: {},
  handler: async () => getSeasonalitySnapshot(),
});

export const localVsNational = query({
  args: {},
  handler: async () => getLocalVsNationalSnapshot(),
});

export const explore = query({
  args: {},
  handler: async () => getExploreSnapshot(),
});

export const search = query({
  args: {},
  handler: async () => getSearchSnapshot(),
});

export const docs = query({
  args: {},
  handler: async () => getDocsSnapshot(),
});

export const status = query({
  args: {},
  handler: async () => getSystemStatusSnapshot(),
});
