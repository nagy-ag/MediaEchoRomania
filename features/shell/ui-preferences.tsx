"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type DictionaryKey } from "@/config/dictionaries";
import {
  defaultAnalystControlsCollapsed,
  defaultLocale,
  defaultSidebarState,
  defaultTheme,
  defaultTimeWindow,
  preferenceStorageKeys,
  supportedLocales,
  supportedSidebarStates,
  supportedThemes,
  supportedTimeWindows,
} from "@/config/ui";
import type {
  AnalystDensity,
  AppLocale,
  OutletScope,
  SidebarState,
  ThemeMode,
  TimeWindow,
  ToneFilter,
} from "@/lib/contracts/ui";

interface PlatformFilters {
  outletScope: OutletScope;
  region: string;
  topic: string;
  entity: string;
  tone: ToneFilter;
  frame: string;
  ghosting: string;
}

interface UiPreferencesContextValue {
  locale: AppLocale;
  theme: ThemeMode;
  timeWindow: TimeWindow;
  sidebarState: SidebarState;
  density: AnalystDensity;
  filters: PlatformFilters;
  analystControlsCollapsed: boolean;
  setLocale: (locale: AppLocale) => void;
  setTheme: (theme: ThemeMode) => void;
  setTimeWindow: (window: TimeWindow) => void;
  setDensity: (density: AnalystDensity) => void;
  setFilter: <K extends keyof PlatformFilters>(key: K, value: PlatformFilters[K]) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  toggleAnalystControls: () => void;
  t: (key: DictionaryKey) => string;
}

interface UiPreferencesProviderProps {
  children: ReactNode;
  initialLocale?: AppLocale;
  initialTheme?: ThemeMode;
  initialTimeWindow?: TimeWindow;
  initialSidebarState?: SidebarState;
}

const defaultFilters: PlatformFilters = {
  outletScope: "all",
  region: "all",
  topic: "all",
  entity: "all",
  tone: "all",
  frame: "all",
  ghosting: "all",
};

const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null);

function readInitialValue<T extends string>(key: string, allowed: readonly T[], fallback: T, documentValue?: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  if (documentValue && allowed.includes(documentValue as T)) {
    return documentValue as T;
  }

  const stored = window.localStorage.getItem(key);
  return allowed.includes(stored as T) ? (stored as T) : fallback;
}

function readBooleanPreference(key: string, fallback: boolean) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  if (stored === "true") {
    return true;
  }
  if (stored === "false") {
    return false;
  }
  return fallback;
}

function writePreference(key: string, value: string) {
  window.localStorage.setItem(key, value);
  document.cookie = `${key}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function UiPreferencesProvider({
  children,
  initialLocale = defaultLocale,
  initialTheme = defaultTheme,
  initialTimeWindow = defaultTimeWindow,
  initialSidebarState = defaultSidebarState,
}: UiPreferencesProviderProps) {
  const [locale, setLocale] = useState<AppLocale>(() =>
    readInitialValue(
      preferenceStorageKeys.locale,
      supportedLocales,
      initialLocale,
      typeof document !== "undefined" ? document.documentElement.lang : undefined,
    ),
  );
  const [theme, setTheme] = useState<ThemeMode>(() =>
    readInitialValue(
      preferenceStorageKeys.theme,
      supportedThemes,
      initialTheme,
      typeof document !== "undefined" ? document.documentElement.dataset.theme : undefined,
    ),
  );
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(() =>
    readInitialValue(preferenceStorageKeys.timeWindow, supportedTimeWindows, initialTimeWindow),
  );
  const [sidebarState, setSidebarState] = useState<SidebarState>(() =>
    readInitialValue(
      preferenceStorageKeys.sidebarState,
      supportedSidebarStates,
      initialSidebarState,
      typeof document !== "undefined" ? document.documentElement.dataset.sidebar : undefined,
    ),
  );
  const [density, setDensity] = useState<AnalystDensity>("compact");
  const [filters, setFilters] = useState<PlatformFilters>(defaultFilters);
  const [analystControlsCollapsed, setAnalystControlsCollapsed] = useState<boolean>(() =>
    readBooleanPreference(preferenceStorageKeys.analystControlsCollapsed, defaultAnalystControlsCollapsed),
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    writePreference(preferenceStorageKeys.locale, locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writePreference(preferenceStorageKeys.theme, theme);
  }, [theme]);

  useEffect(() => {
    writePreference(preferenceStorageKeys.timeWindow, timeWindow);
  }, [timeWindow]);

  useEffect(() => {
    document.documentElement.dataset.sidebar = sidebarState;
    writePreference(preferenceStorageKeys.sidebarState, sidebarState);
  }, [sidebarState]);

  useEffect(() => {
    writePreference(preferenceStorageKeys.analystControlsCollapsed, String(analystControlsCollapsed));
  }, [analystControlsCollapsed]);

  const value = useMemo<UiPreferencesContextValue>(() => ({
    locale,
    theme,
    timeWindow,
    sidebarState,
    density,
    filters,
    analystControlsCollapsed,
    setLocale,
    setTheme,
    setTimeWindow,
    setDensity,
    setFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    resetFilters: () => setFilters(defaultFilters),
    toggleSidebar: () => setSidebarState((current) => (current === "expanded" ? "collapsed" : "expanded")),
    toggleAnalystControls: () => setAnalystControlsCollapsed((current) => !current),
    t: (key) => dictionaries[locale][key],
  }), [locale, theme, timeWindow, sidebarState, density, filters, analystControlsCollapsed]);

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>;
}

export function useUiPreferences(): UiPreferencesContextValue {
  const context = useContext(UiPreferencesContext);
  if (!context) {
    throw new Error("useUiPreferences must be used inside UiPreferencesProvider");
  }
  return context;
}
