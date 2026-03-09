"use client";

import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supportedTimeWindows } from "@/config/ui";
import { usePipelineStatus } from "@/data/convex/use-media-data";
import { ScrollShadowPanel } from "@/components/dashboard/scroll-shadow-panel";
import { ThemeSwitcher } from "@/components/dashboard/theme-switcher";
import { LocaleMenu } from "@/components/dashboard/locale-menu";
import { SidebarStatusCard } from "@/components/dashboard/sidebar-status-card";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import {
  ActivityIcon,
  AuditIcon,
  BookOpenIcon,
  CompareIcon,
  EventsIcon,
  GridIcon,
  MapPinIcon,
  OutletsIcon,
  SearchIcon,
  SidebarClosedIcon,
  SidebarOpenIcon,
  UserIcon,
} from "@/lib/icons/dashboard-icons";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", key: "nav.briefing" as const, icon: GridIcon },
  { href: "/events", key: "nav.universe" as const, icon: EventsIcon },
  { href: "/coverage-gaps", key: "nav.coverageGaps" as const, icon: ActivityIcon },
  { href: "/national-vs-local", key: "nav.typology" as const, icon: MapPinIcon },
  { href: "/compare", key: "nav.compareOutlets" as const, icon: CompareIcon },
];

const analyticsNavItems = [
  { href: "/profiles", key: "nav.profiles" as const, icon: OutletsIcon },
  { href: "/search", key: "nav.search" as const, icon: SearchIcon },
  { href: "/saved-audits", key: "nav.savedAudits" as const, icon: AuditIcon },
];
const resourceNavItems = [{ href: "/docs", key: "nav.docs" as const, icon: BookOpenIcon }];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, sidebarState, t, timeWindow, setTimeWindow, toggleSidebar } =
    useUiPreferences();

  const isExpanded = sidebarState === "expanded";
  const pipelineStatus = usePipelineStatus(timeWindow);
  const pipelineStatusSubtitle =
    pipelineStatus?.status === "healthy"
      ? t("status.shortHealthy")
      : pipelineStatus?.status === "degraded"
        ? t("status.shortDegraded")
        : pipelineStatus?.status === "critical"
          ? t("status.shortCritical")
          : t("status.monitoring");
  const pipelineStatusScore = pipelineStatus?.score ?? 0;

  return (
    <div className="h-[100dvh] overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex h-full max-w-[120rem] gap-3 px-3 py-3 md:gap-4 md:px-4 md:py-4">
        <aside
          className={cn(
            "hidden md:flex md:h-full md:self-start md:flex-col rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-[var(--shadow-shell)]",
            "transition-[width,padding] duration-[var(--motion-slow)] ease-[var(--ease-fluid)] overflow-hidden",
            isExpanded ? "w-[260px] p-5" : "w-[72px] items-center px-3 py-5",
          )}
        >
          <div className={cn("flex items-center", isExpanded ? "justify-between" : "justify-center")}>
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-black">
                <Image src="/logo/logo.png" alt="MediaEcho logo" fill className="object-cover" />
              </div>
              {isExpanded ? (
                <div className="min-w-0 transition-opacity duration-[var(--motion-base)]">
                  <p className="truncate [font-family:var(--font-display)] text-sm font-bold tracking-wide text-[var(--text-primary)]">
                    {t("app.name")}
                  </p>
                  <p className="text-[11px] text-[var(--text-subtle)]">Narrative operations</p>
                </div>
              ) : null}
            </Link>
          </div>

          <nav className="mt-6 flex flex-col gap-1">
            {isExpanded ? (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                {t("nav.groupMain")}
              </p>
            ) : null}
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={t(item.key)}
                icon={item.icon}
                active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                expanded={isExpanded}
              />
            ))}
          </nav>

          <nav className="mt-6 flex flex-col gap-1">
            {isExpanded ? (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                {t("nav.groupAnalytics")}
              </p>
            ) : null}
            {analyticsNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={t(item.key)}
                icon={item.icon}
                active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                expanded={isExpanded}
              />
            ))}
          </nav>

          <div className="mt-auto" />

          <div className={cn("mt-3 flex flex-col gap-1", !isExpanded && "items-center")}>
            {isExpanded ? (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                {t("nav.groupResources")}
              </p>
            ) : null}
            {resourceNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={t(item.key)}
                icon={item.icon}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                expanded={isExpanded}
              />
            ))}
            <SidebarStatusCard
              href="/status"
              label={t("nav.status")}
              score={pipelineStatusScore}
              subtitle={pipelineStatusSubtitle}
              expanded={isExpanded}
              active={pathname === "/status"}
            />
          </div>

          <div
            className={cn(
              "mt-5 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)]",
              isExpanded ? "px-3 py-3" : "justify-center p-2.5",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-surface)] text-[var(--accent)]">
              <UserIcon size={14} />
            </div>
            {isExpanded ? (
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--text-primary)]">Ion Popescu</p>
                <p className="truncate text-[11px] text-[var(--text-subtle)]">popescu@gmail.com</p>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-[var(--shadow-shell)]">
          <header className="shrink-0 border-b border-[var(--border-soft)] px-3 py-2 md:px-4 md:py-2.5">
            <div className="flex flex-col gap-2.5 md:grid md:grid-cols-[auto_minmax(24rem,38rem)_1fr] md:items-center md:gap-4">
              <div className="relative hidden md:block group">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] text-[var(--text-muted)] transition hover:bg-[var(--panel-bg)] hover:text-[var(--text-primary)]"
                  aria-label={t("controls.toggleSidebar")}
                 
                >
                  {isExpanded ? <SidebarOpenIcon size={15} /> : <SidebarClosedIcon size={15} />}
                </button>
                <span className="pointer-events-none absolute left-full top-[calc(100%+8px)] z-40 ml-2 -translate-x-1/2 whitespace-nowrap rounded-[10px] border border-[var(--border-soft)] bg-[var(--panel-bg)] px-2 py-1 text-[10px] font-medium text-[var(--text-muted)] opacity-0 shadow-[var(--shadow-card)] transition duration-[var(--motion-fast)] group-hover:translate-y-0 group-hover:opacity-100">
                  {t("controls.toggleSidebar")}
                </span>
              </div>

              <Link href="/search" className="mx-auto flex h-9 w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 text-[var(--text-subtle)] md:max-w-[38rem]">
                <SearchIcon size={15} className="shrink-0" />
                <span className="truncate text-xs">{t("controls.search")}</span>
              </Link>

              <div className="flex items-center justify-end gap-1.5">
                <SegmentedControl
                  options={supportedTimeWindows.map((windowOption) => ({
                    label: windowOption,
                    active: timeWindow === windowOption,
                    onClick: () => setTimeWindow(windowOption),
                  }))}
                />
                <LocaleMenu locale={locale} onChange={setLocale} label={t("controls.languageMenu")} />
                <ThemeSwitcher />
              </div>
            </div>
          </header>

          <ScrollShadowPanel className="min-h-0 flex-1" contentClassName="px-3 pb-3 pt-3 md:px-4 md:pb-4 md:pt-4">
            <main className="min-w-0">{children}</main>
          </ScrollShadowPanel>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  expanded,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  active: boolean;
  expanded: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center rounded-[var(--radius-sm)] transition duration-[var(--motion-fast)]",
        expanded ? "gap-3 px-3 py-2.5" : "h-10 w-10 justify-center",
        active
          ? "bg-[var(--accent-surface)] text-[var(--text-primary)]"
          : "text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
      )}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
      ) : null}
      <Icon size={16} />
      {expanded ? <span className="text-sm font-medium">{label}</span> : null}
    </Link>
  );
}

function SegmentedControl({
  options,
}: {
  options: Array<{ label: string; active: boolean; onClick: () => void }>;
}) {
  return (
    <div className="flex h-9 items-center gap-[2px] rounded-full border border-[var(--border-soft)] bg-[var(--panel-bg)] p-[2px]">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={option.onClick}
          className={cn("flex h-full items-center rounded-full px-2 text-[6px] font-medium leading-none transition duration-[var(--motion-fast)]",
            option.active
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}











