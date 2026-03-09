---
name: ui-ux-specs
description: UI/UX specification for the Media Echo platform
---

================================================================================
UI/UX SPECIFICATION
ROMANIAN MEDIA INTELLIGENCE & COMPARISON PLATFORM
Dashboard-Style Product
================================================================================


0. DESIGN PRINCIPLES
--------------------------------------------------------------------------------
- Dense, analyst-first dashboard, not consumer news UI
- Fast scan first, drill-down second
- Every major page answers:
    1) what matters
    2) why it matters
    3) who differs
    4) what changed
- Default layout favors comparison, timelines, and anomaly spotting
- Avoid decorative clutter; prioritize:
    - tables
    - timelines
    - matrices
    - network views
    - compact cards
- Every view should support:
    - time filtering
    - outlet filtering
    - topic/event filtering
    - local vs national switching
- Bias is always shown as a panel, never one giant score
- Speed and Stability are first-class metrics in many views


1. GLOBAL APP SHELL
--------------------------------------------------------------------------------

+------------------------------------------------------------------------------+
| LOGO | Search events/entities/outlets...              [Saved Views] [Profile]|
+------------------------------------------------------------------------------+
| [Overview] [Morning Brief] [Event Universe] [Outlets] [Entities] [Events]   |
| [Propagation] [Bias Panel] [Seasonality] [Local vs National] [Admin]        |
+------------------------------------------------------------------------------+
| Filters: [Date Range v] [Outlet Type v] [Region v] [Topic v] [Entity v]     |
|          [Sentiment v] [Frame v] [Ghosting v] [Speed v] [Reset] [Save View] |
+------------------------------------------------------------------------------+
| Breadcrumbs: Home / Overview / Today                                          |
+------------------------------------------------------------------------------+
| LEFT SIDEBAR (optional collapsible) | MAIN CONTENT AREA                       |
|-------------------------------------+----------------------------------------|
| - My Watchlists                     |                                        |
| - Key Events                        |                                        |
| - Tracked Entities                  |                                        |
| - Favorite Outlets                  |                                        |
| - Alerts                            |                                        |
| - Notes                             |                                        |
+------------------------------------------------------------------------------+
| STATUS BAR: data freshness | last ingest | active sources | warnings         |
+------------------------------------------------------------------------------+


2. GLOBAL UX RULES
--------------------------------------------------------------------------------
- Top nav = product areas
- Filter bar persists across most pages
- Every chart/widget has:
    - expand
    - export
    - compare
    - pin to dashboard
    - explain metric
- Hover everywhere should reveal metadata/tooltips
- Clicking any chart element should open a right-side detail drawer
- Right-side drawer pattern is used instead of full-page jumps where possible
- Tables should support:
    - sort
    - multi-select
    - compare mode
    - export CSV
- All key metrics should have:
    [ ? ] info icon -> short definition + formula note + interpretation note
- All pages must support "Analyst Mode":
    - denser tables
    - smaller cards
    - more visible metadata
- Dark mode strongly recommended as default option


3. VISUAL DESIGN LANGUAGE
--------------------------------------------------------------------------------

3.1 Layout rhythm
- Use 12-column grid
- Standard gaps:
    - 8 px micro
    - 16 px normal
    - 24 px section
- Cards align vertically and horizontally
- Keep one dominant page objective only

3.2 Card hierarchy
- Level 1 cards: headline KPIs / top findings
- Level 2 cards: comparison modules / charts
- Level 3 cards: supporting evidence / notes / metadata

3.3 Color logic
- Neutral background
- Colors used semantically, not decoratively:
    - green   = stable / positive / confirming
    - red     = negative / alarming / conflict / contradiction
    - yellow  = caution / uncertainty / divergence
    - blue    = institutional / neutral / info
    - purple  = bias / framing / interpretation
    - gray    = inactive / filtered out / baseline
- Do not overload colors with too many meanings at once

3.4 Typography
- Primary: clean sans-serif
- Sizes:
    - 24-32 page titles
    - 18-22 section titles
    - 14-16 body
    - 12 metadata
- Numbers/KPIs should use tabular numerals if possible

3.5 Iconography
- Use restrained icons:
    - clock = speed
    - shield = stability
    - eye slash = ghosting
    - branching arrows = propagation
    - pulse = salience
    - scales = bias panel
    - network = event universe
    - user/building/map-pin = entities
    - layers = frames


