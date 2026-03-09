import type {
  AlertItem,
  BiasPanelPayload,
  CompareOutletsPayload,
  ContradictionItem,
  DocsPayload,
  EntityDetail,
  EntitySummary,
  EventDetail,
  EventSummary,
  EventUniversePayload,
  ExplorePayload,
  LocalVsNationalPayload,
  MorningBriefPayload,
  OutletDetail,
  OutletSummary,
  OverviewPayload,
  PropagationPayload,
  SearchResult,
  SeasonalityPayload,
  SystemStatusPayload,
} from "@/lib/contracts/platform";
import type { TimeWindow } from "@/lib/contracts/ui";

const alerts: AlertItem[] = [
  {
    id: "alert-divergence-energy",
    title: "Divergence spike around offshore gas pricing",
    summary: "Regional outlets converge on economic risk while national TV sites emphasize coalition infighting.",
    severity: "warning",
    createdAt: "2026-03-09T07:18:00Z",
    whyItTriggered: "Frame divergence rose 18 points above the 30-day baseline.",
    targetHref: "/contradictions",
  },
  {
    id: "alert-ghosting-health",
    title: "Ghosting anomaly on county hospital procurement case",
    summary: "Four peer local outlets covered the story while two expected national outlets remained absent.",
    severity: "critical",
    createdAt: "2026-03-09T06:52:00Z",
    whyItTriggered: "Expected-to-cover model flagged selective silence above historical tolerance.",
    targetHref: "/bias-panel",
  },
];

const events: EventSummary[] = [
  {
    id: "event-energy-grid",
    title: "Black Sea grid balancing negotiations",
    summary: "Energy security coverage split between market stability framing and coalition conflict framing.",
    firstSeen: "2026-03-08T03:00:00Z",
    lastActive: "2026-03-09T08:10:00Z",
    salience: 91,
    activeOutlets: 18,
    speedScore: 82,
    stabilityScore: 69,
    avgToneLabel: "Mixed / cautionary",
    ghostedBy: ["Romania TV", "Observatorul Prahovean"],
    primaryThemes: ["Energy", "Defense", "Government"],
    primaryEntities: ["Sebastian Burduja", "Transelectrica"],
    scope: "national",
    confidence: "high",
    region: "Bucharest",
    status: "rising",
  },
  {
    id: "event-floods-neamt",
    title: "Flash flood response in Neamt county",
    summary: "Local outlets led by hours; national coverage arrived only after emergency declarations and ministry statements.",
    firstSeen: "2026-03-08T22:00:00Z",
    lastActive: "2026-03-09T07:30:00Z",
    salience: 84,
    activeOutlets: 14,
    speedScore: 74,
    stabilityScore: 88,
    avgToneLabel: "Negative / service-heavy",
    ghostedBy: ["Digi24"],
    primaryThemes: ["Climate", "Emergency", "Infrastructure"],
    primaryEntities: ["ISU Neamt", "Piatra Neamt"],
    scope: "local",
    confidence: "high",
    region: "Moldova",
    status: "stable",
  },
  {
    id: "event-election-turnout",
    title: "Diaspora turnout logistics dispute",
    summary: "Election administration coverage shows clear selection asymmetry across partisan peer groups.",
    firstSeen: "2026-03-07T11:00:00Z",
    lastActive: "2026-03-09T05:15:00Z",
    salience: 79,
    activeOutlets: 22,
    speedScore: 90,
    stabilityScore: 62,
    avgToneLabel: "Conflict-heavy",
    ghostedBy: ["Stiripesurse"],
    primaryThemes: ["Elections", "Administration", "Diaspora"],
    primaryEntities: ["AEP", "Ministry of Foreign Affairs"],
    scope: "national",
    confidence: "medium",
    region: "Bucharest",
    status: "rising",
  },
  {
    id: "event-health-lab",
    title: "Cluj public lab staffing shortage",
    summary: "Health-system reporting remains locally rich, but national amplification is sporadic and policy-light.",
    firstSeen: "2026-03-06T08:00:00Z",
    lastActive: "2026-03-09T04:40:00Z",
    salience: 68,
    activeOutlets: 11,
    speedScore: 61,
    stabilityScore: 85,
    avgToneLabel: "Negative / institutional",
    ghostedBy: ["Antena 3 CNN", "Libertatea"],
    primaryThemes: ["Health", "Labor", "Cluj"],
    primaryEntities: ["DSP Cluj", "Cluj-Napoca"],
    scope: "local",
    confidence: "medium",
    region: "Transylvania",
    status: "cooling",
  },
];

