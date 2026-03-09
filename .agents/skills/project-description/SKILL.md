---
name: project-description
description: The high level project description, for the agent to understand the context of the project. Follow it as a guide, always ask for clarifications if something is not clear, and if you propose a change/improvement, always ask for approval.
---

## Product Requirements Document (PRD)

### Product name

Media Echo Romania

### Document status

Draft v1

### Product type

Analyst-facing dashboard platform

### Product summary

A GDELT-first intelligence platform for analyzing Romanian media behavior across events, outlets, entities, timing, framing, sentiment, ghosting, propagation, and long-term patterns.

The product is designed to help users understand not only what was covered, but how coverage emerged, spread, diverged, stabilized, or disappeared across Romanian media.

It is not a generic clipping tool. It is an event, coverage, and framing intelligence system.


---

# 1. Purpose

The purpose of this product is to provide a structured, explainable, dashboard-style system that allows users to:

* monitor what happened in the media ecosystem
* compare outlets over time and against peers
* analyze event coverage speed and stability
* inspect framing and bias dimensions
* detect ghosting and selective silence
* track entities over time
* understand how narratives propagate
* compare local and national media behavior
* identify recurring seasonal patterns in themes and tone

The product should transform raw GDELT data into usable intelligence for analysts, researchers, strategists, and media observers.

---

# 2. Problem statement

Current media monitoring solutions usually fail in one or more of the following ways:

* they overcount duplicated coverage as independent reporting
* they do not distinguish event occurrence from narrative amplification
* they do not show outlet behavior in a structured way
* they reduce bias to vague or oversimplified labels
* they do not expose ghosting or counterfactual silence
* they provide little insight into propagation and ecosystem dynamics
* they do not offer strong cross-outlet comparison
* they are too article-centric and not event-centric

Romanian media analysis in particular needs a system that can compare:

* local vs national
* generalist vs niche
* early vs stable
* selective vs broad
* emotional vs institutional
* amplifying vs distinctive outlets

This product solves that need using GDELT as the primary data substrate.

---

# 3. Vision

Build the operating system for Romanian media intelligence.

The platform should become the place where a user can answer:

* what matters right now
* who is covering it
* who is not
* who moved first
* who stayed stable
* who framed differently
* how an entity is treated across outlets and time
* which story is real versus mostly amplified
* what recurring patterns exist in the ecosystem

---

# 4. Goals

## Primary goals

* Build a GDELT-first intelligence platform for Romanian media analysis
* Provide dashboard-style exploratory and comparative workflows
* Make outlet behavior measurable through explainable metrics
* Support event-level, outlet-level, and entity-level analysis
* Treat bias as a panel of dimensions, not a single score
* Support daily analyst workflows through a morning brief and overview dashboard

## Secondary goals

* Support long-term historical analysis
* Support newsroom, research, and intelligence use cases
* Provide exportable views and reports
* Enable fast drilldown from ecosystem level to specific event or outlet

---

# 5. Non-goals

The product will not:

* act as a full article archive or clipping warehouse
* attempt to determine objective truth of all media claims
* provide a single “truth score”
* provide a single “bias score”
* prove journalistic originality in a legal or authorship sense
* depend on embeddings as core infrastructure
* focus on mobile-first consumer UX

---

# 6. Users and personas

## Persona 1: Media analyst

Needs:

* outlet comparison
* propagation patterns
* ghosting and bias panel
* event and framing analysis

## Persona 2: Political / policy researcher

Needs:

* entity comparisons
* long-term sentiment and theme evolution
* local vs national differences
* seasonality

## Persona 3: Newsroom strategy lead

Needs:

* speed vs stability comparison
* topic specialization analysis
* originality behavior
* peer benchmarking

## Persona 4: OSINT / intelligence analyst

Needs:

* event universe
* contradictions and divergence
* propagation map
* entity-event-outlet linkage

## Persona 5: Academic / media studies researcher

Needs:

* historical querying
* exportable metrics
* structured bias dimensions
* reproducible comparisons

---

# 7. Data sources

## Primary data source

GDELT

### Tables used

* Events
* Mentions
* GKG

## Roles of each table

### Events

Used as:

* rough event backbone
* actor/action/geo anchor
* event universe spine