4. HOME / OVERVIEW DASHBOARD
--------------------------------------------------------------------------------
Purpose:
- one-screen operational overview of the media ecosystem
- what happened, who moved, what diverged, what was ignored

ASCII WIREFRAME:

+------------------------------------------------------------------------------+
| PAGE TITLE: Overview                                                         |
| Subtitle: Romanian media ecosystem snapshot for selected period              |
+------------------------------------------------------------------------------+
| KPI1: New Events | KPI2: Mention Volume | KPI3: Active Outlets              |
| KPI4: Avg Speed  | KPI5: Avg Stability  | KPI6: Ghosted Major Events        |
+------------------------------------------------------------------------------+
| [Morning Brief Preview]                              | [Top Alerts]          |
| - 1 sentence summary                                | - Divergence spike     |
| - 3 major developments                              | - Outlet ghosting      |
| - 2 unusual framing patterns                        | - Sentiment anomaly    |
+-----------------------------------------------------+------------------------+
| [Coverage Velocity Timeline]                                                |
|  time ------------------------------------------------------------------->  |
|  spikes by event family, outlet type, national/local split                  |
+------------------------------------------------------------------------------+
| [Top Event Clusters Today]                  | [Fastest Moving Outlets]      |
| 1. Event A                                  | Outlet A  speed=92            |
| 2. Event B                                  | Outlet B  speed=87            |
| 3. Event C                                  | Outlet C  speed=82            |
+---------------------------------------------+-------------------------------+
| [Ghosting Heatmap Preview]                  | [Bias Panel Preview]          |
| outlets x major events                      | selection / framing / tone    |
+---------------------------------------------+-------------------------------+
| [Sentiment + Framing Today]                                                  |
| stack/river chart                                                            |
+------------------------------------------------------------------------------+
| [Recent Entity Surges]                         | [Narrative Propagation Map] |
+-----------------------------------------------+------------------------------+

UX notes:
- This page is customizable
- Users can pin widgets and save layouts
- Overview should support presets:
    - Today
    - Last 24h
    - Last 7d
    - Election mode
    - Crisis mode


5. MORNING BRIEF PAGE
--------------------------------------------------------------------------------
Purpose:
- analyst-ready summary of the last hours

+------------------------------------------------------------------------------+
| PAGE TITLE: Morning Brief                                                    |
| [Generate Brief] [Regenerate] [Export PDF] [Share]                           |
+------------------------------------------------------------------------------+
| [Summary Header]                                                             |
| "In the last 12 hours, 4 major event clusters dominated Romanian coverage..."|
+------------------------------------------------------------------------------+
| [Top Developments]                                                           |
| 1. Event title      | salience | speed | spread | divergence | ghosting      |
| 2. Event title      | ...                                                  |
+------------------------------------------------------------------------------+
| [What Changed Since Previous Brief]                                          |
| - new event entered top 5                                                    |
| - one outlet shifted framing                                                 |
| - one entity surged                                                          |
+------------------------------------------------------------------------------+
| [Undercovered / Ghosted Stories]                                             |
+------------------------------------------------------------------------------+
| [Outlet Behavior Highlights]                                                 |
| - fastest outlets                                                            |
| - most stable outlets                                                        |
| - unusual laggards                                                           |
+------------------------------------------------------------------------------+
| [Entity & Theme Movers]                                                      |
+------------------------------------------------------------------------------+

UX notes:
- Brief can be collapsed into bullet mode or expanded narrative mode
- Each bullet links to full event/outlet/entity pages
- Side panel shows evidence:
    - source counts
    - first mentions
    - top themes
    - top entities


6. EVENT UNIVERSE PAGE
--------------------------------------------------------------------------------
Purpose:
- explore the graph of events, entities, outlets, and themes

+------------------------------------------------------------------------------+
| PAGE TITLE: Event Universe                                                   |
| Controls: [Graph] [Matrix] [Timeline] [Map] [Split View]                    |
+------------------------------------------------------------------------------+
| Filters: [Actor] [Geo] [Theme] [Outlet] [Salience] [Time] [National/Local]  |
+------------------------------------------------------------------------------+
| [LEFT CONTROL PANEL]             | [MAIN GRAPH SPACE]                        |
|----------------------------------+------------------------------------------|
| - node type toggles              |             o Event A                    |
| - edge type toggles              |           / | \                          |
| - cluster granularity            |       Outlet  Theme                      |
| - label density                  |        \      |                          |
| - color by                       |         \   Entity                       |
| - size by                        |          \   |                           |
| - layout mode                    |           o Event B                      |
+----------------------------------+------------------------------------------+
| [BOTTOM DETAIL STRIP]                                                       |
| selected node: type / mentions / themes / tone / outlets / connected items  |
+------------------------------------------------------------------------------+

