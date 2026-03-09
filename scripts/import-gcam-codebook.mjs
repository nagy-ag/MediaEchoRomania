import fs from "node:fs";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const BATCH_SIZE = 128;
const root = process.cwd();
const envPath = path.join(root, ".env.local");
const tsvPath = path.join(root, "data", "reference", "GCAM-MASTER-CODEBOOK.tsv");
const dryRun = process.argv.includes("--dry-run");
const keepFile = process.argv.includes("--keep-file");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const entries = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }
  return entries;
}

function parseTsv(filePath) {
  const [headerLine, ...lines] = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split("\t");
  return lines.map((line) => {
    const values = line.split("\t");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function toCodebookRow(record) {
  const match = /^([a-z]+)(\d+)\.(\d+)$/i.exec(record.Variable || "");
  if (!match) {
    throw new Error(`Unrecognized GCAM variable format: ${record.Variable}`);
  }

  const [, familyPrefix, majorGroupId, minorGroupId] = match;
  return {
    code: record.Variable,
    familyPrefix,
    majorGroupId: Number.parseInt(majorGroupId, 10),
    minorGroupId: Number.parseInt(minorGroupId, 10),
    metricType: record.Type,
    language: record.LanguageCode,
    dictionaryId: Number.parseInt(record.DictionaryID, 10),
    dictionaryName: record.DictionaryHumanName,
    label: record.DimensionHumanName,
    fullPath: `${record.DictionaryHumanName} / ${record.DimensionHumanName}`,
    citation: record.DictionaryCitation || undefined,
    notes: record.Type ? `Source metric: ${record.Type}` : undefined,
    isActive: true,
  };
}

function chunk(items, size) {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

async function main() {
  if (!fs.existsSync(tsvPath)) {
    throw new Error(`GCAM TSV not found at ${tsvPath}`);
  }

  const env = { ...loadEnv(envPath), ...process.env };
  const convexUrl = env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured in .env.local or the process environment.");
  }

  const rows = parseTsv(tsvPath).map(toCodebookRow);
  console.log(`Prepared ${rows.length} GCAM rows from ${path.relative(root, tsvPath)}.`);

  if (dryRun) {
    console.log("Dry run only. No Convex mutations executed.");
    return;
  }

  const client = new ConvexHttpClient(convexUrl);
  await client.mutation(api.gcam.resetCodebook, {});

  let inserted = 0;
  let familiesCreated = 0;
  for (const [batchIndex, batch] of chunk(rows, BATCH_SIZE).entries()) {
    const result = await client.mutation(api.gcam.importCodebookBatch, { rows: batch });
    inserted += result.inserted;
    familiesCreated += result.familiesCreated;
    console.log(`Imported batch ${batchIndex + 1}: ${result.inserted} rows (${inserted}/${rows.length}).`);
  }

  console.log(`GCAM import complete: ${inserted} rows, ${familiesCreated} family inserts across batches.`);
  if (!keepFile) {
    fs.rmSync(tsvPath);
    console.log(`Removed ${path.relative(root, tsvPath)} after successful import.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});