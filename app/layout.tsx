import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import { Manrope, Sora } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import {
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
import { DetailDrawerProvider } from "@/features/shell/detail-drawer";
import { DashboardShell } from "@/features/shell/dashboard-shell";
import { UiPreferencesProvider } from "@/features/shell/ui-preferences";
import "./globals.css";

const bodyFont = Manrope({ variable: "--font-body", subsets: ["latin"] });
const displayFont = Sora({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Media Echo Romania",
  description: "Romanian media intelligence and comparison platform.",
};

function getAllowedValue<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialLocale = getAllowedValue(cookieStore.get(preferenceStorageKeys.locale)?.value, supportedLocales, defaultLocale);
  const initialTheme = getAllowedValue(cookieStore.get(preferenceStorageKeys.theme)?.value, supportedThemes, defaultTheme);
  const initialTimeWindow = getAllowedValue(cookieStore.get(preferenceStorageKeys.timeWindow)?.value, supportedTimeWindows, defaultTimeWindow);
  const initialSidebarState = getAllowedValue(cookieStore.get(preferenceStorageKeys.sidebarState)?.value, supportedSidebarStates, defaultSidebarState);

  const preferenceBootstrapScript = `
    (function () {
      try {
        var root = document.documentElement;
        var keys = ${JSON.stringify(preferenceStorageKeys)};
        var allowed = {
          locale: ${JSON.stringify(supportedLocales)},
          theme: ${JSON.stringify(supportedThemes)},
          sidebarState: ${JSON.stringify(supportedSidebarStates)}
        };
        var locale = localStorage.getItem(keys.locale);
        var theme = localStorage.getItem(keys.theme);
        var sidebarState = localStorage.getItem(keys.sidebarState);
        if (allowed.locale.indexOf(locale) !== -1) root.lang = locale;
        if (allowed.theme.indexOf(theme) !== -1) root.dataset.theme = theme;
        if (allowed.sidebarState.indexOf(sidebarState) !== -1) root.dataset.sidebar = sidebarState;
      } catch (error) {}
    })();
  `;

  return (
    <ClerkProvider>
      <html lang={initialLocale} data-theme={initialTheme} data-sidebar={initialSidebarState} suppressHydrationWarning>
        <body className={`${bodyFont.variable} ${displayFont.variable}`}>
          <script dangerouslySetInnerHTML={{ __html: preferenceBootstrapScript }} />
          <ConvexClientProvider>
            <UiPreferencesProvider
              initialLocale={initialLocale}
              initialTheme={initialTheme}
              initialTimeWindow={initialTimeWindow}
              initialSidebarState={initialSidebarState}
            >
              <DetailDrawerProvider>
                <DashboardShell>{children}</DashboardShell>
              </DetailDrawerProvider>
            </UiPreferencesProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