UX notes:
- Default graph should not show everything at once
- Start with clustered groups, then expand on click
- Alternate views:
    - event-to-entity matrix
    - event timeline
    - geo map
- Right-side drawer for selected item:
    - summary
    - metrics
    - linked events
    - linked outlets
    - frame profile


7. EVENTS PAGE
--------------------------------------------------------------------------------
Purpose:
- canonical event list and event drilldown

7.1 Event list view

+------------------------------------------------------------------------------+
| PAGE TITLE: Events                                                           |
+------------------------------------------------------------------------------+
| Search/Filters                                                               |
+------------------------------------------------------------------------------+
| TABLE:                                                                       |
| Event | First Seen | Mentions | Active Outlets | Speed Spread | Stability   |
| Main Entities | Main Themes | Avg Tone | Ghosted by | Status                 |
+------------------------------------------------------------------------------+

7.2 Event detail view

+------------------------------------------------------------------------------+
| EVENT TITLE                                                                  |
| summary | first seen | last active | salience | confidence | geo            |
+------------------------------------------------------------------------------+
| KPI: mention volume | outlet count | speed spread | divergence | ghosting    |
+------------------------------------------------------------------------------+
| [Event Timeline]                        | [Frame Profile]                    |
+-----------------------------------------+------------------------------------+
| [Coverage by Outlet]                    | [Entity Cluster]                   |
+-----------------------------------------+------------------------------------+
| [Contradictions / Divergences]          | [Propagation Path]                 |
+-----------------------------------------+------------------------------------+
| [Underlying Mentions Table]                                                  |
+------------------------------------------------------------------------------+

UX notes:
- Event page is one of the main intelligence pages
- "Compare Event" action should allow comparing 2-4 event trajectories
- Event status chips:
    [new] [developing] [stabilizing] [fragmented] [reactivated]


8. OUTLETS PAGE
--------------------------------------------------------------------------------
Purpose:
- compare media sources over time and against peers

8.1 Outlet list page

+------------------------------------------------------------------------------+
| PAGE TITLE: Outlets                                                          |
+------------------------------------------------------------------------------+
| TABLE:                                                                       |
| Outlet | Type | Local/National | Speed | Stability | Ghosting | Breadth     |
| Frame Distinctiveness | Tone Avg | Originality Behavior | Last Active        |
+------------------------------------------------------------------------------+

8.2 Outlet detail page

+------------------------------------------------------------------------------+
| OUTLET NAME                                                                  |
| type | local/national | active since | tracked topics | watchlist toggle     |
+------------------------------------------------------------------------------+
| KPI ROW:                                                                     |
| Speed Index | Stability Index | Ghosting Rate | Breadth | Specialization     |
| Tone Signature | Originality Behavior | Frame Distinctiveness                |
+------------------------------------------------------------------------------+
| [Coverage Over Time]                    | [Topic Distribution]               |
+-----------------------------------------+------------------------------------+
| [Bias Panel]                            | [Media DNA Summary]                |
+-----------------------------------------+------------------------------------+
| [Event Participation]                   | [Ghosted Events]                   |
+-----------------------------------------+------------------------------------+
| [Framing Compared to Peers]             | [Entity Tone Distribution]         |
+-----------------------------------------+------------------------------------+
| [Seasonality Patterns]                                                       |
+------------------------------------------------------------------------------+

UX notes:
- Outlet page should support peer comparison:
    [Compare with selected outlets]
- "Media DNA Summary" is a concise card:
    - fast/slow
    - stable/volatile
    - broad/specialized
    - moralized/institutional
    - ghosting tendency
    - national/local weight


9. OUTLET COMPARISON PAGE
--------------------------------------------------------------------------------
Purpose:
- side-by-side comparison of 2-6 outlets

