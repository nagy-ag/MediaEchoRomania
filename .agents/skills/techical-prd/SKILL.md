## Technical PRD / System Specification

### Product name

Romanian Media Intelligence & Comparison Platform

### Document status

Technical PRD / System Spec v1

### Scope

This document defines the technical architecture, data flow, storage model, computation model, automation approach, and delivery plan for a GDELT-first Romanian media intelligence platform.

### Time horizon

Historical backfill from **2015-01-01 through today**, followed by continuous ongoing ingestion.

### Core infrastructure choices

* **Primary analytical warehouse:** BigQuery
* **Primary raw feed reference for mentions ingestion:** `http://data.gdeltproject.org/gdeltv2/masterfilelist.txt`
* **Application database:** Convex
* **Optional job orchestration / lightweight automation:** Railway
* **Primary data source family:** GDELT 2.0
* **Core GDELT tables used:** Events, Mentions, GKG
- **GCAM codebook storage and lookup:** Convex
- **GCAM interpretation layer:** GCAM codebook metadata stored in Convex and used to decode GCAM dimensions into human-readable labels, categories, and families for analytics and UI rendering

---

# 1. System purpose

The system ingests, normalizes, stores, computes, and serves media intelligence derived from GDELT for Romanian media analysis.

It must support:

* historical backfill from 2015 to present
* continuous near-real-time updates
* event-centric modeling
* outlet-level behavioral metrics
* entity-level tracking
* propagation and ghosting analysis
* dashboard-serving APIs
* analyst-friendly, explainable metrics

The platform must be able to answer:

* what event clusters exist
* which outlets covered them
* when they covered them
* how coverage spread
* how framing differed
* what was ignored
* how outlet behavior evolved over time

---

# 2. Architecture overview

## 2.1 High-level architecture

```ascii
+--------------------+
| GDELT Data Feeds   |
| Events / Mentions  |
| GKG / Masterfile   |
+---------+----------+
          |
          v
+-----------------------------+
| Ingestion Layer             |
| - fetch masterfilelist      |
| - detect new files          |
| - download / parse / load   |
+-------------+---------------+
              |
              v
+-----------------------------+
| BigQuery Raw Layer          |
| - raw_events                |
| - raw_mentions              |
| - raw_gkg                   |
| - ingest_logs               |
+-------------+---------------+
              |
              v
+-----------------------------+
| BigQuery Normalized Layer   |
| - events_norm               |
| - mentions_norm             |
| - gkg_norm                  |
| - outlets_norm              |
| - entities_norm             |
| - theme_maps                |
+-------------+---------------+
              |
              v
+-----------------------------+
| BigQuery Derived Layer      |
| - event_clusters            |
| - coverage_episodes         |
| - outlet_metrics_daily      |
| - entity_metrics_daily      |
| - propagation_edges         |
| - ghosting_flags            |
| - divergence_flags          |
| - seasonality_rollups       |
+-------------+---------------+
              |
              v
+-----------------------------+
| Convex App DB               |
| - user state                |
| - saved views               |
| - watchlists                |
| - dashboard materialization |
| - query caches              |
| - alerts                    |
+-------------+---------------+
              |
              v
+-----------------------------+
| Dashboard / API Layer       |
| - overview                  |
| - morning brief             |
| - event pages               |
| - outlet pages              |
| - compare views             |
+-----------------------------+
```

---

# 3. Data source specification

## 3.1 GDELT feeds in scope

### Events

Used for:

* event IDs
* actor/action structure
* event date
* geography
* rough event backbone

### Mentions

Used for:

* outlet participation
* timing
* first/late mentions
* propagation
* media behavior

### GKG

Used for:

* article-level themes
* entities
* tone
* counts
* semantic framing signals

## 3.2 Master feed source

Mentions discovery will use:

`http://data.gdeltproject.org/gdeltv2/masterfilelist.txt`

This file acts as the discovery index for GDELT v2 update files and should be polled continuously for new deltas.

## 3.3 Historical scope

Backfill from:

