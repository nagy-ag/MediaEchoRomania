---
name: techical-prd
description: Technical product and system specification for Media Echo Romania. Use when designing architecture, storage boundaries, ingestion jobs, serving layers, worker cadence, historical analytics, or API contracts. Enforce the agreed split: BigQuery for raw, normalized, derived, and historical analytics; Convex for app state and lightweight cached payloads; no live heavy warehouse scans in normal page loads.
---

# Technical PRD / System Specification

## Product name

Romanian Media Intelligence & Comparison Platform

## Status

Technical PRD / System Spec v2

## Scope

Define the architecture, data flow, storage boundaries, serving model, worker cadence, and historical analytics strategy for Media Echo Romania.

## Time horizon

Historical backfill from `2015-01-01` through today, followed by continuous incremental ingestion.

## Core infrastructure choices

- Primary analytical store: BigQuery
- Primary data source family: GDELT 2.0 exports
- Export discovery source: `http://data.gdeltproject.org/gdeltv2/masterfilelist.txt`
- Application state and lightweight cache: Convex
- Worker orchestration: Railway or equivalent scheduled workers
- Core GDELT tables: Events, Mentions, GKG
- GCAM codebook storage and lookup: Convex

# 1. System purpose

The system ingests, filters, normalizes, derives, and serves Romanian media intelligence from GDELT.

It must support:

- historical analysis from 2015 onward
- near-real-time updates for recent activity
- event-centric modeling
- outlet metrics
- entity tracking
- propagation and ghosting logic
- fast multi-user dashboard access
- predictable serving cost

The key design constraint is:

Normal user page loads must not depend on live heavy BigQuery scans.

# 2. Architecture overview

## 2.1 High-level architecture

```ascii
+----------------------+
| GDELT export feeds   |
| Mentions / GKG /     |
| Events + masterfile  |
+----------+-----------+
           |
           v
+-----------------------------+
| Ingestion workers           |
| - poll masterfile           |
| - detect new exports        |
| - download and parse        |
| - load raw rows             |
+-------------+---------------+
              |
              v
+-----------------------------+
| BigQuery raw layer          |
| - raw_mentions              |
| - raw_gkg                   |
| - raw_events                |
| - ingest registry           |
+-------------+---------------+
              |
              v
+-----------------------------+
| BigQuery Romania norm layer |
| - outlets_norm              |
| - mentions_ro               |
| - gkg_ro                    |
| - events_ro                 |
| - entities_norm             |
+-------------+---------------+
              |
              v
+-----------------------------+
| BigQuery derived layer      |
| - event clusters            |
| - coverage episodes         |
| - outlet metrics            |
| - entity metrics            |
| - propagation               |
| - ghosting                  |
| - local vs national         |
| - seasonality               |
+-------------+---------------+
              |
              v
+-----------------------------+
| BigQuery serving layer      |
| - overview snapshots        |
| - top events                |
| - outlet detail payloads    |
| - entity trend series       |
| - compare caches            |
| - status snapshots          |
+-------------+---------------+
              |
              v
+-----------------------------+
| Convex                      |
| - users                     |
| - saved views               |
| - alerts                    |
| - notes                     |
| - watchlists                |
| - dashboard preferences     |
| - cached small payloads     |
+-------------+---------------+
              |
              v
+-----------------------------+
| App / API / CDN             |
| - fast page reads           |
| - public/shared analytics   |
| - analyst drilldowns        |
+-----------------------------+
```

## 2.2 Boundary rules

- BigQuery owns historical and derived analytics.
- Convex owns app state and lightweight cache/state payloads.
- The frontend reads serving payloads, not raw warehouse tables.
- Historical charts should come from pre-aggregated time series.

# 3. Data source strategy

## 3.1 Role of each GDELT table

### Mentions

Primary operational backbone for:

- outlet participation
- timing
- lag
- waves
- propagation logic
- coverage episode construction

### GKG

Primary narrative layer for:

- themes
- entities
- tone
- framing signals
- article-level enrichment

### Events

Backbone context for:

- event IDs
- actor/action context
- geographies
- event-level anchoring

## 3.2 Romania-first filtering

The system should filter early to Romanian outlets using a curated domain and outlet mapping layer.

This mapping layer is a critical dependency and should classify:

- outlet identity
- local vs national
- region
- outlet type
- mirrored domains and aliases

Do not rely only on language or country heuristics.

# 4. Core technical requirements

## 4.1 Ingestion

The system must:

- poll for new exports on a short schedule, typically every 15 minutes
- support historical backfill from 2015 onward
- avoid double ingestion
- preserve file-level lineage
- record ingest status and errors
- support replay and partial rebuilds

## 4.2 Storage

The system must:

- store raw exports and lineage in BigQuery
- store Romania-only normalized datasets in BigQuery
- store derived and historical rollups in BigQuery
- store app state and lightweight cached payloads in Convex

## 4.3 Computation

The system must:

- derive recent intraday rollups
- derive daily, weekly, and monthly historical rollups
- compute outlet and entity metrics
- compute propagation, ghosting, and divergence
- support historical charts since 2015 without raw scans at request time

## 4.4 Serving

The system must:

- serve common pages from prepared serving tables or cached payloads
- return small result sets to the UI
- support public or shared analytics pages efficiently
- expose freshness and confidence metadata with responses

# 5. Pipeline design

## Stage A: masterfile discovery

