import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardHeaderProps {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  right?: ReactNode;
}

export function CardHeader({ title, eyebrow, icon, badge, right }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--panel-subtle)] text-[var(--text-muted)]">
            {icon}
          </div>
        ) : null}
        <div>
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{eyebrow}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <h2 className="[font-family:var(--font-display)] text-[1.05rem] font-semibold leading-tight text-[var(--text-primary)]">
              {title}
            </h2>
            {badge}
          </div>
        </div>
      </div>
      {right}
    </div>
  );
}

/** Small accent badge used in card headers */
export function CardBadge({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "warning" | "danger" | "muted";
}) {
  const toneClasses =
    tone === "warning"
      ? "bg-[var(--warning)]/15 text-[var(--warning)]"
      : tone === "danger"
        ? "bg-[var(--danger)]/15 text-[var(--danger)]"
        : tone === "muted"
          ? "bg-[var(--panel-subtle)] text-[var(--text-muted)]"
          : "bg-[var(--accent-surface)] text-[var(--accent)]";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", toneClasses)}>
      {children}
    </span>
  );
}

/** Pulsing live indicator dot */
export function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inset-0 animate-[pulseGlow_2s_ease-in-out_infinite] rounded-full bg-[var(--accent)]" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
    </span>
  );
}