+------------------------------------------------------------------------------+
| PAGE TITLE: Compare Outlets                                                  |
| Compare: [Outlet A] [Outlet B] [Outlet C] [ + Add Outlet ]                  |
+------------------------------------------------------------------------------+
| [Metric Matrix]                                                              |
| Metric              | A    | B    | C    | Peer Avg | Notes                 |
| Speed Index         |      |      |      |          |                       |
| Stability Index     |      |      |      |          |                       |
| Ghosting Rate       |      |      |      |          |                       |
| Breadth             |      |      |      |          |                       |
| Tone Avg            |      |      |      |          |                       |
| Conflict Frame      |      |      |      |          |                       |
| Institutional Frame |      |      |      |          |                       |
| Moralization        |      |      |      |          |                       |
+------------------------------------------------------------------------------+
| [Coverage Timing Comparison]                                                 |
+------------------------------------------------------------------------------+
| [Topical Footprint Comparison]                                               |
+------------------------------------------------------------------------------+
| [Shared vs Unique Events]                                                    |
+------------------------------------------------------------------------------+
| [Ghosting Comparison]                                                        |
+------------------------------------------------------------------------------+
| [Narrative Differences for Selected Event]                                   |
+------------------------------------------------------------------------------+


10. BIAS PANEL PAGE
--------------------------------------------------------------------------------
Purpose:
- show decomposed bias indicators

+------------------------------------------------------------------------------+
| PAGE TITLE: Bias Panel                                                       |
| [Outlet selector] [Peer group selector] [Time range]                         |
+------------------------------------------------------------------------------+
| Bias dimensions:                                                             |
| [Selection] [Ghosting] [Framing] [Tone] [Entity] [Attribution]              |
+------------------------------------------------------------------------------+
| [Bias Summary Grid]                                                          |
| Dimension   | Outlet Score/Level | Peer Delta | Trend | Interpretation       |
+------------------------------------------------------------------------------+
| [Selection Bias View]                                                        |
| covered vs not covered vs expected to cover                                  |
+------------------------------------------------------------------------------+
| [Ghosting View]                                                              |
| major events skipped                                                          |
+------------------------------------------------------------------------------+
| [Framing Bias View]                                                          |
| same event framed differently from peers                                     |
+------------------------------------------------------------------------------+
| [Entity Bias View]                                                           |
| tone/frame by person/org/location                                            |
+------------------------------------------------------------------------------+
| [Attribution Style View]                                                     |
+------------------------------------------------------------------------------+

UX notes:
- Never label an outlet globally "biased"
- Use neutral language:
    - "higher selection asymmetry"
    - "stronger negative entity skew"
    - "more conflict-oriented framing"
- Always provide peer and time context


11. PROPAGATION PAGE
--------------------------------------------------------------------------------
Purpose:
- show how narratives spread

+------------------------------------------------------------------------------+
| PAGE TITLE: Narrative Propagation                                            |
+------------------------------------------------------------------------------+
| [Story/Event selector] [Time window] [Outlets] [Source family]              |
+------------------------------------------------------------------------------+
| [Main propagation map]                                                       |
| time -->                                                                     |
| Source A --> Outlets B,C --> Outlets D,E,F --> late adopters               |
+------------------------------------------------------------------------------+
| [Propagation metrics]                                                        |
| first mover | wave count | lag spread | amplification intensity | silent set |
+------------------------------------------------------------------------------+
| [Timeline table]                                                             |
| Timestamp | Outlet | Mention Type | Wave | Lag | Notes                      |
+------------------------------------------------------------------------------+
| [Framing spread]                                                             |
| which frame variants spread, and where                                       |
+------------------------------------------------------------------------------+

UX notes:
- Should support both:
    - tree view
    - timeline wave view
- "Silent set" is the group of expected outlets not covering the story


12. CONTRADICTIONS & DIVERGENCE PAGE
--------------------------------------------------------------------------------
Purpose:
- detect event-level inconsistencies and framing splits

+------------------------------------------------------------------------------+
| PAGE TITLE: Contradictions & Divergence                                      |
+------------------------------------------------------------------------------+
| [Event selector] [Outlet filters] [Severity threshold]                       |
+------------------------------------------------------------------------------+
| [Divergence summary]                                                         |
| counts mismatch | location mismatch | actor mismatch | tone split | frame split|
+------------------------------------------------------------------------------+
| [Claims / Counts Comparison Table]                                           |
| Field      | Outlet A | Outlet B | Outlet C | Consensus | Divergence Flag   |
+------------------------------------------------------------------------------+
| [Tone Divergence Chart]                                                      |
+------------------------------------------------------------------------------+
| [Frame Divergence Chart]                                                     |
+------------------------------------------------------------------------------+
| [Evidence Drawer Trigger]                                                    |
+------------------------------------------------------------------------------+