const outlets: OutletSummary[] = [
  {
    id: "outlet-g4media",
    name: "G4Media",
    scope: "national",
    region: "Bucharest",
    summary: "Early participation and strong explanatory framing on policy and governance stories.",
    speedIndex: 91,
    stabilityIndex: 81,
    ghostingRate: 18,
    breadth: 76,
    toneSignature: "Institutional / skeptical",
  },
  {
    id: "outlet-hotnews",
    name: "HotNews",
    scope: "national",
    region: "Bucharest",
    summary: "Broad event footprint with fast uptake but moderate frame volatility on live political coverage.",
    speedIndex: 88,
    stabilityIndex: 73,
    ghostingRate: 23,
    breadth: 88,
    toneSignature: "Mixed / competitive",
  },
  {
    id: "outlet-monitorul",
    name: "Monitorul de Neamt",
    scope: "local",
    region: "Moldova",
    summary: "High local-first sensitivity and deep regional sourcing in emergency and municipal coverage.",
    speedIndex: 86,
    stabilityIndex: 89,
    ghostingRate: 11,
    breadth: 52,
    toneSignature: "Service-oriented / local",
  },
  {
    id: "outlet-ziardecluj",
    name: "Ziar de Cluj",
    scope: "local",
    region: "Transylvania",
    summary: "Strong specialization and sharper adversarial framing around local institutional failures.",
    speedIndex: 72,
    stabilityIndex: 66,
    ghostingRate: 28,
    breadth: 47,
    toneSignature: "Adversarial / investigative",
  },
];

const entities: EntitySummary[] = [
  {
    id: "entity-burduja",
    name: "Sebastian Burduja",
    type: "person",
    summary: "Mentions rose with the Black Sea energy negotiations and diverged across economic vs partisan framing.",
    mentionTrend: [
      { label: "Mon", value: 18 },
      { label: "Tue", value: 22 },
      { label: "Wed", value: 36 },
      { label: "Thu", value: 29 },
      { label: "Fri", value: 41 },
    ],
    toneTrend: [
      { label: "Mon", value: 52 },
      { label: "Tue", value: 47 },
      { label: "Wed", value: 44 },
      { label: "Thu", value: 50 },
      { label: "Fri", value: 39 },
    ],
    topOutlets: ["G4Media", "HotNews", "Digi24"],
    themes: ["Energy", "Grid", "Coalition"],
  },
  {
    id: "entity-isu-neamt",
    name: "ISU Neamt",
    type: "organization",
    summary: "Entity salience surged during the flood response, especially across local service coverage.",
    mentionTrend: [
      { label: "Mon", value: 4 },
      { label: "Tue", value: 6 },
      { label: "Wed", value: 9 },
      { label: "Thu", value: 12 },
      { label: "Fri", value: 31 },
    ],
    toneTrend: [
      { label: "Mon", value: 60 },
      { label: "Tue", value: 58 },
      { label: "Wed", value: 64 },
      { label: "Thu", value: 62 },
      { label: "Fri", value: 66 },
    ],
    topOutlets: ["Monitorul de Neamt", "TVM Neamt", "Agerpres"],
    themes: ["Emergency", "Floods", "Infrastructure"],
  },
];