* `2015-01-01`
  to
* current day

## 3.4 Incremental scope

After historical completion:

* continue ingestion on rolling updates from new GDELT files

---

# 4. Core technical requirements

## 4.1 Ingestion requirements

The system must:

* backfill all required GDELT files from 2015 to present
* detect and avoid double-loading files
* preserve raw data lineage
* record ingestion status per file
* support replay and reprocessing
* allow selective rebuilds by date range or table type

## 4.2 Storage requirements

The system must:

* store raw GDELT data in BigQuery
* store normalized and derived datasets in BigQuery
* store app-facing and user-facing state in Convex
* support efficient dashboard queries and materialized rollups

## 4.3 Computation requirements

The system must:

* compute daily and intraday rollups
* derive outlet metrics
* derive event clusters and coverage episodes
* compute ghosting and propagation signals
* compute bias-panel components
* support historical trend views

## 4.4 Automation requirements

The system should:

* use Railway where useful for scheduled workers, ingestion jobs, and lightweight orchestration
* keep computation reproducible and restartable
* alert on ingestion failures or stale data

---

# 5. Data pipeline design

## 5.1 Ingestion stages

### Stage A: master file discovery

Input:

* `masterfilelist.txt`

Responsibilities:

* fetch latest master list
* parse all entries
* identify file type
* identify publication timestamp
* compare against `ingest_registry`
* enqueue unseen files

Output:

* ingestion queue records

### Stage B: file download

Responsibilities:

* download GDELT file
* verify retrieval success
* persist temporary artifact
* decompress as needed
* register checksum / file metadata

Output:

* raw file ready for parsing

### Stage C: parsing and schema alignment

Responsibilities:

* parse TSV or source format
* map fields to raw schema
* coerce types
* preserve original columns where possible
* add metadata:

  * file timestamp
  * source filename
  * ingest timestamp
  * feed type

Output:

* BigQuery load-ready records

### Stage D: raw load into BigQuery

Responsibilities:

* append rows to raw tables
* preserve source lineage
* partition by ingest date or event date
* cluster by relevant keys

Output:

* raw warehouse tables

### Stage E: normalization

Responsibilities:

* normalize outlets/domains
* normalize date/time fields
* normalize actor/entity strings
* create stable internal IDs
* standardize nulls and malformed data
* enrich with Romania-specific outlet mapping if available

Output:

* normalized warehouse tables

### Stage F: derivation

Responsibilities:

* build event clusters
* compute mention episodes
* compute outlet metrics
* compute entity metrics
* compute propagation
* compute ghosting
* compute divergence
* compute seasonal rollups

Output:

* serving/analytics layer

---

# 6. BigQuery dataset design

Recommended dataset structure:

```ascii
gdelt_raw
gdelt_norm
gdelt_derived
gdelt_serving
gdelt_ops
```

## 6.1 `gdelt_raw`

### Tables

* `raw_events`
* `raw_mentions`
* `raw_gkg`
* `raw_files`
* `ingest_registry`
* `ingest_errors`

### Purpose

Immutable raw source-of-truth ingestion tables.

---

## 6.2 `gdelt_norm`

### Tables

* `events_norm`
* `mentions_norm`
* `gkg_norm`
* `outlets_norm`
* `entities_norm`
* `themes_norm`
* `locations_norm`
* `gkg_counts_norm`

### Purpose

Cleaned and standardized analytical tables.

---

## 6.3 `gdelt_derived`

### Tables

* `event_clusters`
* `coverage_episodes`
* `event_outlet_daily`
* `outlet_metrics_daily`
* `outlet_metrics_monthly`
* `entity_metrics_daily`
* `entity_metrics_monthly`
* `propagation_edges`
* `ghosting_candidates`
* `ghosting_confirmed`
* `divergence_flags`
* `bias_panel_daily`
* `seasonality_rollups`
* `local_national_rollups`
* `media_dna_profiles`

### Purpose

Computed intelligence layer.

---

## 6.4 `gdelt_serving`

