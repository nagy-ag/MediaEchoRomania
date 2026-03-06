"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type DictionaryKey } from "@/config/dictionaries";
import { defaultLocale, defaultTheme, defaultTimeWindow, supportedLocales, supportedThemes, supportedTimeWindows } from "@/config/ui";
import type { AppLocale, SidebarState, ThemeMode, TimeWindow } from "@/lib/contracts/ui";

interface UiPreferencesContextValue {
  locale: AppLocale;
  theme: ThemeMode;
  timeWindow: TimeWindow;
  sidebarState: SidebarState;
  setLocale: (locale: AppLocale) => void;
  setTheme: (theme: ThemeMode) => void;
  setTimeWindow: (window: TimeWindow) => void;
  toggleSidebar: () => void;
  t: (key: DictionaryKey) => string;
}

const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null);
const sidebarStates: SidebarState[] = ["expanded", "collapsed"];

const storageKeys = {
  locale: "mediaecho-locale",
  theme: "mediaecho-theme",
  timeWindow: "mediaecho-time-window",
  sidebarState: "mediaecho-sidebar-state",
} as const;

function readStoredValue<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  return allowed.includes(raw as T) ? (raw as T) : fallback;
}

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(defaultLocale);
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(defaultTimeWindow);
  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");

  useEffect(() => {
    setLocale(readStoredValue(storageKeys.locale, supportedLocales, defaultLocale));
    setTheme(readStoredValue(storageKeys.theme, supportedThemes, defaultTheme));
    setTimeWindow(readStoredValue(storageKeys.timeWindow, supportedTimeWindows, defaultTimeWindow));
    setSidebarState(readStoredValue(storageKeys.sidebarState, sidebarStates, "expanded"));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(storageKeys.locale, locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(storageKeys.theme, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.timeWindow, timeWindow);
  }, [timeWindow]);

  useEffect(() => {
    document.documentElement.dataset.sidebar = sidebarState;
    window.localStorage.setItem(storageKeys.sidebarState, sidebarState);
  }, [sidebarState]);

  const value = useMemo<UiPreferencesContextValue>(() => ({
    locale,
    theme,
    timeWindow,
    sidebarState,
    setLocale,
    setTheme,
    setTimeWindow,
    toggleSidebar: () => setSidebarState((current) => (current === "expanded" ? "collapsed" : "expanded")),
    t: (key) => dictionaries[locale][key],
  }), [locale, theme, timeWindow, sidebarState]);

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>;
}

export function useUiPreferences(): UiPreferencesContextValue {
  const context = useContext(UiPreferencesContext);
  if (!context) {
    throw new Error("useUiPreferences must be used inside UiPreferencesProvider");
  }
  return context;
}
