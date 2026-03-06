import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { DashboardShell } from "@/features/shell/dashboard-shell";
import { UiPreferencesProvider } from "@/features/shell/ui-preferences";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediaEcho Romania",
  description: "Dashboard-first frontend for Romanian media forensics, narrative drift, and outlet comparison.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" data-sidebar="expanded" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <ConvexClientProvider>
          <UiPreferencesProvider>
            <DashboardShell>{children}</DashboardShell>
          </UiPreferencesProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
