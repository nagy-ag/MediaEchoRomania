import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const pageType = v.union(
  v.literal("overview"),
  v.literal("morningBrief"),
  v.literal("eventUniverse"),
  v.literal("events"),
  v.literal("outlets"),
  v.literal("compareOutlets"),
  v.literal("entities"),
  v.literal("propagation"),
  v.literal("contradictions"),
  v.literal("biasPanel"),
  v.literal("seasonality"),
  v.literal("localVsNational"),
  v.literal("explore"),
  v.literal("search"),
  v.literal("savedViews"),
  v.literal("alerts"),
  v.literal("docs"),
  v.literal("status"),
  v.literal("admin"),
);
const severity = v.union(v.literal("info"), v.literal("warning"), v.literal("critical"));
const density = v.union(v.literal("comfortable"), v.literal("compact"), v.literal("analyst"));

async function findUserByIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  return { identity, user: (user ?? null) as Doc<"users"> | null };
}

async function requireUser(ctx: MutationCtx) {
  const payload = await findUserByIdentity(ctx);
  if (!payload) {
    throw new Error("Authentication required.");
  }

  const now = new Date().toISOString();
  if (payload.user) {
    await ctx.db.patch(payload.user._id, {
      email: payload.identity.email,
      name: payload.identity.name,
      imageUrl: payload.identity.pictureUrl,
      updatedAt: now,
    });
    return (await ctx.db.get(payload.user._id)) as Doc<"users">;
  }

  const userId = await ctx.db.insert("users", {
    clerkId: payload.identity.subject,
    tokenIdentifier: payload.identity.tokenIdentifier,
    email: payload.identity.email,
    name: payload.identity.name,
    imageUrl: payload.identity.pictureUrl,
    role: "viewer",
    createdAt: now,
    updatedAt: now,
  });

  return (await ctx.db.get(userId)) as Doc<"users">;
}

async function getStoredUser(ctx: QueryCtx) {
  const payload = await findUserByIdentity(ctx);
  if (!payload?.user) {
    return null;
  }
  return payload.user;
}

export const storeCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return user._id;
  },
});

export const viewerState = query({
  args: {},
  handler: async (ctx) => {
    const payload = await findUserByIdentity(ctx);
    if (!payload) {
      return {
        isSignedIn: false,
        viewer: null,
        preferences: null,
      };
    }

    if (!payload.user) {
      return {
        isSignedIn: true,
        viewer: {
          name: payload.identity.name ?? payload.identity.email ?? "Analyst",
          email: payload.identity.email ?? null,
          role: "viewer" as const,
          imageUrl: payload.identity.pictureUrl ?? null,
        },
        preferences: null,
      };
    }

    const user = payload.user;
    const preferences = await ctx.db
      .query("dashboardPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return {
      isSignedIn: true,
      viewer: {
        name: user.name ?? user.email ?? "Analyst",
        email: user.email ?? null,
        role: user.role,
        imageUrl: user.imageUrl ?? null,
      },
      preferences,
    };
  },
});

export const savedViews = query({
  args: {},
  handler: async (ctx) => {
    const user = await getStoredUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db.query("savedViews").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const createSavedView = mutation({
  args: {
    name: v.string(),
    pageType,
    filtersSummary: v.string(),
    layoutJson: v.optional(v.string()),
    isShared: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = new Date().toISOString();
    return await ctx.db.insert("savedViews", { ...args, userId: user._id, createdAt: now, updatedAt: now });
  },
});

export const removeSavedView = mutation({
  args: { id: v.id("savedViews") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== user._id) {
      throw new Error("Saved view not found.");
    }
    await ctx.db.delete(args.id);
    return true;
  },
});

export const watchlists = query({
  args: {},
  handler: async (ctx) => {
    const user = await getStoredUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db.query("watchlists").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const createWatchlist = mutation({
  args: {
    name: v.string(),
    targets: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = new Date().toISOString();
    return await ctx.db.insert("watchlists", { ...args, userId: user._id, createdAt: now, updatedAt: now });
  },
});

export const removeWatchlist = mutation({
  args: { id: v.id("watchlists") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== user._id) {
      throw new Error("Watchlist not found.");
    }
    await ctx.db.delete(args.id);
    return true;
  },
});

export const alerts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getStoredUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db.query("alerts").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const createAlert = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    severity,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("alerts", {
      ...args,
      userId: user._id,
      seen: false,
      createdAt: new Date().toISOString(),
    });
  },
});

export const markAlertSeen = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== user._id) {
      throw new Error("Alert not found.");
    }
    await ctx.db.patch(args.id, { seen: true });
    return true;
  },
});

export const notes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getStoredUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db.query("notes").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const createNote = mutation({
  args: {
    targetType: v.union(v.literal("event"), v.literal("outlet"), v.literal("entity")),
    targetId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("notes", {
      ...args,
      userId: user._id,
      createdAt: new Date().toISOString(),
    });
  },
});

export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== user._id) {
      throw new Error("Note not found.");
    }
    await ctx.db.delete(args.id);
    return true;
  },
});

export const dashboardPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await getStoredUser(ctx);
    if (!user) {
      return null;
    }
    return await ctx.db.query("dashboardPreferences").withIndex("by_user", (q) => q.eq("userId", user._id)).unique();
  },
});

export const upsertDashboardPreferences = mutation({
  args: {
    density,
    pinnedWidgets: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db.query("dashboardPreferences").withIndex("by_user", (q) => q.eq("userId", user._id)).unique();
    const updatedAt = new Date().toISOString();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt });
      return existing._id;
    }
    return await ctx.db.insert("dashboardPreferences", { userId: user._id, ...args, updatedAt });
  },
});

export const briefRuns = query({
  args: {},
  handler: async (ctx) => {
    const user = await getStoredUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db.query("briefRuns").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
  },
});

export const addBriefRun = mutation({
  args: {
    timeWindow: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d")),
    summaryText: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("briefRuns", {
      ...args,
      userId: user._id,
      createdAt: new Date().toISOString(),
    });
  },
});

export const adminSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await getStoredUser(ctx);
    if (!user) {
      return {
        isAdmin: false,
        role: "viewer",
        recommendation: "Admin tools require a synced user record in Convex.",
      };
    }

    return {
      isAdmin: user.role === "admin",
      role: user.role,
      recommendation:
        user.role === "admin"
          ? "Administrative controls enabled."
          : "Admin tools require an admin role in Convex.",
    };
  },
});