---
name: data-pipeline
description: Use when designing or implementing ingestion, normalization, rollups, serving tables, worker jobs, or analytics infrastructure for Media Echo Romania. Enforce the agreed architecture: poll GDELT exports on a schedule, filter early to curated Romanian outlets, use Mentions as the participation/timing spine, enrich with GKG and matching Events, keep historical and derived analytics in BigQuery, and use Convex only for app state and lightweight serving/cache payloads.
---

# Data Pipeline Principles

Use this skill for backend data flow decisions, worker design, data modeling, and analytics-serving architecture.

The goal is not "query BigQuery from the UI" and not "store the whole warehouse in Convex."

The agreed architecture is:

1. Poll GDELT exports on a schedule, typically every 15 minutes.
2. Detect new files from `masterfilelist.txt`.
3. Load raw files with lineage preserved.
4. Filter as early as safely possible to curated Romanian outlets and domains.
5. Use `Mentions` as the primary spine for outlet participation and timing.
6. Join matching `GKG` rows for themes, entities, tone, and framing signals.
7. Join matching `Events` rows for event backbone context.
8. Build normalized, derived, and serving layers in BigQuery.
9. Expose only small prepared payloads to the application.
10. Use Convex for user state, alerts, notes, saved views, and lightweight cached serving payloads.

# Non-Negotiable Rules

- Never make normal website page loads depend on live heavy BigQuery scans.
- Never treat Convex as the full historical warehouse.
- Never design long-range charts to read raw mention or GKG rows directly.
- Always rely on a curated Romanian outlet mapping layer for inclusion logic.
- Always preserve source lineage and file-level replayability.
- Always prefer pre-aggregated daily, weekly, or monthly rollups for historical views.

# Source Priorities

## Mentions

Treat `Mentions` as the operational backbone for:

- outlet participation
- first mention timing
- lag and wave behavior
- propagation analysis
- coverage episode construction

## GKG

Use `GKG` for:

- themes
- named entities
- tone
- framing and narrative signals

## Events

Use `Events` for:

- event IDs
- actor/action anchors
- geographic context
- rough event backbone

# Canonical Data Flow

## Phase 1: Discovery

- Poll `http://data.gdeltproject.org/gdeltv2/masterfilelist.txt`.
- Detect unseen `Mentions`, `GKG`, and `Events` files.
- Record file metadata, timestamps, and ingest status.

## Phase 2: Raw Ingestion

- Download the new export files.
- Decompress and parse them.
- Load immutable raw rows into BigQuery raw tables.
- Preserve:
  - source filename
  - ingest timestamp
  - feed type
  - original source columns needed for replay or debugging

## Phase 3: Romania Filtering and Normalization

- Normalize domains and outlet identities.
- Match rows to the curated Romanian outlet map.
- Keep only the Romania-relevant subset in normalized tables.
- Classify outlets by:
  - outlet identity
  - local vs national
  - region
  - outlet type
  - known alias or mirrored domain

Important:
Do not rely only on language or country heuristics. Domain mapping is the primary filter.

## Phase 4: Derived Analytics

Build derived datasets in BigQuery for:

- event clusters
- coverage episodes
- outlet metrics
- entity metrics
- propagation edges
- ghosting flags
- divergence signals
- local vs national comparisons
- seasonality rollups

Historical views since 2015 must be powered by rollups such as:

- daily
- weekly
- monthly
- quarterly

## Phase 5: Serving Layer

Materialize app-facing serving tables for:

- overview snapshots
- top events
- outlet detail payloads
- entity trend payloads
- compare views
- propagation views
- morning brief candidates
- status/freshness summaries

The application should request small result sets, not warehouse-scale raw slices.

## Phase 6: Convex Publication

Use Convex for:

- user profiles
- roles
- saved views
- alerts
- notes
- watchlists
- dashboard preferences
- generated morning briefs
- lightweight cached serving payloads when useful

Do not store the full historical analytics corpus in Convex.

# Storage Model

## BigQuery owns

- raw GDELT ingestion
- normalized Romania-only datasets
- historical derived analytics
- long-range time series
- serving rollups and materializations

## Convex owns

- user state
- collaboration state
- app preferences
- cacheable payloads for fast app reads
- limited hot snapshots for public or shared pages

# Historical Time-Series Guidance

Any chart or metric that spans long periods, including from 2015 to today, must come from pre-aggregated historical tables in BigQuery.

Examples:

- outlet mention counts by month
- entity tone by week
- local vs national split by month
- ghosting rate by quarter
- theme intensity by month

Serve only the resulting series points to the UI.

Bad pattern:
- raw warehouse scan per page visit

Good pattern:
- refresh aggregate tables on a schedule and serve 50-500 points

# Performance and Cost Guidance

- Filter early to reduce downstream storage and compute.
- Partition and cluster large BigQuery tables.
- Precompute the common windows users actually need.
- Use materialized serving layers aggressively.
- Cache hot shared views.
- Let BigQuery do scheduled analytics work in the background.
- Let Convex and the frontend serve small prepared payloads quickly.

# Accessibility and Multi-User Serving

To make the product accessible to many users:

- prepare public/shared snapshots ahead of time
- minimize per-user heavy backend compute
- make freshness visible
- degrade gracefully when data is sparse or delayed

The right way to scale is to precompute more, not to push historical warehousing into Convex.
