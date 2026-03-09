import type { AppLocale, SidebarState, ThemeMode, TimeWindow } from "@/lib/contracts/ui";

export const supportedLocales: AppLocale[] = ["en", "ro", "hu"];
export const supportedThemes: ThemeMode[] = ["dark", "light"];
export const supportedTimeWindows: TimeWindow[] = ["24h", "7d", "30d"];
export const supportedSidebarStates: SidebarState[] = ["expanded", "collapsed"];

export const defaultLocale: AppLocale = "en";
export const defaultTheme: ThemeMode = "dark";
export const defaultTimeWindow: TimeWindow = "7d";
export const defaultSidebarState: SidebarState = "expanded";
export const defaultAnalystControlsCollapsed = true;

export const preferenceStorageKeys = {
  locale: "mediaecho-locale",
  theme: "mediaecho-theme",
  timeWindow: "mediaecho-time-window",
  sidebarState: "mediaecho-sidebar-state",
  analystControlsCollapsed: "mediaecho-analyst-controls-collapsed",
} as const;
