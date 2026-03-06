import type { ComparisonMetric, ComparisonRow } from "@/lib/contracts/media-echo";
import { formatPercent } from "@/lib/utils";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";

export function ComparisonTableCard({
  title,
  metrics,
  rows,
}: {
  title: string;
  metrics: ComparisonMetric[];
  rows: ComparisonRow[];
}) {
  return (
    <ShellCard>
      <CardHeader title={title} />
      <div className="mt-5 overflow-x-auto rounded-[24px] border border-[var(--border-soft)]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[var(--panel-subtle)] text-left text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
              <th className="px-4 py-3">Outlet</th>
              {metrics.map((metric) => (
                <th key={metric.id} className="min-w-[150px] px-4 py-3">{metric.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.outletId} className="border-t border-[var(--border-soft)] bg-[var(--panel-bg)]">
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{row.outletName}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{row.typology}</p>
                </td>
                {metrics.map((metric) => {
                  const value = row.metrics[metric.id];
                  const tone = metric.emphasis === "critical" ? "var(--danger)" : metric.emphasis === "warning" ? "var(--warning)" : "var(--accent)";
                  return (
                    <td key={metric.id} className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--track-bg)]">
                          <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: tone }} />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-muted)]">{formatPercent(value)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ShellCard>
  );
}