const contradictions: ContradictionItem[] = [
  {
    id: "contradiction-energy-frame",
    eventId: "event-energy-grid",
    eventTitle: "Black Sea grid balancing negotiations",
    divergenceType: "Frame split",
    summary: "Economic-security framing and coalition-conflict framing now coexist with similar volume shares.",
    severity: "warning",
    firstDetectedAt: "2026-03-09T05:40:00Z",
  },
  {
    id: "contradiction-election-tone",
    eventId: "event-election-turnout",
    eventTitle: "Diaspora turnout logistics dispute",
    divergenceType: "Tone split",
    summary: "Policy-focused outlets turned more neutral while partisan peers intensified conflict descriptors.",
    severity: "critical",
    firstDetectedAt: "2026-03-09T04:15:00Z",
  },
];

const biasPanel: BiasPanelPayload = {
  dimensions: [
    { id: "selection", label: "Selection bias", description: "Over- and under-coverage by event type.", score: 64, tone: "warning" },
    { id: "ghosting", label: "Ghosting bias", description: "Expected stories that remained uncovered.", score: 71, tone: "critical" },
    { id: "framing", label: "Framing bias", description: "Narrative lens divergence versus peers.", score: 58, tone: "warning" },
    { id: "tone", label: "Tone bias", description: "Systematic emotional or institutional tone shifts.", score: 46, tone: "info" },
  ],
  outletRows: [
    {
      outletId: "outlet-g4media",
      outletName: "G4Media",
      selectionBias: 41,
      ghostingBias: 22,
      framingBias: 37,
      toneBias: 33,
      entityBias: 38,
      attributionBias: 28,
    },
    {
      outletId: "outlet-hotnews",
      outletName: "HotNews",
      selectionBias: 49,
      ghostingBias: 31,
      framingBias: 45,
      toneBias: 41,
      entityBias: 34,
      attributionBias: 36,
    },
    {
      outletId: "outlet-ziardecluj",
      outletName: "Ziar de Cluj",
      selectionBias: 63,
      ghostingBias: 44,
      framingBias: 68,
      toneBias: 58,
      entityBias: 51,
      attributionBias: 43,
    },
  ],
};

const compareOutlets: CompareOutletsPayload = {
  metrics: [
    { id: "speed", label: "Speed Index", description: "Relative early participation in ecosystem coverage." },
    { id: "stability", label: "Stability Index", description: "Consistency between early coverage and later consensus." },
    { id: "ghosting", label: "Ghosting rate", description: "Expected stories missed by the outlet." },
    { id: "frames", label: "Frame distinctiveness", description: "How differently the outlet frames events versus peers." },
  ],
  rows: outlets.map((outlet) => ({
    outletId: outlet.id,
    outletName: outlet.name,
    scope: outlet.scope,
    values: {
      speed: outlet.speedIndex,
      stability: outlet.stabilityIndex,
      ghosting: outlet.ghostingRate,
      frames: outlet.id === "outlet-ziardecluj" ? 71 : outlet.id === "outlet-monitorul" ? 55 : 48,
    },
  })),
};

const propagation: PropagationPayload = {
  waveSummary: "Local sources still lead emergency and accountability stories, while national outlets accelerate amplification once official institutions respond.",
  edges: [
    { id: "edge-1", from: "Monitorul de Neamt", to: "Agerpres", strength: 84, lagMinutes: 56, eventTitle: "Flash flood response in Neamt county" },
    { id: "edge-2", from: "Agerpres", to: "HotNews", strength: 67, lagMinutes: 38, eventTitle: "Flash flood response in Neamt county" },
    { id: "edge-3", from: "G4Media", to: "Digi24", strength: 62, lagMinutes: 44, eventTitle: "Diaspora turnout logistics dispute" },
  ],
  topPathways: [
    {
      id: "pathway-neamt",
      eventTitle: "Flash flood response in Neamt county",
      summary: "Regional reporting surfaced first, then a wire-service bridge moved the story into national coverage.",
      firstMover: "Monitorul de Neamt",
      amplifiers: ["Agerpres", "HotNews"],
      silentOutlets: ["Digi24"],
    },
    {
      id: "pathway-energy",
      eventTitle: "Black Sea grid balancing negotiations",
      summary: "Policy sites seeded the event before television-driven amplification took over the second wave.",
      firstMover: "G4Media",
      amplifiers: ["Digi24", "Antena 3 CNN"],
      silentOutlets: ["Romania TV"],
    },
  ],
};