- fetch `masterfilelist.txt`
- parse entries
- classify by feed type
- compare against ingest registry
- enqueue unseen files

## Stage B: raw ingestion

- download exports
- decompress and parse
- append raw rows into BigQuery raw tables
- preserve source filename, feed type, and ingest timestamp

## Stage C: Romania normalization

- normalize domains and source identities
- match against curated Romanian outlet mapping
- create Romania-only normalized tables
- standardize timestamps, entities, and outlet IDs

## Stage D: derivation

Build:

- event clusters
- coverage episodes
- outlet metrics
- entity metrics
- propagation edges
- ghosting flags
- divergence signals
- local vs national metrics
- seasonality rollups

## Stage E: serving materialization

Build:

- overview snapshots
- top events lists
- outlet detail payloads
- entity time-series payloads
- compare views
- morning brief candidate sets
- freshness and status summaries

## Stage F: app publication

Push or expose only compact serving payloads to the app layer.

Convex may cache selected outputs, but it must not become the full historical warehouse.

# 6. Dataset design

Recommended BigQuery datasets:

```ascii
gdelt_raw
gdelt_norm
gdelt_derived
gdelt_serving
gdelt_ops
```

## 6.1 `gdelt_raw`

Purpose:

- immutable source-of-truth raw ingestion
- replayability
- debugging

Core tables:

- `raw_mentions`
- `raw_gkg`
- `raw_events`
- `raw_files`
- `ingest_registry`
- `ingest_errors`

## 6.2 `gdelt_norm`

Purpose:

- Romania-only normalized operational layer

Core tables:

- `outlets_norm`
- `mentions_ro`
- `gkg_ro`
- `events_ro`
- `entities_norm`
- `theme_maps`

## 6.3 `gdelt_derived`

Purpose:

- reusable analytical computations

Core tables:

- `event_clusters`
- `coverage_episodes`
- `outlet_metrics_daily`
- `outlet_metrics_monthly`
- `entity_metrics_daily`
- `entity_metrics_monthly`
- `theme_metrics_monthly`
- `propagation_edges`
- `ghosting_flags`
- `divergence_flags`
- `local_vs_national_monthly`
- `seasonality_rollups`

## 6.4 `gdelt_serving`

Purpose:

- fast application-serving layer

Core tables:

- `overview_current`
- `top_events_current`
- `morning_brief_candidates`
- `outlet_compare_cache`
- `outlet_detail_cache`
- `entity_trend_cache`
- `status_summary`

## 6.5 `gdelt_ops`

Purpose:

- operational observability
- worker health
- stale-data monitoring
- backfill tracking

# 7. Historical analytics strategy

Historical analysis is a first-class feature, not an afterthought.

Any view spanning large time ranges, especially from 2015 onward, must be backed by aggregates such as:

- daily series
- weekly series
- monthly series
- quarterly series

Examples:

- outlet mention volume by month
- entity tone by week
- local vs national split by month
- ghosting rate by quarter
- theme salience by month

The UI should request only the resulting points, not raw event or mention rows.

# 8. Convex role

Convex is not the historical warehouse.

Convex should store:

- users
- roles
- saved views
- watchlists
- alerts
- notes
- dashboard preferences
- generated brief records
- selective cached serving payloads
- GCAM metadata

Convex should not store:

- the full mentions corpus
- the full GKG corpus
- all historical analytical time series by default

# 9. API and contract principles

All app-facing responses should include:

- `generated_at`
- `data_freshness`
- `filters_applied`
- `confidence_notes`
- `granularity`

For long-range charts, granularity should usually be:

- recent range: hourly or daily
- medium range: daily or weekly
- multi-year range: monthly or quarterly

# 10. Job cadence

## Near-real-time

- poll masterfile every 15 minutes or similar
- ingest new files
- refresh recent serving snapshots

## Daily

- recompute daily outlet and entity metrics
- refresh ghosting and divergence outputs
- generate morning brief candidate sets

## Weekly or monthly

- refresh long-range seasonality
- refresh historical comparative rollups
- refresh local vs national long-term profiles

# 11. Performance requirements

- normal pages should load from serving/cache layers
- the UI should not trigger raw warehouse scans
- historical pages should read rollups, not raw rows
- public/shared pages should be cacheable and cheap to serve

# 12. Cost strategy

## BigQuery

- partition large tables
- cluster common filter columns
- filter early to Romania-only subsets
- precompute common rollups
- avoid raw scans from app traffic

## Convex

- keep documents compact
- store only app state and useful cached payloads
- avoid full analytical duplication

## Worker layer

- keep workers reproducible and restartable
- prefer scheduled batch computation over per-user heavy compute

# 13. Open technical questions

- Which Romanian outlets are in the initial curated mapping?
- How much manual curation is available for outlet identity quality?
- Which historical granularities should ship first for analyst views?
- What freshness SLA should overview and alert pages target?
- Which serving payloads should be copied into Convex versus read from backend cache?

# 14. Final system definition

This system is a Romania-first GDELT ingestion and analytics pipeline that:

- polls exports on a short schedule
- filters early to Romanian outlets
- uses BigQuery for raw, normalized, derived, and historical analytics
- uses Convex for app state and lightweight serving caches
- serves fast user-facing pages from prepared rollups rather than live heavy warehouse queries

It is intentionally:

- GDELT-first
- event-centric
- comparison-heavy
- historically aware
- fast to serve
- affordable to scale
- explainable by design
