---
name: ui-ux-specs
description: UI and UX specification for Media Echo Romania. Use when designing pages, charts, tables, dashboards, detail drawers, navigation, filters, or analyst workflows. Preserve the analyst-first dashboard style and the agreed data-serving model: recent views can refresh frequently, while long-range views from 2015 onward must use pre-aggregated series with visible freshness and granularity.
---

# UI / UX Specification

Media Echo Romania is an analyst-facing dashboard platform for Romanian media intelligence.

The product should feel like:

- Bloomberg Terminal meets OSINT dashboard
- focused on Romanian media behavior
- dense, credible, and highly explorable

# 0. Design principles

- Dense analyst UI, not consumer news UI
- Fast scan first, drilldown second
- Comparison-first layouts
- Timelines, matrices, tables, and network views over decorative storytelling
- Strong evidence cues everywhere
- Metric explainability is mandatory
- Color must never be the only meaning signal
- Historical exploration must remain fast even across multi-year windows

Every major page should help answer:

1. what matters
2. why it matters
3. who differs
4. what changed

# 1. Global shell

Core shell structure:

- top navigation for major product areas
- persistent filter bar
- optional left utility rail
- main content area
- right-side detail drawer
- visible system freshness/status row

Core nav areas:

- Overview
- Morning Brief
- Event Universe
- Events
- Outlets
- Entities
- Propagation
- Contradictions
- Bias Panel
- Seasonality
- Local vs National
- Explore
- Saved Views
- Alerts
- Admin

# 2. Global UX rules

- Filters persist across most pages.
- Clicking a chart element should usually open a right-side drawer instead of causing a full navigation jump.
- Tables must support sorting, compare mode, and CSV export.
- Every important metric should have a short definition and interpretation note.
- Analyst mode should allow denser layouts and more visible metadata.
- Empty and low-confidence states must be explicit and useful.

Every chart or widget should support:

- expand
- export
- compare
- pin or save
- explain metric

# 3. Data presentation rules

These rules are critical because the product mixes near-real-time and historical analytics.

## 3.1 Freshness

Every page or major widget should show freshness such as:

- `Updated 12 min ago`
- `Last ingest 08:15 UTC`
- `Historical aggregates refreshed daily`

## 3.2 Granularity

Every time-series view should show its active granularity such as:

- hourly
- daily
- weekly
- monthly
- quarterly

Example labels:

- `Granularity: daily`
- `Granularity: monthly`

## 3.3 Range-to-granularity behavior

The UI should automatically favor appropriate resolution:

- 24h to 7d: hourly or daily
- 7d to 90d: daily or weekly
- 90d to 2y: weekly or monthly
- 2015 to now: monthly or quarterly

The UI should not attempt to render massive raw point counts for multi-year ranges.

## 3.4 Confidence and limitation cues

Views should surface:

- sparse data warnings
- low confidence indicators
- source coverage caveats
- notes about derived heuristics

# 4. Visual language

## Layout rhythm

- 12-column grid
- 8 px micro spacing
- 16 px standard spacing
- 24 px section spacing

## Card hierarchy

- level 1: KPIs and major findings
- level 2: comparison charts and tables
- level 3: evidence, notes, and metadata

## Color logic

- green = stable, positive, confirming
- red = conflict, risk, contradiction, alarming
- yellow = caution, divergence, uncertainty
- blue = neutral, institutional, informational
- purple = framing or interpretive layer
- gray = inactive or baseline

## Typography

- clean sans-serif
- strong numeric treatment for KPIs
- readable metadata size
- tabular numerals for analytical values when possible

## Icon cues

- clock = speed
- shield = stability
- eye slash = ghosting
- branching arrows = propagation
- pulse = salience
- scales = bias panel
- network = event universe

# 5. Core page expectations

## Overview

Purpose:

- one-screen operational snapshot
- what happened
- who moved
- what diverged
- what was ignored

Should include:

- KPI row
- morning brief preview
- alerts preview
- coverage velocity
- top events
- fastest and most stable outlets
- ghosting preview
- bias preview
- entity movers
- propagation preview

## Morning Brief

Purpose:

- operational summary for the selected window

Should include:

- generated timestamp
- top developments
- what changed
- undercovered stories
- outlet behavior highlights
- entity movers

## Events and event detail

Should expose:

- event timeline
- outlet participation
- framing profile
- propagation path
- contradictions and divergence
- explainability notes

## Outlets and compare views

Should expose:

- speed
- stability
- ghosting
- breadth
- specialization
- tone signature
- selection asymmetry
- frame distinctiveness

## Entities

Should expose:

- mention trends
- tone trends
- associated events
- top outlets
- recurring themes

## Seasonality

Should emphasize:

- recurring patterns
- multi-year comparability
- monthly or quarterly granularity by default

# 6. Historical UX requirements

Historical analysis is a core feature, so the interface must make it understandable and performant.

Rules:

- Multi-year charts should default to monthly or quarterly series.
- The selected granularity must be visible.
- Users should be able to switch granularity when the data supports it.
- Historical views should feel responsive because they load aggregated series, not raw rows.
- If a chart spans from 2015 to today, render only the aggregated series points needed for clear interpretation.

Helpful UI patterns:

- time-range presets
- granularity toggle
- compare against prior period
- normalized versus absolute view

# 7. Tables and drilldowns

Tables should support:

- sorting
- filtering
- compare mode
- CSV export
- sticky headers where useful
- compact analyst density

Right-side detail drawers should show:

- quick summary
- evidence notes
- key metrics
- related items
- freshness and confidence

# 8. Accessibility and usability

- keyboard navigable filters and tables
- high contrast support
- color is never the sole signal
- readable labels on charts
- avoid hiding critical controls
- avoid ambiguous metric wording

Use analytical language such as:

- `higher conflict framing`
- `slower than peer median`
- `coverage gap detected`
- `entity tone shifted negative`

Avoid:

- `truth score`
- `fake news`
- `biased outlet`
- `objectively wrong`

# 9. Empty and low-data states

Always provide a useful fallback:

- explain why no data is shown
- suggest expanding date range or removing filters
- show low-confidence messaging when evidence is sparse

Examples:

- `No data for this selection. Try expanding the date range.`
- `Limited evidence. Interpret this comparison cautiously.`

# 10. Final UX summary

The product should feel:

- serious
- fast
- information-dense
- evidence-aware
- designed for repeat analytical use

The ideal journey is:

1. open Overview
2. scan KPIs, brief, and alerts
3. inspect a top event or outlet anomaly
4. compare outlet behavior
5. inspect propagation or ghosting
6. move into entity or historical views
7. export or save the result

The UI should make both recent and historical analysis feel natural:

- recent views refresh frequently
- long-range views use pre-aggregated historical series
- freshness and granularity are always visible
