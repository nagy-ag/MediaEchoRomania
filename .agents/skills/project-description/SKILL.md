---
name: project-description
description: The high-level product definition for Media Echo Romania. Use to understand the product vision, analytical goals, user needs, and the agreed data-serving philosophy. Follow it as a guide, ask for clarification when something is unclear, and ask for approval before proposing product-level changes.
---

# Product Requirements Document

## Product name

Media Echo Romania

## Status

Draft v2

## Product type

Analyst-facing media intelligence dashboard

## Product summary

Media Echo Romania is a GDELT-first intelligence platform for understanding Romanian media behavior across events, outlets, entities, timing, framing, tone, ghosting, propagation, and long-term patterns.

It is not a generic clipping tool. It is an event-centric and comparison-first system for analysts, researchers, newsroom strategists, and media observers.

The product should help users answer:

- what matters now
- who covered it
- who did not
- who moved first
- who stayed stable
- who framed it differently
- how an entity is treated over time
- what patterns repeat across months and years

# Purpose

Transform GDELT exports into usable Romanian media intelligence that is:

- explainable
- historically comparable
- fast to use
- affordable to serve
- accessible to many users

# Core product principles

- Event-centric, not article-centric
- Comparison-first, not headline-first
- Explainable metrics over black-box scores
- Bias panel, not a single bias score
- Ghosting is a first-class signal
- Propagation is a first-class signal
- Historical analysis matters, especially from 2015 onward
- Dashboard density is acceptable because users are analysts
- The website must be fast even when the underlying historical dataset is large

# Data philosophy

The product uses GDELT as the primary substrate, with these roles:

- `Mentions` for outlet participation and timing behavior
- `GKG` for themes, entities, tone, and narrative richness
- `Events` for event backbone and actor/action context

The system should filter early to the Romanian outlet universe using a curated outlet/domain mapping layer.

The product should not depend on users triggering heavy warehouse scans. Instead, it should precompute Romania-focused derived datasets and serve small prepared results.

# Architecture philosophy

The agreed serving model is:

- ingest GDELT exports on a schedule, typically every 15 minutes
- normalize and filter early to Romanian outlets
- keep historical and derived analytics in BigQuery
- use Convex for app state, alerts, notes, saved views, and lightweight serving/cache payloads
- serve user-facing pages from prepared rollups or cached payloads, not raw scans

Important:

- BigQuery is the historical and analytical backbone
- Convex is the application/state and lightweight cache layer
- Convex is not the full historical analytics store

# Users and primary needs

## Media analyst

Needs:

- outlet comparison
- propagation patterns
- ghosting and bias panels
- fast drilldown into events and entities

## Political or policy researcher

Needs:

- long-term entity trends
- theme and tone evolution
- local vs national comparisons
- seasonality and structural patterns

## Newsroom strategy lead

Needs:

- speed vs stability comparisons
- specialization patterns
- originality behavior heuristics
- peer benchmarking

## OSINT or intelligence analyst

Needs:

- event universe exploration
- contradictions and divergence
- propagation pathways
- entity-event-outlet linkage

## Academic or media studies researcher

Needs:

- reproducible historical analysis
- exportable metrics
- structured comparison workflows
- confidence and limitation notes

# Core product objects

- Outlet
- Event
- Coverage episode
- Entity
- Frame
- Propagation path

# Core features

- Overview dashboard
- Morning brief
- Event universe
- Events list and event detail
- Outlets list and outlet detail
- Compare outlets
- Entities and entity detail
- Propagation views
- Contradictions and divergence
- Bias panel
- Seasonality
- Local vs national analysis
- Explore
- Saved views
- Alerts

# Key metrics

- Speed Index
- Stability Index
- Ghosting rate
- Breadth
- Specialization
- Originality behavior
- Tone signature
- Frame distinctiveness
- Selection asymmetry

These metrics should always be explainable and presented with caveats where necessary.

# Functional requirements

The product must support:

- date filtering
- outlet filtering
- region filtering
- event, entity, and theme filtering
- drilldown from overview to detail
- outlet, event, and entity comparison
- export of charts and tabular outputs
- saved views and watchlists
- anomaly and behavior alerts

# UX requirements

- dashboard-first desktop experience
- dense but readable analyst UI
- visible metric explanations
- persistent filters
- right-side detail drawers where practical
- compact, sortable, exportable tables
- high information density
- accessible color and labeling choices

# Historical analysis requirements

Historical views from 2015 onward are core product features.

They should be powered by aggregated historical series, not raw row scans at request time.

Examples:

- monthly outlet coverage trends
- weekly entity tone shifts
- quarterly ghosting patterns
- long-range local vs national splits

# LLM requirements

Allowed:

- morning brief synthesis
- summary text
- "what changed" narratives
- report prose

Not allowed as the primary computation layer for:

- event clustering backbone
- speed and stability metrics
- ghosting detection
- propagation mapping
- bias computation
- seasonality logic

The platform must remain analytically useful without LLMs.

# Risks

Data risks:

- imperfect GDELT event coding
- duplicated and syndicated coverage
- uneven Romanian outlet coverage
- domain and outlet identity drift

Product risks:

- users overreading bias or originality metrics
- density overwhelming new users
- stale or sparse data being misinterpreted

Mitigations:

- always define metrics
- always show confidence or limitation notes
- use peer-relative comparisons
- show freshness and data coverage clearly

# Success criteria

Product success:

- active analysts and returning users
- repeated overview and morning brief usage
- saved views and watchlists created
- comparisons and exports run

Analytical success:

- useful event clustering
- trusted outlet comparisons
- trusted bias and ghosting outputs
- lower manual comparison effort

# Final definition

Media Echo Romania is a Romania-focused, GDELT-first intelligence platform that explains how Romanian media behaves across events, outlets, entities, and time.

Its differentiators are:

- event-centric modeling
- comparison-first workflows
- speed and stability analysis
- ghosting as a first-class signal
- propagation analysis
- local vs national intelligence
- historical analysis from 2015 onward
- fast and affordable serving through precomputed analytics rather than live heavy warehouse queries