### Tables / materialized views

* `dashboard_overview_today`
* `dashboard_overview_7d`
* `morning_brief_candidates`
* `top_events_current`
* `top_entities_current`
* `outlet_compare_cache`
* `event_detail_cache`
* `entity_detail_cache`

### Purpose

Fast dashboard-serving layer.

---

## 6.5 `gdelt_ops`

### Tables

* `job_runs`
* `job_status`
* `pipeline_audit`
* `backfill_tracker`
* `rebuild_requests`

### Purpose

Operational control and observability.

---

# 7. BigQuery table specifications

## 7.1 `raw_events`

Suggested columns:

* `source_file`
* `ingested_at`
* `global_event_id`
* `sql_date`
* `month_year`
* `year`
* `fraction_date`
* `actor1_*`
* `actor2_*`
* `event_code`
* `event_base_code`
* `event_root_code`
* `quad_class`
* `goldstein_scale`
* `num_mentions`
* `num_sources`
* `num_articles`
* `avg_tone`
* `actor1_geo_*`
* `actor2_geo_*`
* `action_geo_*`
* `date_added`
* `source_url`

Partition:

* by `sql_date`

Cluster:

* `global_event_id`, `event_root_code`, `actor1_country_code`, `actor2_country_code`

## 7.2 `raw_mentions`

Suggested columns:

* `source_file`
* `ingested_at`
* `global_event_id`
* `event_time`
* `mention_time`
* `mention_type`
* `source_domain`
* `source_url`
* `char_offset`
* `confidence`
* `mention_doc_tone`
* raw remaining fields as preserved

Partition:

* by `mention_time` date

Cluster:

* `global_event_id`, `source_domain`

## 7.3 `raw_gkg`

Suggested columns:

* `source_file`
* `ingested_at`
* `gkg_record_id`
* `date`
* `source_collection_identifier`
* `source_common_name`
* `document_identifier`
* `counts`
* `v2counts`
* `themes`
* `v2themes`
* `locations`
* `v2locations`
* `persons`
* `v2persons`
* `organizations`
* `v2organizations`
* `v2tone`
* `dates`
* `gcam`
* `sharing_image`
* `extras`

Partition:

* by `date`

Cluster:

* `source_common_name`, `document_identifier`

---

# 8. Normalized data model

## 8.1 `outlets_norm`

Purpose:
Create a canonical outlet identity layer.

Fields:

* `outlet_id`
* `canonical_domain`
* `canonical_name`
* `country`
* `is_romanian`
* `is_local`
* `is_national`
* `media_type`
* `parent_group`
* `source_class`
* `status`
* `created_at`
* `updated_at`

Important:
Romanian outlet normalization is one of the most important pieces.
This table may require a curated mapping layer.

## 8.2 `events_norm`

Fields:

* `event_id` (internal)
* `global_event_id`
* `event_date`
* `event_datetime_best`
* `event_root_code`
* `event_code`
* `quad_class`
* `goldstein_scale`
* `source_url`
* `actor1_name`
* `actor2_name`
* `actor1_country_code`
* `actor2_country_code`
* `action_geo`
* `avg_tone`
* `num_mentions`
* `num_articles`
* `num_sources`

## 8.3 `mentions_norm`

Fields:

* `mention_id` (internal hash)
* `global_event_id`
* `event_id`
* `mention_datetime`
* `outlet_id`
* `source_domain`
* `source_url`
* `mention_doc_tone`
* `mention_type`
* `is_romanian_outlet`
* `is_local`
* `is_national`

## 8.4 `gkg_norm`

Fields:

* `gkg_id`
* `document_identifier`
* `outlet_id`
* `gkg_datetime`
* `v2tone_base`
* `v2tone_positive`
* `v2tone_negative`
* `v2tone_polarity`
* `word_count_estimate`
* parsed core metadata
* `global_event_id` if inferred/mapped
* `source_url`

## 8.5 GCAM parsing and interpretation model

### Raw storage
Raw GCAM strings from GKG records will be preserved in BigQuery.

