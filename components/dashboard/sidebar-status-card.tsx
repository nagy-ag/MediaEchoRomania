import Link from "next/link";
import { ActivityIcon } from "@/lib/icons/dashboard-icons";
import { cn } from "@/lib/utils";

interface SidebarStatusCardProps {
  href: string;
  label: string;
  score: number;
  subtitle: string;
  expanded: boolean;
  active: boolean;
}

function getTone(score: number) {
  if (score >= 100) {
    return "var(--text-muted)";
  }

  if (score >= 80) {
    return "var(--warning)";
  }

  return "var(--danger)";
}

export function SidebarStatusCard({ href, label, score, subtitle, expanded, active }: SidebarStatusCardProps) {
  const tone = getTone(score);
  const showAttentionMarker = score < 100;
  const showMeta = score < 100;

  if (!expanded) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "relative mt-1 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition duration-[var(--motion-fast)]",
          active
            ? "bg-[var(--accent-surface)] text-[var(--text-primary)]"
            : "hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
        )}
      >
        {active ? (
          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
        ) : null}
        <span className="relative flex h-5 w-5 items-center justify-center">
          <ActivityIcon size={16} />
          {showAttentionMarker ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-[var(--panel-bg)]"
              style={{ backgroundColor: tone }}
            />
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "relative mt-1 flex items-start gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 transition duration-[var(--motion-fast)]",
        active
          ? "bg-[var(--accent-surface)] text-[var(--text-primary)]"
          : "text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]",
      )}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
      ) : null}
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-current">
        <ActivityIcon size={16} />
        {showAttentionMarker ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-[var(--panel-bg)]"
            style={{ backgroundColor: tone }}
          />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          {showMeta ? (
            <span className="[font-family:var(--font-display)] text-lg font-semibold leading-none" style={{ color: tone }}>
              {score}%
            </span>
          ) : null}
        </div>
        {showMeta ? <p className="mt-1 text-[11px] text-[var(--text-subtle)]">{subtitle}</p> : null}
      </div>
    </Link>
  );
}
