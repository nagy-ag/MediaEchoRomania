import type { AppLocale, ThemeMode, TimeWindow } from "@/lib/contracts/ui";

export const supportedLocales: AppLocale[] = ["en", "ro", "hu"];
export const supportedThemes: ThemeMode[] = ["dark", "light"];
export const supportedTimeWindows: TimeWindow[] = ["24h", "48h", "96h"];

export const defaultLocale: AppLocale = "en";
export const defaultTheme: ThemeMode = "dark";
export const defaultTimeWindow: TimeWindow = "24h";
