"use client";

import { startTransition, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { DensityMenu } from "@/components/dashboard/density-menu";
import { AnalystFilterBar } from "@/components/dashboard/filter-bar";
import { LocaleMenu } from "@/components/dashboard/locale-menu";
import { ScrollShadowPanel } from "@/components/dashboard/scroll-shadow-panel";
import { PlatformStatusBar } from "@/components/dashboard/status-bar";
import { ThemeSwitcher } from "@/components/dashboard/theme-switcher";
import { DetailDrawerPanel } from "@/features/shell/detail-drawer";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { useEnsureUserRecord } from "@/lib/convex/use-ensure-user-record";
import { useUpsertDashboardPreferences } from "@/lib/convex/use-platform-data";
import {
  AlertIcon,
  BookOpenIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CompareIcon,
  ContradictionIcon,
  DocumentIcon,
  EntityIcon,
  EventsIcon,
  ExploreIcon,
  GridIcon,
  MapPinIcon,
  OutletsIcon,
  PulseIcon,
  ScalesIcon,
  SearchIcon,
  SidebarClosedIcon,
  SidebarOpenIcon,
  StatusIcon,
  UniverseIcon,
  UserIcon,
} from "@/lib/icons/dashboard-icons";
import { cn } from "@/lib/utils";

interface NavLeaf {
  href: string;
  key:
    | "nav.overview"
    | "nav.morningBrief"
    | "nav.eventUniverse"
    | "nav.events"
    | "nav.outlets"
    | "nav.compareOutlets"
    | "nav.entities"
    | "nav.propagation"
    | "nav.contradictions"
    | "nav.biasPanel"
    | "nav.seasonality"
    | "nav.localVsNational"
    | "nav.explore"
    | "nav.search"
    | "nav.savedViews"
    | "nav.alerts"
    | "nav.docs"
    | "nav.status"
    | "nav.profile";
  icon: ComponentType<{ size?: number; className?: string }>;
}

interface NavSection {
  id: "monitor" | "analysis" | "workspace";
  labelKey: "nav.monitor" | "nav.analysisSection" | "nav.workspace";
  icon: ComponentType<{ size?: number; className?: string }>;
  items: NavLeaf[];
}

const directNavItems: NavLeaf[] = [
  { href: "/", key: "nav.overview", icon: GridIcon },
  { href: "/morning-brief", key: "nav.morningBrief", icon: DocumentIcon },
];

const monitorItems: NavLeaf[] = [
  { href: "/event-universe", key: "nav.eventUniverse", icon: UniverseIcon },
  { href: "/events", key: "nav.events", icon: EventsIcon },
  { href: "/outlets", key: "nav.outlets", icon: OutletsIcon },
  { href: "/compare-outlets", key: "nav.compareOutlets", icon: CompareIcon },
  { href: "/entities", key: "nav.entities", icon: EntityIcon },
];

const analysisItems: NavLeaf[] = [
  { href: "/propagation", key: "nav.propagation", icon: PulseIcon },
  { href: "/contradictions", key: "nav.contradictions", icon: ContradictionIcon },
  { href: "/bias-panel", key: "nav.biasPanel", icon: ScalesIcon },
  { href: "/seasonality", key: "nav.seasonality", icon: CalendarIcon },
  { href: "/local-vs-national", key: "nav.localVsNational", icon: MapPinIcon },
  { href: "/explore", key: "nav.explore", icon: ExploreIcon },
  { href: "/search", key: "nav.search", icon: SearchIcon },
];

const bottomNavItems: NavLeaf[] = [
  { href: "/docs", key: "nav.docs", icon: BookOpenIcon },
  { href: "/status", key: "nav.status", icon: StatusIcon },
];

const densityOptions = ["comfortable", "compact", "analyst"] as const;
const anonymousBannerSessionKey = "mediaecho-anon-banner-dismissed";

function matchesPath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveSectionId(pathname: string, navSections: NavSection[]) {
  return navSections.find((section) => section.items.some((item) => matchesPath(pathname, item.href)))?.id ?? null;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  useEnsureUserRecord();
  const upsertPreferences = useUpsertDashboardPreferences();
  const {
    locale,
    setLocale,
    sidebarState,
    t,
    toggleSidebar,
    analystControlsCollapsed,
    toggleAnalystControls,
    density,
    setDensity,
  } = useUiPreferences();

  const workspaceItems: NavLeaf[] = isSignedIn
    ? [
        { href: "/profile", key: "nav.profile", icon: UserIcon },
        { href: "/saved-views", key: "nav.savedViews", icon: DocumentIcon },
        { href: "/alerts", key: "nav.alerts", icon: AlertIcon },
      ]
    : [
        { href: "/saved-views", key: "nav.savedViews", icon: DocumentIcon },
        { href: "/alerts", key: "nav.alerts", icon: AlertIcon },
      ];

  const navSections: NavSection[] = [
    { id: "monitor", labelKey: "nav.monitor", icon: UniverseIcon, items: monitorItems },
    { id: "analysis", labelKey: "nav.analysisSection", icon: PulseIcon, items: analysisItems },
    { id: "workspace", labelKey: "nav.workspace", icon: UserIcon, items: workspaceItems },
  ];

  const activeSectionId = getActiveSectionId(pathname, navSections);
  const [expandedSection, setExpandedSection] = useState<NavSection["id"] | null>(activeSectionId);
  const [flyoutSection, setFlyoutSection] = useState<NavSection["id"] | null>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const [showAnonymousBanner, setShowAnonymousBanner] = useState(false);
  const railWrapperRef = useRef<HTMLDivElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const sectionButtonRefs = useRef<Partial<Record<NavSection["id"], HTMLButtonElement | null>>>({});
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      setShowAnonymousBanner(false);
      return;
    }

    try {
      const dismissed = window.sessionStorage.getItem(anonymousBannerSessionKey) === "true";
      setShowAnonymousBanner(!dismissed);
    } catch {
      setShowAnonymousBanner(true);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      setExpandedSection(activeSectionId);
      setFlyoutSection(null);
    }
  }, [activeSectionId, pathname]);

  useEffect(() => {
    setExpandedSection((current) => {
      if (current === "workspace" && !workspaceItems.some((item) => matchesPath(pathname, item.href))) {
        return activeSectionId;
      }
      return current;
    });
  }, [activeSectionId, pathname, workspaceItems]);

  useEffect(() => {
    if (sidebarState === "expanded") {
      setFlyoutSection(null);
    }
  }, [sidebarState]);

  useEffect(() => {
    if (!flyoutSection) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const button = sectionButtonRefs.current[flyoutSection];
      if (flyoutRef.current?.contains(target) || button?.contains(target)) {
        return;
      }
      setFlyoutSection(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFlyoutSection(null);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flyoutSection]);

  const isExpanded = sidebarState === "expanded";
  const openFlyoutSection = flyoutSection ? navSections.find((section) => section.id === flyoutSection) ?? null : null;
  const canPersistPreferences = isSignedIn && isAuthenticated && !isLoading;

  const updateFlyoutPosition = (sectionId: NavSection["id"]) => {
    const wrapperRect = railWrapperRef.current?.getBoundingClientRect();
    const buttonRect = sectionButtonRefs.current[sectionId]?.getBoundingClientRect();
    if (!wrapperRect || !buttonRect) {
      return;
    }
    setFlyoutTop(buttonRect.top - wrapperRect.top);
  };

  const handleSectionToggle = (sectionId: NavSection["id"]) => {
    if (isExpanded) {
      setExpandedSection((current) => (current === sectionId ? null : sectionId));
      return;
    }

    updateFlyoutPosition(sectionId);
    setFlyoutSection((current) => (current === sectionId ? null : sectionId));
  };

  const dismissAnonymousBanner = () => {
    try {
      window.sessionStorage.setItem(anonymousBannerSessionKey, "true");
    } catch {
      // Ignore storage failures and still hide for this render.
    }
    setShowAnonymousBanner(false);
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex h-full max-w-[128rem] gap-3 px-3 py-3 md:gap-4 md:px-4 md:py-4">
        <div ref={railWrapperRef} className="relative hidden shrink-0 md:block">
          <aside
            className={cn(
              "flex h-full flex-col rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-[var(--shadow-shell)]",
              "transition-[width,padding] duration-[var(--motion-slow)] ease-[var(--ease-fluid)] overflow-hidden",
              isExpanded ? "w-[320px] p-6" : "w-[84px] items-center px-4 py-6",
            )}
          >
            <div className={cn("flex items-start", isExpanded ? "justify-between" : "justify-center")}>
              <Link href="/" className="flex min-w-0 items-start gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-black">
                  <Image src="/logo/logo.png" alt="Media Echo logo" fill className="object-cover" />
                </div>
                {isExpanded ? (
                  <div className="min-w-0 pt-0.5">
                    <p className="truncate [font-family:var(--font-display)] text-sm font-bold tracking-wide text-[var(--text-primary)]">{t("app.name")}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-subtle)]">{t("app.tagline")}</p>
                  </div>
                ) : null}
              </Link>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              {directNavItems.map((item) => (
                <PrimaryNavItem
                  key={item.href}
                  href={item.href}
                  label={t(item.key)}
                  icon={item.icon}
                  active={matchesPath(pathname, item.href)}
                  expanded={isExpanded}
                />
              ))}

              {navSections.map((section) => {
                const sectionActive = section.items.some((item) => matchesPath(pathname, item.href));
                const sectionOpen = isExpanded && expandedSection === section.id;
                const SectionIcon = section.icon;

                return (
                  <div key={section.id} className="rounded-[18px] border border-transparent bg-transparent">
                    <button
                      ref={(node) => {
                        sectionButtonRefs.current[section.id] = node;
                      }}
                      type="button"
                      onClick={() => handleSectionToggle(section.id)}
                      title={!isExpanded ? t(section.labelKey) : undefined}
                      aria-expanded={isExpanded ? sectionOpen : flyoutSection === section.id}
                      aria-label={t(section.labelKey)}
                      className={cn(
                        "flex w-full items-center rounded-[16px] text-left transition duration-[var(--motion-fast)]",
                        isExpanded ? "gap-3 px-3 py-2.5" : "h-11 w-11 justify-center",
                        sectionActive || flyoutSection === section.id
                          ? "bg-[var(--accent-surface)] text-[var(--text-primary)]"
                          : "text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      <SectionIcon size={14} />
                      {isExpanded ? (
                        <>
                          <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.16em]">{t(section.labelKey)}</span>
                          {sectionOpen ? <ChevronDownIcon size={13} /> : <ChevronRightIcon size={13} />}
                        </>
                      ) : null}
                    </button>

                    {sectionOpen ? (
                      <div className="mt-1.5 ml-[12px] flex flex-col gap-1.5 border-l border-[var(--border-soft)] pl-3.5">
                        {section.items.map((item) => (
                          <ChildNavItem
                            key={item.href}
                            href={item.href}
                            label={t(item.key)}
                            icon={item.icon}
                            active={matchesPath(pathname, item.href)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-auto" />

            <div className="mt-6 border-t border-[var(--border-soft)] pt-4">
              <div className="flex flex-col gap-1.5">
                {bottomNavItems.map((item) => (
                  <PrimaryNavItem
                    key={item.href}
                    href={item.href}
                    label={t(item.key)}
                    icon={item.icon}
                    active={matchesPath(pathname, item.href)}
                    expanded={isExpanded}
                  />
                ))}
              </div>
            </div>
          </aside>

          {!isExpanded && openFlyoutSection ? (
            <div
              ref={flyoutRef}
              className="absolute left-[calc(100%+0.75rem)] z-30 w-[260px] rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-3 shadow-[var(--shadow-shell)] backdrop-blur"
              style={{ top: `${Math.max(flyoutTop - 6, 0)}px` }}
            >
              <div className="px-2 pb-2 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)]">{t(openFlyoutSection.labelKey)}</p>
              </div>
              <div className="flex flex-col gap-1">
                {openFlyoutSection.items.map((item) => (
                  <ChildNavItem
                    key={item.href}
                    href={item.href}
                    label={t(item.key)}
                    icon={item.icon}
                    active={matchesPath(pathname, item.href)}
                    onNavigate={() => setFlyoutSection(null)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 gap-4 overflow-visible px-1 py-1">
          <div className="flex min-w-0 flex-1 flex-col overflow-visible rounded-[var(--radius-xl)] shadow-[var(--shadow-shell)]">
            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--panel-bg)]">
              <header className="shrink-0 border-b border-[var(--border-soft)] px-3 py-2 md:px-4 md:py-3">
                <div className="flex flex-col gap-2.5 xl:grid xl:grid-cols-[auto_minmax(24rem,1fr)_auto] xl:items-center xl:gap-4">
                  <div className="hidden xl:block">
                    <button
                      type="button"
                      onClick={toggleSidebar}
                      className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      aria-label={t("controls.toggleSidebar")}
                    >
                      {isExpanded ? <SidebarOpenIcon size={15} /> : <SidebarClosedIcon size={15} />}
                    </button>
                  </div>

                  <Link href="/search" className="flex h-10 w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 text-[var(--text-subtle)]">
                    <SearchIcon size={15} className="shrink-0" />
                    <span className="truncate text-xs">{t("controls.search")}</span>
                  </Link>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={toggleAnalystControls}
                      title={analystControlsCollapsed ? t("controls.showAnalystControls") : t("controls.hideAnalystControls")}
                      aria-label={analystControlsCollapsed ? t("controls.showAnalystControls") : t("controls.hideAnalystControls")}
                      className="flex h-9 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 text-xs text-[var(--text-primary)]"
                    >
                      <ChevronDownIcon size={14} className={cn("transition-transform duration-[var(--motion-fast)]", analystControlsCollapsed ? "rotate-0" : "rotate-180")} />
                      <span className="hidden lg:inline">{t("controls.analystControls")}</span>
                    </button>
                    <DensityMenu
                      value={density}
                      ariaLabel={t("profile.density")}
                      options={densityOptions.map((option) => ({
                        label: option,
                        value: option,
                      }))}
                      onChange={(value) => {
                        const nextDensity = value as (typeof densityOptions)[number];
                        setDensity(nextDensity);
                        if (canPersistPreferences) {
                          startTransition(() => {
                            void upsertPreferences({ density: nextDensity, pinnedWidgets: [] });
                          });
                        }
                      }}
                    />
                    <LocaleMenu locale={locale} onChange={setLocale} label={t("controls.languageMenu")} />
                    <ThemeSwitcher />
                    {isSignedIn ? (
                      <UserButton />
                    ) : (
                      <SignInButton mode="modal">
                        <button type="button" className="rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs text-[var(--text-primary)]">
                          {t("controls.signIn")}
                        </button>
                      </SignInButton>
                    )}
                  </div>
                </div>
              </header>

              {showAnonymousBanner ? (
                <div className="pointer-events-none absolute left-4 right-4 top-3 z-20 flex justify-center md:left-auto md:max-w-[38rem] md:justify-end">
                  <div className="pointer-events-auto flex w-full max-w-[38rem] items-start gap-3 rounded-[20px] border border-dashed border-[var(--border-strong)] bg-[color:color-mix(in_srgb,var(--panel-bg)_88%,white_12%)] px-4 py-3 shadow-[0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur md:w-auto">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] text-[var(--text-primary)]">
                      <AlertIcon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">{t("banner.publicAccessTitle")}</p>
                        <span className="rounded-full border border-[var(--border-soft)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">Info</span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">{t("banner.publicAccessBody")}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <SignInButton mode="modal">
                          <button type="button" className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-contrast)]">
                            {t("controls.signIn")}
                          </button>
                        </SignInButton>
                        <button
                          type="button"
                          onClick={dismissAnonymousBanner}
                          className="rounded-full border border-[var(--border-soft)] px-2.5 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          aria-label={t("banner.dismiss")}
                        >
                          x
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-[var(--motion-slow)] ease-[var(--ease-fluid)]",
                  analystControlsCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <AnalystFilterBar />
                </div>
              </div>

              <ScrollShadowPanel className="min-h-0 flex-1" contentClassName="px-3 pb-3 pt-3 md:px-4 md:pb-4 md:pt-4">
                <main className="min-w-0">{children}</main>
              </ScrollShadowPanel>

              <PlatformStatusBar />
            </div>
          </div>

          <DetailDrawerPanel />
        </div>
      </div>
    </div>
  );
}

function PrimaryNavItem({
  href,
  label,
  icon: Icon,
  active,
  expanded,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  expanded: boolean;
}) {
  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      aria-label={label}
      className={cn(
        "group relative flex items-center rounded-[16px] transition duration-[var(--motion-fast)]",
        expanded ? "gap-3 px-3 py-2.5" : "h-11 w-11 justify-center",
        active ? "bg-[var(--accent-surface)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
      )}
    >
      <Icon size={14} />
      {expanded ? <span className="text-sm font-medium">{label}</span> : null}
    </Link>
  );
}

function ChildNavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-[14px] px-2.5 py-2 text-[13px] leading-5 transition duration-[var(--motion-fast)]",
        active ? "bg-[var(--accent-surface)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
      )}
    >
      <Icon size={13} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