const universe: EventUniversePayload = {
  summary: "Start clustered, then expand event, theme, entity, and outlet relations to inspect ecosystem structure.",
  nodes: [
    { id: "event-energy-grid", label: "Grid talks", kind: "event", x: 20, y: 30 },
    { id: "event-floods-neamt", label: "Neamt floods", kind: "event", x: 54, y: 62 },
    { id: "entity-burduja", label: "Burduja", kind: "entity", x: 38, y: 18 },
    { id: "outlet-g4media", label: "G4Media", kind: "outlet", x: 10, y: 58 },
    { id: "theme-energy", label: "Energy", kind: "theme", x: 63, y: 26 },
  ],
  edges: [
    { id: "u-1", from: "event-energy-grid", to: "entity-burduja", label: "mentions" },
    { id: "u-2", from: "event-energy-grid", to: "outlet-g4media", label: "covered by" },
    { id: "u-3", from: "event-energy-grid", to: "theme-energy", label: "tagged as" },
  ],
};

const seasonality: SeasonalityPayload = {
  summary: "Infrastructure failures, flood response, and energy security show repeatable spikes around spring weather volatility and budget cycles.",
  calendar: Array.from({ length: 12 }, (_, index) => ({
    label: `M${index + 1}`,
    intensity: [28, 34, 41, 56, 63, 52, 39, 35, 47, 58, 44, 31][index],
  })),
  recurringThemes: [
    { label: "Flood response", value: 68 },
    { label: "Energy affordability", value: 61 },
    { label: "Election logistics", value: 54 },
    { label: "Hospital staffing", value: 49 },
  ],
  patterns: [
    { label: "Weekday effect", detail: "Institutional themes crest Tuesday through Thursday when ministries publish statements and committees meet." },
    { label: "Holiday effect", detail: "Local service reporting deepens while national political framing softens around major holidays." },
  ],
};

const localVsNational: LocalVsNationalPayload = {
  summary: "Local outlets surface consequences first; national outlets dominate agenda-setting only after institutions react or political conflict intensifies.",
  nationalHighlights: [events[0], events[2]],
  localHighlights: [events[1], events[3]],
  coverageGaps: [
    {
      eventTitle: "Cluj public lab staffing shortage",
      localCoverage: 88,
      nationalCoverage: 32,
      gapType: "National undercoverage",
    },
    {
      eventTitle: "Diaspora turnout logistics dispute",
      localCoverage: 22,
      nationalCoverage: 79,
      gapType: "Local undercoverage",
    },
  ],
};

const explore: ExplorePayload = {
  summary: "Map events and outlets across speed, stability, frame polarity, and salience to spot outliers quickly.",
  points: [
    { id: "p-1", label: "Grid talks", x: 72, y: 58, size: 18, colorToken: "var(--accent)", detail: "High salience, mid stability." },
    { id: "p-2", label: "Neamt floods", x: 34, y: 76, size: 16, colorToken: "var(--warning)", detail: "Local-first and high stability." },
    { id: "p-3", label: "Ziar de Cluj", x: 64, y: 34, size: 14, colorToken: "var(--danger)", detail: "High frame distinctiveness." },
    { id: "p-4", label: "HotNews", x: 78, y: 51, size: 15, colorToken: "var(--text-primary)", detail: "Broad event participation." },
  ],
};

