import type { ActivityFeedItem } from "@/lib/contracts/media-echo";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";
import { ChevronRightIcon, FilterIcon } from "@/lib/icons/dashboard-icons";

interface ActivityFeedCardProps {
  title: string;
  items: ActivityFeedItem[];
  staggerIndex?: number;
}

const severityDotColor = {
  low: "bg-[var(--accent)]",
  medium: "bg-[var(--warning)]",
  high: "bg-[var(--danger)]",
} as const;

export function ActivityFeedCard({ title, items, staggerIndex }: ActivityFeedCardProps) {
  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <CardHeader
        title={title}
        right={
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-subtle)] transition hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]"
          >
            <FilterIcon size={16} />
          </button>
        }
      />
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3 transition-colors hover:border-[var(--border-strong)]"
            style={{ animationDelay: `${(staggerIndex ?? 0) * 60 + index * 40}ms` }}
          >
            {/* Severity dot */}
            <span className={`h-2 w-2 shrink-0 rounded-full ${severityDotColor[item.severity]}`} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">{item.headline}</p>
                <span className="shrink-0 text-[11px] text-[var(--text-subtle)]">{item.meta}</span>
              </div>
              <p className="mt-0.5 truncate text-xs leading-5 text-[var(--text-muted)]">{item.detail}</p>
            </div>

            <ChevronRightIcon
              size={14}
              className="shrink-0 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
            />
          </article>
        ))}
      </div>
    </ShellCard>
  );
}