### Mentions

Used as:

* outlet participation signal
* timing signal
* first mention / lag / wave behavior
* amplification and coverage dynamics

### GKG

Used as:

* themes
* entities
* tone
* counts
* locations
* framing inference
* event narrative layer

## Data philosophy

The product assumes:

* event coding is useful but imperfect
* mention behavior is highly valuable
* GKG carries most narrative richness

---

# 8. Product principles

* Event-centric, not article-centric
* Comparison-first, not headline-first
* Explainable metrics over black-box scores
* Bias panel, not bias label
* Speed and stability over vague factualism
* Narrative propagation is a core signal
* Ghosting is meaningful behavior
* Duplication and amplification must be separated from independent behavior
* Dashboard density is acceptable because users are analysts

---

# 9. Core product objects

## Outlet

A source/publisher tracked over time.

## Event

A rough real-world development or event cluster.

## Coverage episode

An outlet’s participation in an event.

## Entity

A person, organization, location, or important named actor.

## Frame

A narrative lens applied to an event.

## Propagation path

The observed spread pattern of a story through outlets over time.

---

# 10. Core features

## 10.1 Overview dashboard

A one-screen ecosystem snapshot.

Purpose:

* show what matters now
* surface anomalies
* expose top events and outlet behavior
* preview ghosting, propagation, and divergence

Key outputs:

* top KPIs
* coverage velocity
* top event clusters
* fastest and most stable outlets
* morning brief preview
* ghosting preview
* bias panel preview
* entity movers

---

## 10.2 Morning brief

A daily or rolling summary of the most important developments in the selected time window.

Purpose:

* give an analyst a quick operational picture

Inputs:

* new or rising event clusters
* mention spikes
* divergence
* ghosting
* theme and entity surges

Outputs:

* top developments
* undercovered stories
* notable outlet behavior changes
* event context summary

LLM use:

* allowed only for final narrative synthesis

---

## 10.3 Event universe

An interactive map of events, entities, themes, and outlets.

Purpose:

* support ecosystem exploration
* show how events relate to larger contexts

Outputs:

* event graph
* event-to-entity relations
* event-to-theme relations
* event-to-outlet relations
* adjacent event clusters

---

## 10.4 Events

A structured event list and event drilldown module.

Purpose:

* provide canonical event-level analysis

Outputs:

* event timeline
* event metrics
* coverage by outlet
* framing profile
* contradictions and divergence
* propagation path

---

## 10.5 Outlets

Outlet-level detail and comparison.

Purpose:

* analyze outlet behavior over time

Outputs:

* Speed Index
* Stability Index
* ghosting rate
* breadth vs specialization
* tone signature
* originality behavior
* framing profile
* media DNA profile

---

## 10.6 Outlet comparison

Side-by-side comparison of outlets.

Purpose:

* compare selected outlets on comparable dimensions

Outputs:

* shared and unique event participation
* timing differences
* frame differences
* bias panel differences
* tone differences
* ghosting differences

---

## 10.7 Bias panel

A multidimensional bias analysis module.

Purpose:

* avoid oversimplified bias scoring
* expose measurable asymmetries

Dimensions:

* selection bias
* ghosting bias
* framing bias
* tone bias
* entity bias
* attribution bias

Output:

* panel of dimensions with peer context and time context

---

## 10.8 Narrative propagation map

A map of how a story spreads through the media ecosystem.

Purpose:

* show first movers, amplifiers, late adopters, and silent outlets

Outputs:

* propagation path
* wave structure
* lag spread
* amplification intensity
* framing spread

---

## 10.9 Contradictions and divergence detector

Detects disagreement or split narratives inside an event cluster.

Purpose:

* identify unstable or divergent coverage

Detects:

* counts mismatch
* location mismatch
* actor mismatch
* tone divergence
* frame divergence

---

## 10.10 Entities

Entity tracking and comparison over time.

Purpose:

* understand how people, orgs, and places are treated

Outputs:

* mention trends
* tone trends
* outlet differences
* co-entity network
* theme association
* event association
* seasonality

---

## 10.11 Local vs national module

Compares local and national outlet behavior.

Purpose:

* expose asymmetries in event emergence and amplification

Outputs:

* local-first vs national-first events
* local stories amplified nationally
* national stories absent locally
* topic specialization split
* regional propagation paths

---

## 10.12 Theme seasonality engine

Tracks recurring annual, monthly, weekly, and daily patterns.

Purpose:

* identify long-term behavioral and thematic rhythms

Outputs:

* theme recurrence
* sentiment seasonality
* holiday patterns
* day-of-week patterns
* recurring annual event types

---

## 10.13 Counterfactual coverage finder

A smarter ghosting engine.

Purpose:

* ask whether an outlet’s silence is unusual relative to its own historical behavior and peers

Outputs:

* expected-to-cover but absent events
* comparable outlets that did cover
* historical analog comparisons

---

## 10.14 Explore / 5D view

A multi-dimensional exploratory workspace.

Purpose:

* allow flexible exploration of multiple dimensions using filters, size, color, timeline, and comparison space

Outputs:

* event, outlet, or entity scatter/exploration view
* dynamic dimensional switching

---

# 11. Key metrics

## 11.1 Speed Index

Definition:
A measure of how quickly an outlet joins event coverage relative to the event’s appearance in the ecosystem.

Inputs:

* first mention timing
* peer timing
* topic/category context

Interpretation:
Higher values indicate more frequent early participation.

---

## 11.2 Stability Index

Definition:
A measure of how stable an outlet’s early event coverage remains relative to later event consensus and its own later coverage.

Inputs:

* divergence over time
* contradictions
* early-to-late consistency
* frame volatility
* count/location drift

Interpretation:
Higher values indicate more stable early coverage.

---

## 11.3 Ghosting rate

Definition:
The rate at which an outlet fails to cover events that comparable outlets covered and that the outlet would reasonably be expected to cover.

Interpretation:
Higher values indicate more selective silence.

---

## 11.4 Breadth

Definition:
How wide an outlet’s event/theme footprint is across the ecosystem.

Interpretation:
Higher breadth indicates generalist behavior.

---

## 11.5 Specialization

Definition:
How strongly an outlet concentrates on particular event types, regions, or themes.

Interpretation:
Higher specialization indicates niche concentration.

---

## 11.6 Originality behavior

Definition:
An estimate of whether an outlet tends to lead, follow, amplify, or contribute distinctive framing in event coverage.

Important:
This is not a legal measure of original reporting.

Suggested subcomponents:

* lead tendency
* follow tendency
* frame distinctiveness
* participation dependence

---

## 11.7 Tone signature

Definition:
The outlet’s long-term tone profile across events, topics, and entities.

---

## 11.8 Frame distinctiveness

Definition:
How differently an outlet frames events relative to peers.

---

## 11.9 Selection asymmetry

Definition:
The extent to which an outlet systematically overcovers or undercovers certain event types relative to peers and its own expected profile.

---

# 12. Functional requirements

## 12.1 Filtering

The product must support filtering by:

* date range
* outlet
* outlet type
* local vs national
* region
* event
* entity
* theme
* tone
* frame
* speed
* stability
* ghosting

## 12.2 Search

The product must support search for:

* outlets
* events
* entities
* themes
* saved views

## 12.3 Drilldown

The product must support drilldown from:

* ecosystem overview
* to event
* to outlet
* to entity
* to propagation
* to contradictions

## 12.4 Comparison

The product must support comparing:

* outlets
* events
* entities
* local vs national groups
* peer groups

## 12.5 Export

The product must support export of:

* charts
* CSV tables
* morning brief
* event report
* outlet comparison report
* dashboard snapshot

## 12.6 Saved views

The product must support:

* saved filters
* saved dashboards
* watchlists
* team-shared views

## 12.7 Alerts

The product must support alerts on:

* event spike
* divergence spike
* ghosting anomaly
* entity surge
* propagation anomaly
* outlet behavior change

---

# 13. UX requirements

* Dashboard-first desktop experience
* Dense but readable analyst interface
* Persistent filters
* Right-side detail drawer for fast drilldown
* Customizable overview
* Tooltips and metric definitions everywhere
* Explainability notes for all major indices
* Compact tables with sorting and export
* Dark mode recommended
* High information density acceptable
* Mobile is not primary

---

# 14. Information architecture