const docs: DocsPayload = {
  sections: [
    {
      id: "data",
      title: "Data sources and modeling",
      summary: "The platform is GDELT-first and event-centric rather than article-centric.",
      bullets: [
        "Events define the ecosystem backbone.",
        "Mentions capture timing, participation, and propagation.",
        "GKG supplies themes, entities, tone, counts, and GCAM signals.",
      ],
    },
    {
      id: "metrics",
      title: "Metric definitions",
      summary: "Speed, stability, ghosting, and bias dimensions are explainable heuristics, not truth claims.",
      bullets: [
        "Speed measures how early an outlet joins event coverage relative to the ecosystem.",
        "Stability measures how closely early coverage aligns with later consensus.",
        "Ghosting estimates selective silence versus peers and historical expectation.",
      ],
    },
    {
      id: "limits",
      title: "Confidence and limitations",
      summary: "Sparse participation, syndication, and imperfect source normalization can reduce confidence.",
      bullets: [
        "All views should be interpreted with source coverage limits in mind.",
        "GCAM and frame labels are analytical support signals, not a final judgement.",
        "Operational freshness and warehouse lag are surfaced in the public status view.",
      ],
    },
  ],
};

const systemStatus: SystemStatusPayload = {
  publicStatus: "operational",
  summary: "Serving snapshots are fresh and ingestion is current, but two analytical jobs are under warning thresholds due to elevated rebuild volume.",
  freshnessMinutes: 14,
  lastIngestAt: "2026-03-09T08:12:00Z",
  activeSources: 132,
  warnings: ["Historical bias-panel recomputation still backfilling January deltas."],
  jobs: [
    { id: "poller", label: "Masterfile poller", status: "healthy", detail: "Polling every 5 minutes.", lastRunAt: "2026-03-09T08:10:00Z" },
    { id: "normalizer", label: "Normalizer", status: "healthy", detail: "Recent deltas normalized successfully.", lastRunAt: "2026-03-09T08:06:00Z" },
    { id: "brief", label: "Brief generator", status: "degraded", detail: "Morning brief candidates lagging by one cycle.", lastRunAt: "2026-03-09T07:44:00Z" },
  ],
  incidents: alerts,
};

const eventDetailsById: Record<string, EventDetail> = {
  "event-energy-grid": {
    ...events[0],
    framingProfile: [
      { label: "Institutional", value: 64 },
      { label: "Conflict", value: 48 },
      { label: "Economic risk", value: 71 },
    ],
    participationByOutlet: [
      { outletId: "outlet-g4media", outletName: "G4Media", lagMinutes: 0, frameLabel: "Policy lead", toneLabel: "Institutional" },
      { outletId: "outlet-hotnews", outletName: "HotNews", lagMinutes: 22, frameLabel: "Conflict + market", toneLabel: "Mixed" },
      { outletId: "outlet-ziardecluj", outletName: "Ziar de Cluj", lagMinutes: 71, frameLabel: "Regional cost pressure", toneLabel: "Negative" },
    ],
    propagationPath: [
      { from: "G4Media", to: "HotNews", lagMinutes: 22, wave: "Wave 1" },
      { from: "HotNews", to: "Digi24", lagMinutes: 31, wave: "Wave 2" },
    ],
    contradictions: contradictions.map((item) => ({
      id: item.id,
      type: item.divergenceType,
      severity: item.severity,
      summary: item.summary,
    })),
    timeline: [
      { label: "06:00", value: 14 },
      { label: "09:00", value: 24 },
      { label: "12:00", value: 36 },
      { label: "15:00", value: 42 },
    ],
    explainabilityNotes: [
      "Frame divergence rose once television outlets entered the story.",
      "Ghosting remains notable among two expected national outlets.",
    ],
  },
  "event-floods-neamt": {
    ...events[1],
    framingProfile: [
      { label: "Service", value: 77 },
      { label: "Institutional", value: 52 },
      { label: "Conflict", value: 16 },
    ],
    participationByOutlet: [
      { outletId: "outlet-monitorul", outletName: "Monitorul de Neamt", lagMinutes: 0, frameLabel: "Service / emergency", toneLabel: "Negative" },
      { outletId: "outlet-hotnews", outletName: "HotNews", lagMinutes: 94, frameLabel: "National response", toneLabel: "Mixed" },
    ],
    propagationPath: [
      { from: "Monitorul de Neamt", to: "Agerpres", lagMinutes: 56, wave: "Wave 1" },
      { from: "Agerpres", to: "HotNews", lagMinutes: 38, wave: "Wave 2" },
    ],
    contradictions: [],
    timeline: [
      { label: "00:00", value: 8 },
      { label: "03:00", value: 14 },
      { label: "06:00", value: 26 },
      { label: "09:00", value: 33 },
    ],
    explainabilityNotes: [
      "Local-first emergence increases confidence in the propagation order.",
      "Low contradiction signal but meaningful national ghosting remains.",
    ],
  },
};