### Parsed storage
GCAM dimensions should also be parsed into a long-form analytical table.

Recommended table:
`gkg_gcam_expanded`

Suggested fields:
- `gkg_id`
- `document_identifier`
- `outlet_id`
- `gcam_code`          // e.g. c16.121, v19.2
- `gcam_value`
- `family_prefix`      // c / v
- `major_group_id`
- `minor_group_id`
- `metric_type_inferred`
- `gkg_datetime`

### Interpretation
The semantic meaning of each `gcam_code` will not be hardcoded in BigQuery. Instead, interpretation will be resolved by joining or enriching against the GCAM codebook stored in Convex at the application/service layer, or by periodically exporting a codebook snapshot into BigQuery if needed for analytical joins.

### Purpose
This separation allows:
- efficient warehouse storage of raw and parsed GCAM signals
- flexible application-level interpretation
- easier maintenance of code labels and notes
- richer UI explanations and dashboard tooltips

## 8.6 `entities_norm`

Fields:

* `entity_id`
* `entity_name`
* `entity_type`
* `canonical_name`
* `aliases`
* `country_code`
* `first_seen`
* `last_seen`

## 8.7 junction tables

Recommended:

* `gkg_persons`
* `gkg_organizations`
* `gkg_locations`
* `gkg_themes`
* `gkg_counts_expanded`

These should explode delimited fields into analytical tables.

---

# 9. Event clustering design

## 9.1 Why clustering is needed

Raw GDELT event IDs are useful but insufficient.
One real-world story may span:

* many event IDs
* many mention records
* multiple article families
* multi-day evolution

The system therefore needs an internal **event cluster** abstraction.

## 9.2 Cluster construction strategy

Without embeddings, cluster by weighted rules using:

* time proximity
* shared actors
* shared geographies
* shared GKG entities
* shared top themes
* shared source URL relationships
* mention overlap across outlets

## 9.3 `event_clusters` table

Fields:

* `cluster_id`
* `cluster_title_best`
* `start_datetime`
* `end_datetime`
* `primary_geo`
* `dominant_entities`
* `dominant_themes`
* `member_global_event_ids`
* `cluster_confidence`
* `cluster_status`

## 9.4 Cluster maintenance

* incremental cluster assignment for new records
* periodic reclustering for recent rolling window
* infrequent historical recomputation

---

# 10. Coverage episode model

## 10.1 Definition

A coverage episode = one outlet’s participation in one event cluster during a bounded time window.

## 10.2 Why it matters

This is the core unit for:

* speed
* stability
* ghosting
* propagation
* outlet behavior

## 10.3 `coverage_episodes` table

Fields:

* `coverage_episode_id`
* `cluster_id`
* `outlet_id`
* `first_mention_datetime`
* `last_mention_datetime`
* `mention_count`
* `avg_tone`
* `top_themes`
* `top_entities`
* `is_first_wave`
* `lag_from_cluster_start_minutes`
* `coverage_duration_hours`
* `coverage_intensity`
* `coverage_status`

---

# 11. Metric computation specifications

## 11.1 Speed Index

### Purpose

Measure how quickly an outlet joins relevant event coverage.

### Inputs

* outlet’s first mention time per event cluster
* cluster first-seen time
* peer distribution for same cluster
* outlet category (local/national/type)
* event category if available

### Computation concept

For each coverage episode:

* compute lag = `outlet_first_mention - cluster_first_mention`

Normalize lag relative to peer group for that event.

Aggregate over selected period:

* median normalized lag
* percentile rank among peers
* weighted by event salience

### Output

`speed_index` in a bounded range, e.g. 0–100

### Interpretation

* higher = earlier relative coverage behavior
* lower = slower relative coverage behavior

---

## 11.2 Stability Index

### Purpose

Measure how stable an outlet’s early coverage remains relative to later cluster understanding.

### Inputs

* contradiction/difference signals
* early vs later count drift
* location drift
* actor drift
* framing volatility
* tone volatility

