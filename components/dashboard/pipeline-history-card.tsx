import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";
import type { PipelineStatusHistoryPoint } from "@/lib/contracts/media-echo";

function getTone(score: number) {
  if (score >= 100) {
    return "var(--accent)";
  }

  if (score >= 80) {
    return "var(--warning)";
  }

  return "var(--danger)";
}

export function PipelineHistoryCard({ title, history }: { title: string; history: PipelineStatusHistoryPoint[] }) {
  const midpoint = history[Math.floor(history.length / 2)];

  return (
    <ShellCard>
      <CardHeader title={title} />
      <div className="mt-5 grid grid-cols-10 gap-2 sm:grid-cols-15">
        {history.map((point) => (
          <div key={point.date} className="space-y-2">
            <div
              className="h-12 rounded-[12px] border border-[var(--border-soft)]"
              style={{ backgroundColor: `color-mix(in srgb, ${getTone(point.score)} 20%, var(--panel-subtle))` }}
              title={`${point.date}: ${point.score}%`}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        <span>{history[0]?.date.slice(5) ?? "-"}</span>
        <span>{midpoint?.date.slice(5) ?? "-"}</span>
        <span>{history[history.length - 1]?.date.slice(5) ?? "-"}</span>
      </div>
    </ShellCard>
  );
}