UX notes:
- Use highlighting:
    - red for contradictions
    - yellow for uncertainty
    - blue for frame difference without factual contradiction


13. ENTITIES PAGE
--------------------------------------------------------------------------------
Purpose:
- compare people, organizations, and locations over time

13.1 Entity list

+------------------------------------------------------------------------------+
| PAGE TITLE: Entities                                                         |
+------------------------------------------------------------------------------+
| TABLE:                                                                       |
| Entity | Type | Mentions | Avg Tone | Active Outlets | Top Themes | Trend    |
+------------------------------------------------------------------------------+

13.2 Entity detail

+------------------------------------------------------------------------------+
| ENTITY NAME                                                                  |
| type | first seen | current salience | linked events                         |
+------------------------------------------------------------------------------+
| KPI: mention volume | outlet spread | avg tone | event count                 |
+------------------------------------------------------------------------------+
| [Mentions Over Time]                    | [Tone by Outlet]                   |
+-----------------------------------------+------------------------------------+
| [Theme Association]                     | [Co-Entity Network]                |
+-----------------------------------------+------------------------------------+
| [Event List]                            | [Ghosting by Outlet]               |
+-----------------------------------------+------------------------------------+
| [Seasonality for Entity]                                                     |
+------------------------------------------------------------------------------+


14. LOCAL VS NATIONAL PAGE
--------------------------------------------------------------------------------
Purpose:
- compare local and national media behavior

+------------------------------------------------------------------------------+
| PAGE TITLE: Local vs National                                                |
+------------------------------------------------------------------------------+
| [Region selector] [Topic selector] [Time range]                              |
+------------------------------------------------------------------------------+
| KPI: local-first events | national-first events | local ghosted nationally   |
+------------------------------------------------------------------------------+
| [Coverage Timing Comparison]                                                 |
+------------------------------------------------------------------------------+
| [Shared vs Non-Shared Event Matrix]                                          |
+------------------------------------------------------------------------------+
| [Topic Specialization Split]                                                 |
+------------------------------------------------------------------------------+
| [Regional Event Promotion Paths]                                             |
+------------------------------------------------------------------------------+

UX notes:
- Needs map support for region drilldowns
- Allow selecting one county/city and comparing against national ecosystem


15. SEASONALITY PAGE
--------------------------------------------------------------------------------
Purpose:
- explore recurring annual/monthly/daily patterns

+------------------------------------------------------------------------------+
| PAGE TITLE: Theme Seasonality                                                |
+------------------------------------------------------------------------------+
| [Theme selector] [Outlet selector] [Entity selector] [Year range]            |
+------------------------------------------------------------------------------+
| [Calendar Heatmap]                                                           |
| Jan Feb Mar Apr ...                                                          |
+------------------------------------------------------------------------------+
| [Weekday Pattern]                      | [Holiday Window Pattern]            |
+----------------------------------------+-------------------------------------+
| [Year-over-Year Theme Trend]                                                 |
+------------------------------------------------------------------------------+
| [Sentiment by Month/Day]                                                     |
+------------------------------------------------------------------------------+
| [Recurring Event Types]                                                      |
+------------------------------------------------------------------------------+


16. 5D EXPLORATION VIEW
--------------------------------------------------------------------------------
Purpose:
- multi-dimensional exploratory dashboard

+------------------------------------------------------------------------------+
| PAGE TITLE: Explore                                                          |
+------------------------------------------------------------------------------+
| Controls:                                                                    |
| X-axis [v] Y-axis [v] Size [v] Color [v] Time Slider [====|----]            |
| Filters [Outlet] [Theme] [Entity] [Region] [Local/National] [Event Type]    |
+------------------------------------------------------------------------------+
|                                                                              |
|                      o                                                        |
|         o                               o                                     |
|                           o                                                  |
|   o                                                                      o   |
|                                                                              |
|                bubble/scatter exploration canvas                             |
|                                                                              |
+------------------------------------------------------------------------------+
| [Selected Point Details]                                                     |
+------------------------------------------------------------------------------+