### Computation concept

For each coverage episode:

* compare first coverage window against later consensus window
* penalize large shifts in core facts or framing instability
* normalize against cluster uncertainty level

Aggregate over period:

* weighted average of episode stability

### Output

`stability_index` 0–100

### Interpretation

* higher = early coverage tends to remain stable
* lower = early coverage tends to drift or overreact

---

## 11.3 Ghosting

### Purpose

Detect when an outlet fails to cover an event it would reasonably be expected to cover.

### Inputs

* event cluster salience
* peer group coverage breadth
* outlet historical topic behavior
* outlet type (local/national)
* topical/event-type relevance

### Computation concept

An event becomes a ghosting candidate if:

* peer group coverage exceeds threshold
* event salience exceeds threshold

It becomes confirmed ghosting if:

* target outlet does not cover within configured time window
* target outlet historically covers comparable events

### Output tables

* `ghosting_candidates`
* `ghosting_confirmed`

---

## 11.4 Originality behavior

### Purpose

Estimate whether an outlet tends to lead, follow, or amplify.

### Inputs

* relative position in event coverage wave
* recurrence of early coverage
* dependence on already-established event spread
* frame distinctiveness
* propagation role

### Submetrics

* `lead_tendency`
* `follow_tendency`
* `amplification_tendency`
* `frame_distinctiveness`

### Output

Prefer panel form, not one scalar.

---

## 11.5 Bias panel

### Components

* selection asymmetry
* ghosting asymmetry
* framing asymmetry
* tone asymmetry
* entity asymmetry
* attribution asymmetry

### Notes

This is a structured panel with relative metrics, not a binary or moral judgment.

---

## 11.6 Media DNA profile

### Purpose

Persistent outlet behavior signature.

### Inputs

* speed
* stability
* breadth
* specialization
* ghosting
* tone
* frame signatures
* originality tendencies
* seasonality

### Output

* structured profile
* summary labels
* trend over time

---

# 12. Propagation model

## 12.1 Purpose

Map how coverage spreads across outlets.

## 12.2 `propagation_edges` table

Fields:

* `cluster_id`
* `source_outlet_id`
* `target_outlet_id`
* `time_delta_minutes`
* `wave_number`
* `edge_confidence`
* `shared_theme_overlap`
* `shared_entity_overlap`

## 12.3 Construction logic

Without embeddings:

* sort outlets by first mention in cluster
* infer wave order
* assign likely propagation relationships by:

  * time lag
  * outlet family/type
  * shared thematic profile
  * known amplification patterns

Important:
This is inferential and should be presented as such.

---

# 13. Divergence and contradiction model

## 13.1 Purpose

Expose instability or disagreement within event clusters.

## 13.2 `divergence_flags` table

Fields:

* `cluster_id`
* `divergence_type`
* `field_name`
* `outlet_group_a`
* `outlet_group_b`
* `value_a`
* `value_b`
* `severity`
* `first_detected_at`

## 13.3 Divergence types

* count mismatch
* location mismatch
* actor mismatch
* tone split
* frame split
* timing split

---

# 14. Seasonality model

## 14.1 Purpose

Track recurring theme and sentiment behavior over time.

## 14.2 `seasonality_rollups` table

Fields:

* `grain` (year/month/week/day/holiday)
* `theme`
* `outlet_id` or peer group
* `avg_tone`
* `mention_volume`
* `event_volume`
* `entity_volume`
* `frame_distribution`

## 14.3 Use cases

* annual theme recurrence
* holiday sentiment shifts
* election-season changes
* weekday patterns
* repeated yearly media behavior

---

# 15. Local vs national model

## 15.1 Purpose

Compare local and national outlet ecosystems.

## 15.2 Requirements

`outlets_norm` must contain robust classification:

* `is_local`
* `is_national`
* `region`
* `coverage_region_scope`

## 15.3 `local_national_rollups`

Fields:

* `date`
* `region`
* `cluster_id`
* `local_first_seen`
* `national_first_seen`
* `local_outlet_count`
* `national_outlet_count`
* `coverage_gap_type`

