import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  mockPayloads: defineTable({
    key: v.string(),
    payloadJson: v.string(),
    version: v.string(),
    updatedAt: v.string(),
  }).index("by_key", ["key"]),
});