Recommended dimensions:
- X = framing polarity / institutional vs emotional
- Y = speed / stability / sentiment
- Size = mentions / salience
- Color = outlet type / frame / region
- Time slider = evolution

UX notes:
- Default to 2D scatter, not forced 3D
- Optional 3D mode can exist, but 2D should be primary


17. SAVED VIEWS / WATCHLISTS
--------------------------------------------------------------------------------
Purpose:
- let analysts monitor what matters to them

+------------------------------------------------------------------------------+
| PAGE TITLE: Saved Views                                                      |
+------------------------------------------------------------------------------+
| [My Watchlists] [Shared Team Views] [Alert Rules]                            |
+------------------------------------------------------------------------------+
| Watchlist examples:                                                          |
| - Election 2028                                                              |
| - Bucharest local politics                                                   |
| - NATO / Black Sea                                                           |
| - Energy and inflation                                                       |
| - Entity: Marcel Ciolacu                                                     |
+------------------------------------------------------------------------------+

Features:
- save filters + layout + selected widgets
- schedule brief generation
- alert on:
    - new event
    - tone spike
    - ghosting
    - propagation anomaly
    - entity surge


18. RIGHT-SIDE DETAIL DRAWER SPEC
--------------------------------------------------------------------------------
Used across all pages for quick drilldown.

+-----------------------------------------------+
| [X] Item title                                |
+-----------------------------------------------+
| Type: event/entity/outlet/theme               |
| Key metrics                                   |
| Summary                                       |
| Top linked outlets/entities/events            |
| Tone/Frame mini chart                         |
| First seen / last seen                        |
| Actions:                                      |
| [Open full page] [Compare] [Pin] [Export]    |
+-----------------------------------------------+

UX rule:
- Do not force page change for every click
- Drawer should handle 70% of exploration needs


19. TABLE BEHAVIOR SPEC
--------------------------------------------------------------------------------
All major tables should support:
- sticky header
- sticky first column where useful
- column chooser
- sort ascending/descending
- filter in column
- export CSV
- compare selected rows
- open selected rows in split screen
- density toggle:
    [Comfortable] [Compact] [Analyst]


20. SEARCH SPEC
--------------------------------------------------------------------------------
Global search should find:
- outlets
- events
- entities
- themes
- saved views

Search result layout:

+------------------------------------------------------------------------------+
| Search: "Khamenei"                                                           |
+------------------------------------------------------------------------------+
| Tabs: [All] [Entities] [Events] [Outlets] [Themes]                           |
+------------------------------------------------------------------------------+
| Entity result                                                                |
| Event result                                                                 |
| Mentioned in 4 outlet pages                                                  |
+------------------------------------------------------------------------------+

UX notes:
- keyboard-first search
- support fuzzy search and alias recognition if available


21. ALERTS / NOTIFICATIONS SPEC
--------------------------------------------------------------------------------
Alert types:
- major event spike
- sudden tone divergence
- high ghosting event
- entity mention surge
- propagation anomaly
- outlet behavior change
- contradiction threshold crossed

Alert center layout:

+------------------------------------------------------------------------------+
| Alerts                                                                       |
+------------------------------------------------------------------------------+
| Severity | Time | Alert Type | Target | Why it triggered | Action            |
+------------------------------------------------------------------------------+


22. EXPORT / REPORTING SPEC
--------------------------------------------------------------------------------
Users should be able to export:
- chart image
- CSV
- event report
- outlet comparison PDF
- morning brief PDF
- saved dashboard snapshot

Report export should include:
- filters used
- timestamp
- note that metrics are analytic indicators, not truth claims


23. RESPONSIVENESS SPEC
--------------------------------------------------------------------------------
Primary target:
- desktop widescreen analyst environment

Secondary:
- laptop

Mobile:
- not a primary use case
- only light monitoring / brief reading

Breakpoints:
- >= 1440 px : full analyst dashboard
- 1024-1439 px: standard desktop/laptop
- < 1024 px   : reduced layout, no full matrix-heavy workflows


24. ACCESSIBILITY / USABILITY NOTES
--------------------------------------------------------------------------------
- keyboard navigable tables and filters
- high-contrast mode
- color should never be sole meaning indicator
- tooltips for all metrics
- readable chart labeling
- avoid hidden critical controls