---

# 16. Convex application data model

Convex is the application database, not the warehouse.

## 16.1 Convex responsibilities

* user accounts and auth state
* saved views
* watchlists
* dashboard layout preferences
* query caches / serving snapshots
* alerts
* notes / annotations
* collaborative state if needed

## 16.2 Convex collections (conceptual)

### `users`

* `userId`
* `email`
* `role`
* `settings`
* `createdAt`

### `savedViews`

* `viewId`
* `userId`
* `name`
* `pageType`
* `filters`
* `layout`
* `createdAt`
* `updatedAt`

### `watchlists`

* `watchlistId`
* `userId`
* `name`
* `entities`
* `outlets`
* `themes`
* `regions`
* `alertRules`

### `alerts`

* `alertId`
* `userId`
* `alertType`
* `targetType`
* `targetId`
* `severity`
* `payload`
* `seen`
* `createdAt`

### `dashboardCache`

* `cacheKey`
* `pageType`
* `filtersHash`
* `payload`
* `generatedAt`
* `ttl`

### `notes`

* `noteId`
* `userId`
* `targetType`
* `targetId`
* `content`
* `createdAt`

### `briefRuns`

* `briefId`
* `timeWindow`
* `filters`
* `summaryText`
* `sourceEvidenceRefs`
* `createdAt`

### `gcamCodebook`
- `code`                  // e.g. "c16.121", "v19.2"
- `familyPrefix`          // e.g. "c", "v"
- `majorGroupId`          // e.g. 16, 19
- `minorGroupId`          // e.g. 121, 2
- `metricType`            // WORDCOUNT / SCOREDVALUE / etc.
- `language`              // e.g. "eng"
- `dictionaryName`        // e.g. "WordNet Domains 3.2"
- `label`                 // e.g. "politics"
- `fullPath`              // optional long taxonomy/path if available
- `citation`              // source citation / provenance
- `notes`                 // optional interpretive notes
- `isActive`
- `createdAt`
- `updatedAt`

### `gcamFamilies`
- `familyId`
- `familyName`            // e.g. "WordNet Domains", "LIWC", "ANEW", "General Inquirer"
- `description`
- `displayOrder`
- `createdAt`

### `gcamCodeAliases`
- `aliasId`
- `code`
- `alias`
- `aliasType`             // short label / UI label / internal synonym
- `createdAt`

## 16.3 Convex as GCAM codebook store

Convex will also store the GCAM codebook and related interpretive metadata.

### Purpose
The GCAM codebook is needed to translate raw GCAM dimensions (for example `c16.121`, `v19.2`) into:
- human-readable labels
- domain families
- source lexicon/dictionary origin
- metric type
- grouping logic for UI and analytics

### Why Convex
The GCAM codebook is relatively compact, reference-oriented, and frequently needed at application/query/render time. It is better suited to Convex than BigQuery because:
- it behaves like application metadata, not event-scale warehouse data
- it is useful for UI tooltips, chart labels, explanations, and analyst drilldowns
- it supports fast lookup when rendering dashboard pages and summaries

### Usage
The warehouse may store raw GCAM strings and parsed GCAM dimensions, but the semantic interpretation of those codes will be resolved using the Convex-held codebook.

This enables:
- UI decoding of GCAM metrics
- grouping GCAM dimensions into interpretable families
- frame-building logic using known codebook labels
- explanation layers in dashboards and reports
---

# 17. Serving architecture

## 17.1 Query flow

Preferred pattern:

```ascii
Dashboard request
   |
   v
Convex API / app function
   |
   +--> fetch cached snapshot if valid
   |
   +--> otherwise query precomputed BigQuery serving tables
   |
   +--> optionally assemble additional metadata from Convex
   |
   v
Return dashboard payload
```

## 17.2 Serving strategy

Do not hit raw BigQuery tables directly for every UI interaction.

Prefer:

* precomputed serving tables in BigQuery
* cached page payloads in Convex for common views
* daily/intraday materializations

