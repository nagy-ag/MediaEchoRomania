"use client";

import { useEffect, useRef, useState } from "react";
import { supportedLocales } from "@/config/ui";
import type { AppLocale } from "@/lib/contracts/ui";
import { ChevronDownIcon } from "@/lib/icons/dashboard-icons";
import { cn } from "@/lib/utils";

interface LocaleMenuProps {
  locale: AppLocale;
  onChange: (locale: AppLocale) => void;
  label: string;
}

export function LocaleMenu({ locale, onChange, label }: LocaleMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={cn("flex h-9 items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--panel-bg)] px-3",
          "text-[7px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]",
          open && "border-[var(--border-strong)] text-[var(--text-primary)] shadow-[var(--shadow-card)]",
        )}
      >
        <span>{locale.toUpperCase()}</span>
        <ChevronDownIcon size={12} className={cn("transition-transform duration-[var(--motion-base)]", open && "rotate-180")} />
      </button>

      <div
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] z-30 w-28 rounded-[16px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-1.5 shadow-[var(--shadow-card)]",
          "transition duration-[var(--motion-base)] ease-[var(--ease-fluid)]",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
        role="menu"
      >
        {supportedLocales.map((option) => {
          const active = option === locale;
          return (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-[12px] px-2.5 py-2 text-left text-[8px] font-medium uppercase tracking-[0.12em]",
                active
                  ? "bg-[var(--accent-surface)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
              )}
            >
              <span>{option.toUpperCase()}</span>
              <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-[var(--accent)]" : "bg-[var(--track-bg)]")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}