* Overview
* Morning Brief
* Event Universe
* Events
* Outlets
* Compare Outlets
* Entities
* Propagation
* Contradictions & Divergence
* Bias Panel
* Seasonality
* Local vs National
* Explore
* Saved Views
* Alerts
* Admin

---

# 15. LLM requirements

## Allowed LLM use

* morning brief synthesis
* event summary text
* “what changed” summaries
* chart insight text
* analyst-ready report narratives

## Not allowed as primary computational backbone

* event clustering backbone
* Speed Index calculation
* Stability Index calculation
* ghosting detection
* propagation mapping
* bias panel computation
* originality behavior logic
* seasonality logic

The product must work without LLMs as a computational dependency.

---

# 16. Embeddings requirements

The core platform must not depend on embeddings.

Embeddings are optional and out of scope for MVP unless later justified.

The product should rely primarily on:

* GDELT event IDs
* mention timestamps
* GKG entities/themes/tone/counts
* derived metrics

---

# 17. Success metrics

## Product success metrics

* number of active analysts/users
* daily/weekly dashboard sessions
* morning brief generation usage
* saved views/watchlists created
* outlet comparisons run
* event drilldowns opened
* exports generated

## Analytical success metrics

* percentage of top stories represented by clean event clusters
* usefulness rating of morning brief
* usefulness rating of outlet comparison
* usefulness rating of bias panel
* analyst confidence in Speed and Stability metrics
* reduction in manual comparison effort

---

# 18. Risks

## Data risks

* weak event coding in GDELT
* source duplication and syndication distortion
* imperfect count/location binding
* uneven source coverage in Romania
* changes in outlet URLs or source identifiers

## Product risks

* users may overinterpret bias or originality metrics
* users may confuse speed with quality
* too much dashboard density may overwhelm new users
* seasonality outputs may be misread without context

## Mitigations

* always provide definitions and context
* always show peer-relative views
* use warnings for sparse data
* avoid single-number oversimplification
* clearly state metric limitations

---

# 19. Assumptions

* GDELT has sufficient Romanian source coverage to support comparative analysis
* users value event-centric monitoring over article-centric clipping
* users want explainable heuristics more than black-box scoring
* duplication/amplification detection materially improves insight quality
* local vs national comparison is strategically valuable

---

# 20. Dependencies

* GDELT ingestion pipeline
* normalized source mapping for Romanian outlets
* event, mention, and GKG storage pipeline
* metric computation layer
* dashboard front end
* export/reporting layer
* optional LLM integration for summaries

---

# 21. Roadmap

## Phase 1: Foundations

* GDELT ingestion
* outlet normalization
* overview dashboard
* morning brief
* event list
* outlet list
* Speed Index
* Stability Index
* basic entity tracking
* basic ghosting

## Phase 2: Comparison intelligence

* event universe
* outlet comparison
* bias panel
* propagation map
* contradictions/divergence
* media DNA
* local vs national

## Phase 3: Historical and advanced analysis

* seasonality engine
* counterfactual coverage finder
* advanced saved views and alerts
* richer event trajectory comparison
* improved originality behavior analytics

---

# 22. Open questions

* Which Romanian outlets are in the initial tracked set?
* What is the minimum acceptable source coverage threshold?
* How will peer groups be defined:

  * all outlets
  * type-based
  * local-only
  * national-only
  * manually curated?
* What time window should define ghosting for different event types?
* How should “expected to cover” be modeled for local outlets?
* How much user-facing explanation is needed for bias panel outputs?
* Which default dashboard presets should ship first?

---

# 23. Final product definition

Romanian Media Intelligence & Comparison Platform is a GDELT-first, dashboard-style analytical system that maps events, compares outlets, tracks framing and tone, reveals ghosting and propagation patterns, and helps analysts understand how Romanian media behavior evolves across time, entities, and narratives.

Its core differentiators are:

* event-centric design
* comparison-first workflows
* speed and stability metrics
* bias as a panel, not a score
* ghosting as a first-class signal
* propagation analysis
* media DNA profiling
* local vs national intelligence
* minimal dependency on black-box methods

If you want, the next step is a **technical PRD / system spec** with data model, metric formulas, pipeline stages, and API contracts.