const outletDetailsById: Record<string, OutletDetail> = {
  "outlet-g4media": {
    ...outlets[0],
    selectionAsymmetry: 41,
    frameDistinctiveness: 48,
    originalityBehavior: "Frequently leads policy coverage and stabilizes quickly once institutions speak.",
    topThemes: [
      { label: "Governance", value: 76 },
      { label: "Energy", value: 69 },
      { label: "Defense", value: 58 },
    ],
    recentEvents: [events[0], events[2]],
    peerComparison: [
      { label: "Peer median speed", value: 82 },
      { label: "Peer median stability", value: 70 },
      { label: "Ghosting expectation", value: 24 },
    ],
    notes: ["High breadth but comparatively low ghosting on policy-heavy events."],
  },
  "outlet-hotnews": {
    ...outlets[1],
    selectionAsymmetry: 49,
    frameDistinctiveness: 45,
    originalityBehavior: "Broad participation footprint with moderate follow tendency on fast-breaking stories.",
    topThemes: [
      { label: "Politics", value: 74 },
      { label: "Economy", value: 63 },
      { label: "Health", value: 48 },
    ],
    recentEvents: [events[0], events[1], events[2]],
    peerComparison: [
      { label: "Peer median speed", value: 79 },
      { label: "Peer median stability", value: 72 },
      { label: "Ghosting expectation", value: 25 },
    ],
    notes: ["Fast uptake, but frame volatility rises in conflict-heavy political coverage."],
  },
  "outlet-monitorul": {
    ...outlets[2],
    selectionAsymmetry: 27,
    frameDistinctiveness: 39,
    originalityBehavior: "Local first-mover with strong service reporting and low amplification dependence.",
    topThemes: [
      { label: "Emergency", value: 82 },
      { label: "Municipal", value: 61 },
      { label: "Infrastructure", value: 57 },
    ],
    recentEvents: [events[1]],
    peerComparison: [
      { label: "Peer median speed", value: 67 },
      { label: "Peer median stability", value: 72 },
      { label: "Ghosting expectation", value: 19 },
    ],
    notes: ["Regional strength contributes to local-vs-national pathway discovery."],
  },
  "outlet-ziardecluj": {
    ...outlets[3],
    selectionAsymmetry: 63,
    frameDistinctiveness: 71,
    originalityBehavior: "Niche local agenda with distinctive, sometimes adversarial framing.",
    topThemes: [
      { label: "Local accountability", value: 84 },
      { label: "Health", value: 59 },
      { label: "Justice", value: 43 },
    ],
    recentEvents: [events[3]],
    peerComparison: [
      { label: "Peer median speed", value: 68 },
      { label: "Peer median stability", value: 71 },
      { label: "Ghosting expectation", value: 24 },
    ],
    notes: ["High frame distinctiveness requires peer-relative interpretation."],
  },
};

const entityDetailsById: Record<string, EntityDetail> = {
  "entity-burduja": {
    ...entities[0],
    associatedEvents: [events[0]],
    coEntities: [
      { label: "Transelectrica", value: 68 },
      { label: "Energy Ministry", value: 61 },
      { label: "Marcel Ciolacu", value: 34 },
    ],
    seasonalityNotes: ["Mentions typically rise around winter energy pressure and spring regulatory negotiations."],
  },
  "entity-isu-neamt": {
    ...entities[1],
    associatedEvents: [events[1]],
    coEntities: [
      { label: "Piatra Neamt", value: 72 },
      { label: "County Council", value: 43 },
      { label: "Road Authority", value: 37 },
    ],
    seasonalityNotes: ["Emergency service salience increases during spring flood windows and summer wildfire alerts."],
  },
};

