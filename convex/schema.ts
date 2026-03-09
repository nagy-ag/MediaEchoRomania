import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("viewer"), v.literal("analyst"), v.literal("admin")),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token_identifier", ["tokenIdentifier"]),
  savedViews: defineTable({
    userId: v.id("users"),
    name: v.string(),
    pageType: v.string(),
    filtersSummary: v.string(),
    layoutJson: v.optional(v.string()),
    isShared: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),
  watchlists: defineTable({
    userId: v.id("users"),
    name: v.string(),
    targets: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),
  alerts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    summary: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    seen: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_seen", ["userId", "seen"]),
  notes: defineTable({
    userId: v.id("users"),
    targetType: v.union(v.literal("event"), v.literal("outlet"), v.literal("entity")),
    targetId: v.string(),
    content: v.string(),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_target", ["targetType", "targetId"]),
  dashboardPreferences: defineTable({
    userId: v.id("users"),
    density: v.union(v.literal("comfortable"), v.literal("compact"), v.literal("analyst")),
    pinnedWidgets: v.array(v.string()),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),
  briefRuns: defineTable({
    userId: v.id("users"),
    timeWindow: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d")),
    summaryText: v.string(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),
  dashboardCache: defineTable({
    cacheKey: v.string(),
    pageType: v.string(),
    filtersHash: v.string(),
    payloadJson: v.string(),
    generatedAt: v.string(),
    ttlSeconds: v.number(),
  })
    .index("by_cache_key", ["cacheKey"])
    .index("by_page_type", ["pageType"]),
  gcamCodebook: defineTable({
    code: v.string(),
    familyPrefix: v.string(),
    majorGroupId: v.number(),
    minorGroupId: v.number(),
    metricType: v.string(),
    language: v.string(),
    dictionaryId: v.number(),
    dictionaryName: v.string(),
    label: v.string(),
    fullPath: v.optional(v.string()),
    citation: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_code", ["code"]),
  gcamFamilies: defineTable({
    familyId: v.string(),
    familyName: v.string(),
    description: v.optional(v.string()),
    displayOrder: v.number(),
    createdAt: v.string(),
  }).index("by_family_id", ["familyId"]),
  gcamCodeAliases: defineTable({
    code: v.string(),
    alias: v.string(),
    aliasType: v.string(),
    createdAt: v.string(),
  }).index("by_code", ["code"]),
});