## 17.3 GCAM codebook enrichment in serving flow

When dashboard views require interpreted GCAM dimensions, the serving layer should:
1. query parsed GCAM metrics from BigQuery
2. resolve GCAM code metadata from Convex
3. attach human-readable labels, dictionary families, and descriptions
4. return enriched payloads to the dashboard

This is especially important for:
- framing views
- GCAM-based metric tooltips
- entity and outlet semantic profile pages
- analyst explanations in reports and morning briefs
---

# 18. Automation / orchestration

## 18.1 Railway usage

Railway can be used for:

* scheduled poller for `masterfilelist.txt`
* ingestion workers
* normalization jobs
* daily metric rollups
* morning brief candidate generation
* alert generation jobs

## 18.2 Recommended Railway services

* `gdelt-masterfile-poller`
* `gdelt-download-worker`
* `gdelt-normalizer`
* `gdelt-rollup-worker`
* `gdelt-brief-generator`
* `gdelt-alert-worker`

## 18.3 Job cadence

### Near-real-time

* poll masterfile list every few minutes
* ingest new deltas

### Hourly

* refresh recent serving materializations
* recompute recent cluster updates

### Daily

* recompute daily outlet/entity metrics
* produce morning brief candidate set
* refresh bias panel aggregates
* refresh media DNA rolling metrics

### Weekly / Monthly

* refresh seasonality and historical comparative rollups
* refresh long-term local/national profiles

---

# 19. Historical backfill strategy

## 19.1 Goal

Backfill from 2015 to present without overloading the system or making rebuilds impossible.

## 19.2 Phased backfill

Recommended order:

1. ingest raw files by year-month
2. normalize per month
3. derive clusters and episodes per month
4. compute quarterly and yearly rollups

## 19.3 Backfill controls

Use a `backfill_tracker` table with:

* `range_start`
* `range_end`
* `feed_type`
* `status`
* `started_at`
* `completed_at`
* `row_count`
* `error_count`

## 19.4 Reprocessing policy

Allow:

* full month rebuild
* feed-specific rebuild
* cluster-only rebuild
* metrics-only rebuild

---

# 20. Source normalization strategy

## 20.1 Why critical

GDELT source domain strings will not be clean enough for high-quality outlet analysis.

## 20.2 Requirements

Build a curated Romanian outlet mapping layer:

* map domains to outlet identities
* classify local vs national
* classify media type
* attach region where possible
* handle mirrored domains and subdomains

## 20.3 Recommended process

* initial manual seed mapping
* automated candidate generation from raw domains
* human review for high-volume sources
* versioned mapping table

---

# 21. Data quality and confidence model

## 21.1 Confidence flags

All derived outputs should carry confidence metadata.

Examples:

* `cluster_confidence`
* `ghosting_confidence`
* `propagation_confidence`
* `divergence_confidence`

## 21.2 Sparse data warnings

Views should detect:

* low event participation
* weak peer coverage
* few sources
* cluster uncertainty

## 21.3 Known GDELT limitations to expose

* event coding may underfit article meaning
* count/location binding can drift
* syndicated content can inflate volume
* source diversity can be lower than article count suggests

---

# 22. API / service contract concepts

## 22.1 Dashboard endpoints (conceptual)

* `GET /overview`
* `GET /morning-brief`
* `GET /events`
* `GET /events/{id}`
* `GET /outlets`
* `GET /outlets/{id}`
* `GET /compare/outlets`
* `GET /entities`
* `GET /entities/{id}`
* `GET /propagation/{clusterId}`
* `GET /bias/{outletId}`
* `GET /seasonality`
* `GET /local-vs-national`

These do not need to be REST specifically, but the service layer must expose equivalent contracts.

## 22.2 Query contract principles

All responses should include:

* `filters_applied`
* `generated_at`
* `data_freshness`
* `confidence_notes`
* `evidence_refs` where relevant

---

# 23. Morning brief generation flow

## 23.1 Candidate generation