const searchResults: SearchResult[] = [
  ...events.map((event) => ({
    id: event.id,
    type: "event" as const,
    title: event.title,
    subtitle: event.summary,
    href: `/events/${event.id}`,
    keywords: [...event.primaryThemes, ...event.primaryEntities],
  })),
  ...outlets.map((outlet) => ({
    id: outlet.id,
    type: "outlet" as const,
    title: outlet.name,
    subtitle: outlet.summary,
    href: `/outlets/${outlet.id}`,
    keywords: [outlet.region, outlet.toneSignature],
  })),
  ...entities.map((entity) => ({
    id: entity.id,
    type: "entity" as const,
    title: entity.name,
    subtitle: entity.summary,
    href: `/entities/${entity.id}`,
    keywords: entity.themes,
  })),
];

const overview24h: OverviewPayload = {
  window: "24h",
  headline: "Romanian media ecosystem snapshot",
  summary: "Three event clusters dominate the last 24 hours, with strong local-first propagation in emergencies and sharper divergence in policy framing.",
  morningBriefPreview: "Energy negotiations, flood response, and diaspora logistics drove the last cycle, with one notable ghosting anomaly in health coverage.",
  kpis: [
    { id: "new-events", label: "New events", value: "12", deltaLabel: "+3 vs previous 24h", statusLabel: "Rising cluster creation", tone: "success", trend: [{ label: "1", value: 4 }, { label: "2", value: 7 }, { label: "3", value: 12 }], description: "New clusters detected in the current time window." },
    { id: "mentions", label: "Mention volume", value: "8.4k", deltaLabel: "+12%", statusLabel: "Above 7-day median", tone: "info", trend: [{ label: "1", value: 44 }, { label: "2", value: 56 }, { label: "3", value: 71 }], description: "Total mention load from tracked Romanian outlets." },
    { id: "outlets", label: "Active outlets", value: "37", deltaLabel: "+5", statusLabel: "Broad participation", tone: "success", trend: [{ label: "1", value: 22 }, { label: "2", value: 31 }, { label: "3", value: 37 }], description: "Distinct outlets participating in tracked events." },
    { id: "speed", label: "Avg speed", value: "79", deltaLabel: "+4", statusLabel: "Earlier than baseline", tone: "success", trend: [{ label: "1", value: 62 }, { label: "2", value: 70 }, { label: "3", value: 79 }], description: "Average ecosystem speed index." },
    { id: "stability", label: "Avg stability", value: "73", deltaLabel: "-2", statusLabel: "Watch frame drift", tone: "warning", trend: [{ label: "1", value: 79 }, { label: "2", value: 76 }, { label: "3", value: 73 }], description: "Average early-to-late stability signal." },
    { id: "ghosting", label: "Ghosted major events", value: "4", deltaLabel: "+1", statusLabel: "Selective silence increased", tone: "critical", trend: [{ label: "1", value: 1 }, { label: "2", value: 3 }, { label: "3", value: 4 }], description: "Major stories missing from expected outlets." },
  ],
  topAlerts: alerts,
  topEvents: events,
  fastestOutlets: outlets.slice(0, 3),
  stableOutlets: [outlets[2], outlets[0], outlets[1]],
  entityMovers: entities,
  coverageVelocity: [
    { label: "00:00", value: 18 },
    { label: "04:00", value: 24 },
    { label: "08:00", value: 31 },
    { label: "12:00", value: 39 },
    { label: "16:00", value: 27 },
  ],
  ghostingHeatmap: [
    { outlet: "Digi24", event: "Neamt floods", score: 79 },
    { outlet: "Romania TV", event: "Grid talks", score: 83 },
    { outlet: "Libertatea", event: "Cluj lab", score: 76 },
  ],
  biasPreview: biasPanel.dimensions,
  propagationPreview: propagation.topPathways,
};

