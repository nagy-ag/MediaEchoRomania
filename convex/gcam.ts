import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const gcamRow = v.object({
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
});

function emitEvent(functionName: string, outcome: { status: "success" | "error"; errorCode?: string | null }, performance: Record<string, number>, business: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      event: functionName,
      request: {
        request_id: `${functionName}-${Date.now()}`,
        function_name: functionName,
      },
      infrastructure: {
        service: "convex",
        deployment_platform: "convex",
      },
      performance,
      business,
      outcome,
    }),
  );
}

export const getCodebookStatus = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("gcamCodebook").collect();
    return {
      codeCount: rows.length,
      familyCount: new Set(rows.map((row) => `${row.familyPrefix}${row.majorGroupId}`)).size,
      latestUpdate: rows.map((row) => row.updatedAt).sort((a, b) => b.localeCompare(a))[0] ?? null,
    };
  },
});

export const lookupCodes = query({
  args: {
    codes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const code of args.codes) {
      const doc = await ctx.db.query("gcamCodebook").withIndex("by_code", (q) => q.eq("code", code)).unique();
      if (doc) {
        results.push(doc);
      }
    }
    return results;
  },
});

export const resetCodebook = mutation({
  args: {},
  handler: async (ctx) => {
    let deleted = 0;
    for (const tableName of ["gcamCodeAliases", "gcamFamilies", "gcamCodebook"] as const) {
      const docs = await ctx.db.query(tableName).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
        deleted += 1;
      }
    }

    emitEvent("gcam.resetCodebook", { status: "success" }, { db_writes: deleted }, { deleted_records: deleted });
    return true;
  },
});

export const importCodebookBatch = mutation({
  args: {
    rows: v.array(gcamRow),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const familyIds = new Set<string>();
    let aliasInserts = 0;

    for (const row of args.rows) {
      await ctx.db.insert("gcamCodebook", {
        ...row,
        createdAt: now,
        updatedAt: now,
      });
      familyIds.add(`${row.familyPrefix}${row.majorGroupId}`);
      await ctx.db.insert("gcamCodeAliases", {
        code: row.code,
        alias: row.label,
        aliasType: "label",
        createdAt: now,
      });
      aliasInserts += 1;
    }

    let familiesCreated = 0;
    for (const familyId of familyIds) {
      const existing = await ctx.db.query("gcamFamilies").withIndex("by_family_id", (q) => q.eq("familyId", familyId)).unique();
      if (existing) {
        continue;
      }
      const sample = args.rows.find((row) => `${row.familyPrefix}${row.majorGroupId}` === familyId);
      if (!sample) {
        continue;
      }
      await ctx.db.insert("gcamFamilies", {
        familyId,
        familyName: sample.dictionaryName,
        description: sample.citation,
        displayOrder: sample.majorGroupId,
        createdAt: now,
      });
      familiesCreated += 1;
    }

    emitEvent(
      "gcam.importCodebookBatch",
      { status: "success" },
      { db_writes: args.rows.length + aliasInserts + familiesCreated },
      { inserted_rows: args.rows.length, alias_inserts: aliasInserts, families_created: familiesCreated },
    );

    return {
      inserted: args.rows.length,
      familiesCreated,
    };
  },
});