Built in BigQuery from:

* new/rising event clusters
* mention velocity
* divergence spikes
* ghosting candidates
* entity surges

## 23.2 Summary synthesis

Optionally use an LLM after candidate selection.

Inputs to LLM:

* ranked event summaries
* key metrics
* evidence snippets
* notable outlet differences

Output:

* short analyst-ready brief text

## 23.3 Storage

Store generated brief in Convex and optionally also in BigQuery serving table.

---

# 24. Security and access control

## 24.1 User data

User state is low-risk but must still be protected:

* auth
* watchlists
* saved views
* notes
* alerts

## 24.2 Warehouse access

BigQuery access should be restricted to backend services and admin roles.

## 24.3 App-level permissions

Roles:

* admin
* analyst
* viewer

---

# 25. Observability and operations

## 25.1 Required monitoring

* ingestion success/failure
* file lag vs masterfile
* row counts by feed/date
* job duration
* stale serving tables
* alert generation status
* dashboard cache freshness

## 25.2 Logging

Each job should log:

* job name
* run id
* date range
* file count
* row count
* status
* exception payload if failed

## 25.3 Alerting

Operational alerts for:

* poller stalled
* download failures
* schema mismatch
* BigQuery load failure
* no new files detected unexpectedly
* serving tables stale

---

# 26. Performance requirements

## 26.1 Warehouse

BigQuery queries for dashboard-serving tables should be pre-aggregated enough that:

* common dashboard views return quickly
* heavy raw scans are avoided in user-facing flow

## 26.2 Application

Common dashboard pages should aim to load from serving/cache layers, not raw derivation.

## 26.3 Historical queries

Long-range historical views may be slower but should still rely on rollups, not raw scans.

---

# 27. Cost strategy

## 27.1 BigQuery cost control

* partition all large tables
* cluster by common filters
* use derived rollups aggressively
* avoid scanning raw tables from UI
* materialize common daily/weekly aggregates

## 27.2 Railway cost control

Use Railway for lightweight orchestration and workers, not for large persistent data storage.

## 27.3 Convex cost control

Keep Convex focused on app state, cached payloads, and user objects, not full warehouse duplication.

---

# 28. Build phases

## Phase 1: foundation

* raw ingestion from masterfilelist
* BigQuery raw schema
* normalization layer
* outlet normalization seed
* overview-serving tables
* basic events/outlets/entities views

## Phase 2: core intelligence

* event clustering
* coverage episodes
* Speed Index
* Stability Index
* ghosting
* basic propagation
* morning brief

## Phase 3: comparison intelligence

* bias panel
* contradictions/divergence
* outlet comparison
* local vs national
* media DNA

## Phase 4: historical intelligence

* seasonality
* counterfactual coverage finder
* advanced rollups
* richer propagation and event trajectory views

---

# 29. Open technical questions

* How complete is GDELT Romanian source coverage from 2015 onward for the outlets you care about most?
* Do you want to ingest all GDELT globally, then filter Romanian outlets, or prefilter as early as possible?
* Will event clustering be global or Romania-focused?
* What exact peer-group logic will be used for ghosting and bias comparisons?
* How much manual curation will be available for outlet normalization and local/national classification?
* Do you want one rolling recent-cluster recomputation window, and if so how large?

---

# 30. Final system definition

This system is a **BigQuery-centered analytical warehouse and derivation pipeline**, fed by GDELT 2.0 from **2015 to today**, discovered through `masterfilelist.txt`, optionally orchestrated with **Railway**, and surfaced through an application stack using **Convex** for user state, saved views, caches, alerts, and dashboard interaction.

Its architecture is intentionally:

* GDELT-first
* warehouse-centric
* explainable
* event-driven
* comparison-heavy
* low-dependency on embeddings
* suitable for both historical and ongoing media intelligence

If you want, I’ll turn this next into a **concrete implementation blueprint** with:

* BigQuery schemas in SQL-style form
* Convex collection definitions
* job list with cadence
* and the exact pipeline DAG.
