import type { EventClusterSummary } from "@/lib/contracts/media-echo";
import { clamp } from "@/lib/utils";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";

interface EventUniverseCardProps {
  title: string;
  events: EventClusterSummary[];
  staggerIndex?: number;
}

export function EventUniverseCard({ title, events, staggerIndex }: EventUniverseCardProps) {
  return (
    <ShellCard className="min-h-[280px]" staggerIndex={staggerIndex}>
      <CardHeader title={title} />

      {/* Grid-based scatter plot */}
      <div className="relative mt-4 h-[200px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)]">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--border-soft) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Event dots */}
        {events.map((event, index) => {
          const size = clamp(12 + event.viralityScore / 6, 14, 36);
          return (
            <div
              key={event.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[scaleIn_400ms_var(--ease-fluid)_both]"
              style={{
                left: `${event.coordinates.x}%`,
                top: `${event.coordinates.y}%`,
                animationDelay: `${300 + index * 80}ms`,
              }}
            >
              <div
                className="rounded-full border border-[var(--border-strong)] bg-[var(--accent-surface)] shadow-[0_0_20px_rgba(200,245,66,0.12)]"
                style={{ width: size, height: size }}
              />
            </div>
          );
        })}

        {/* Decorative line path connecting first two points */}
        {events.length >= 2 ? (
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={`M${events[0].coordinates.x},${events[0].coordinates.y} Q50,50 ${events[1].coordinates.x},${events[1].coordinates.y}`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.3"
              strokeDasharray="2 3"
              opacity="0.4"
            />
          </svg>
        ) : null}
      </div>
    </ShellCard>
  );
}