25. PRIMARY INFORMATION ARCHITECTURE
--------------------------------------------------------------------------------

Home
|
+-- Overview
|
+-- Morning Brief
|
+-- Event Universe
|   +-- Graph
|   +-- Matrix
|   +-- Timeline
|   +-- Map
|
+-- Events
|   +-- Event List
|   +-- Event Detail
|   +-- Event Compare
|
+-- Outlets
|   +-- Outlet List
|   +-- Outlet Detail
|   +-- Compare Outlets
|   +-- Media DNA
|
+-- Entities
|   +-- Entity List
|   +-- Entity Detail
|   +-- Compare Entities
|
+-- Propagation
|   +-- Narrative Propagation Map
|   +-- Coverage Waves
|
+-- Contradictions & Divergence
|
+-- Bias Panel
|
+-- Seasonality
|
+-- Local vs National
|
+-- Explore
|
+-- Saved Views / Watchlists
|
+-- Alerts
|
+-- Admin


26. MAIN DASHBOARD COMPOSITION RECOMMENDATION
--------------------------------------------------------------------------------
If you want one default landing dashboard, use this layout:

+------------------------------------------------------------------------------+
| Header + global search + nav                                                 |
+------------------------------------------------------------------------------+
| Filter bar                                                                   |
+------------------------------------------------------------------------------+
| Row 1: 6 KPI cards                                                           |
+------------------------------------------------------------------------------+
| Row 2: Morning Brief (8 cols) | Alerts (4 cols)                              |
+------------------------------------------------------------------------------+
| Row 3: Coverage Velocity (8 cols) | Fastest/Most Stable Outlets (4 cols)     |
+------------------------------------------------------------------------------+
| Row 4: Top Events (6 cols) | Ghosting Heatmap Preview (6 cols)               |
+------------------------------------------------------------------------------+
| Row 5: Sentiment/Framing Over Time (8 cols) | Bias Panel Preview (4 cols)    |
+------------------------------------------------------------------------------+
| Row 6: Entity Movers (6 cols) | Propagation Preview (6 cols)                 |
+------------------------------------------------------------------------------+


27. DEFAULT KPI SET
--------------------------------------------------------------------------------
Top KPI candidates:
- New Events
- Active Outlets
- Mention Volume
- Avg Speed Index
- Avg Stability Index
- Ghosted Major Events
- Entity Surges
- Divergence Alerts
- National vs Local Split
- High Propagation Events


28. METRIC DISPLAY STYLE
--------------------------------------------------------------------------------
Each metric card should show:
- current value
- delta vs prior period
- mini sparkline
- status label
- click to drill down

Example:

+--------------------------+
| Speed Index              |
| 78                       |
| +4 vs previous 7d        |
| /\_/\/\__                |
| [mostly early coverage]  |
+--------------------------+


29. EMPTY / LOW-DATA STATES
--------------------------------------------------------------------------------
Important because some filters will narrow too much.

Example:
+------------------------------------------------------------------------------+
| No data for this selection                                                   |
| Try expanding date range or removing one filter                              |
| [Reset Filters] [Go to Overview]                                             |
+------------------------------------------------------------------------------+

Low-confidence state:
+------------------------------------------------------------------------------+
| Limited evidence                                                             |
| This view is based on sparse event participation. Interpret cautiously.      |
+------------------------------------------------------------------------------+


30. UI TONE / MICROCOPY STYLE
--------------------------------------------------------------------------------
Use language like:
- "higher conflict framing"
- "slower than peer median"
- "coverage gap detected"
- "entity tone shifted negative"
- "frame divergence increased"

Avoid:
- "fake news"
- "truth score"
- "biased outlet"
- "objectively wrong"

The tone should be analytical, cautious, and evidence-based.


31. FINAL UX SUMMARY
--------------------------------------------------------------------------------
The product should feel like:
- Bloomberg Terminal meets OSINT dashboard
- but focused on Romanian media behavior
- with event intelligence, coverage intelligence, and framing intelligence
- all visible from one coherent dashboard ecosystem

The ideal user journey:
1. open Overview
2. scan Morning Brief + alerts
3. inspect top event cluster
4. compare outlet behavior
5. inspect propagation and ghosting
6. drill into entity or seasonality patterns
7. export/share a compact intelligence readout


================================================================================
END OF UI/UX SPEC
================================================================================