const overviewByWindow: Record<TimeWindow, OverviewPayload> = {
  "24h": overview24h,
  "7d": {
    ...overview24h,
    window: "7d",
    summary: "The last week highlights a local-vs-national split in consequence coverage, while national political narratives remain faster but less stable.",
  },
  "30d": {
    ...overview24h,
    window: "30d",
    summary: "The month shows repeatable energy, health, and local accountability patterns with persistent ghosting asymmetries.",
  },
};

const morningBrief24h: MorningBriefPayload = {
  generatedAt: "2026-03-09T08:15:00Z",
  summary: "In the last 24 hours, energy negotiations, flood response, and diaspora logistics dominated Romanian coverage, with sharper-than-usual divergence in framing around energy governance.",
  topDevelopments: events.slice(0, 3).map((event) => ({
    eventId: event.id,
    title: event.title,
    salience: event.salience,
    speed: event.speedScore,
    spread: event.activeOutlets,
    divergence: Math.round((100 - event.stabilityScore) * 0.9),
    ghosting: event.ghostedBy.length * 18,
  })),
  changes: [
    "Flood response entered the top five after regional outlets forced national pickup.",
    "Energy framing diverged further once television outlets amplified coalition conflict.",
  ],
  undercoveredStories: [
    "Cluj public lab staffing shortage remained heavily local despite high expected national relevance.",
    "County procurement scrutiny stayed outside two major television-led agendas.",
  ],
  outletBehaviorHighlights: [
    "G4Media led the energy story and stayed close to institutional sourcing.",
    "Monitorul de Neamt remained the first mover on emergency response coverage.",
  ],
  entityMovers: [
    { name: "Sebastian Burduja", detail: "Mentions rose sharply, but tone skewed more negative after midday TV amplification." },
    { name: "ISU Neamt", detail: "Entity salience increased with highly stable local-first reporting." },
  ],
};

const morningBriefByWindow: Record<TimeWindow, MorningBriefPayload> = {
  "24h": morningBrief24h,
  "7d": {
    ...morningBrief24h,
    summary: "Over the last week, energy governance, flood response, and diaspora logistics defined the agenda while local accountability stories continued to lag national amplification.",
  },
  "30d": {
    ...morningBrief24h,
    summary: "Over the last month, recurring energy and institutional capacity themes shaped the Romanian media ecosystem with selective amplification patterns across outlet groups.",
  },
};

export function getOverviewSnapshot(window: TimeWindow): OverviewPayload {
  return overviewByWindow[window];
}

export function getMorningBriefSnapshot(window: TimeWindow): MorningBriefPayload {
  return morningBriefByWindow[window];
}

export function listEventsSnapshot(): EventSummary[] {
  return events;
}

export function getEventSnapshot(eventId: string): EventDetail | null {
  return eventDetailsById[eventId] ?? null;
}

export function listOutletsSnapshot(): OutletSummary[] {
  return outlets;
}

export function getOutletSnapshot(outletId: string): OutletDetail | null {
  return outletDetailsById[outletId] ?? null;
}

export function listEntitiesSnapshot(): EntitySummary[] {
  return entities;
}

export function getEntitySnapshot(entityId: string): EntityDetail | null {
  return entityDetailsById[entityId] ?? null;
}

export function getCompareSnapshot(): CompareOutletsPayload {
  return compareOutlets;
}

export function getPropagationSnapshot(): PropagationPayload {
  return propagation;
}

export function listContradictionsSnapshot(): ContradictionItem[] {
  return contradictions;
}

export function getBiasPanelSnapshot(): BiasPanelPayload {
  return biasPanel;
}

export function getSeasonalitySnapshot(): SeasonalityPayload {
  return seasonality;
}

export function getLocalVsNationalSnapshot(): LocalVsNationalPayload {
  return localVsNational;
}

export function getExploreSnapshot(): ExplorePayload {
  return explore;
}

export function getUniverseSnapshot(): EventUniversePayload {
  return universe;
}

export function getDocsSnapshot(): DocsPayload {
  return docs;
}

export function getSystemStatusSnapshot(): SystemStatusPayload {
  return systemStatus;
}

export function getSearchSnapshot(): SearchResult[] {
  return searchResults;
}
