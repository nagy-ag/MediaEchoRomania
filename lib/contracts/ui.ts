export type AppLocale = "en" | "ro" | "hu";

export type ThemeMode = "dark" | "light";

export type TimeWindow = "24h" | "7d" | "30d";

export type SidebarState = "expanded" | "collapsed";

export type AnalystDensity = "comfortable" | "compact" | "analyst";

export type OutletScope = "all" | "national" | "local";

export type ToneFilter = "all" | "positive" | "mixed" | "negative";

export type Severity = "info" | "warning" | "critical";

export type Confidence = "high" | "medium" | "limited";

export type PageKey =
  | "overview"
  | "morningBrief"
  | "eventUniverse"
  | "events"
  | "outlets"
  | "compareOutlets"
  | "entities"
  | "propagation"
  | "contradictions"
  | "biasPanel"
  | "seasonality"
  | "localVsNational"
  | "explore"
  | "search"
  | "savedViews"
  | "alerts"
  | "docs"
  | "status"
  | "admin";
