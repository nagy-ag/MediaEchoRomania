"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/lib/icons/dashboard-icons";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownMenuProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  triggerLabel?: string;
  ariaLabel: string;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  align?: "left" | "right";
  compact?: boolean;
}

export function DropdownMenu({
  value,
  options,
  onChange,
  triggerLabel,
  ariaLabel,
  className,
  triggerClassName,
  panelClassName,
  align = "left",
  compact = false,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentOption = options.find((option) => option.value === value) ?? options[0];

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
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-subtle)] text-[var(--text-muted)] transition duration-[var(--motion-fast)]",
          compact ? "h-8 px-2.5 text-[11px]" : "h-9 px-3 text-xs",
          open && "border-[var(--border-strong)] text-[var(--text-primary)] shadow-[var(--shadow-card)]",
          triggerClassName,
        )}
      >
        {triggerLabel ? <span className="whitespace-nowrap">{triggerLabel}</span> : null}
        <span className="truncate text-[var(--text-primary)]">{currentOption?.label}</span>
        <ChevronDownIcon size={12} className={cn("shrink-0 transition-transform duration-[var(--motion-base)]", open && "rotate-180")} />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute top-[calc(100%+8px)] z-30 min-w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-1.5 shadow-[var(--shadow-card)]",
          "transition duration-[var(--motion-base)] ease-[var(--ease-fluid)]",
          align === "right" ? "right-0" : "left-0",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
          panelClassName,
        )}
      >
        {options.map((option) => {
          const active = option.value === currentOption?.value;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2 text-left text-[12px]",
                active
                  ? "bg-[var(--accent-surface)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
              )}
            >
              <span>{option.label}</span>
              <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-[var(--accent)]" : "bg-[var(--track-bg)]")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}