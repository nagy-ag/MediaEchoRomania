import Link from "next/link";
import type { CoverageHeatmapCell } from "@/lib/contracts/media-echo";
import { CardHeader } from "@/components/dashboard/card-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { clamp } from "@/lib/utils";

interface CoverageGridCardProps {
  title: string;
  rows: Array<{ id: string; label: string }>;
  columns: Array<{ id: string; label: string }>;
  cells: CoverageHeatmapCell[];
  emptyLabel: string;
}

export function CoverageGridCard({ title, rows, columns, cells, emptyLabel }: CoverageGridCardProps) {
  return (
    <ShellCard>
      <CardHeader title={title} />
      <div className="mt-5 overflow-x-auto rounded-[24px] border border-[var(--border-soft)]">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `minmax(220px, 1.4fr) repeat(${Math.max(columns.length, 1)}, minmax(110px, 1fr))` }}>
          <div className="border-b border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
            Event / outlet
          </div>
          {columns.map((column) => (
            <div key={column.id} className="border-b border-l border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 py-3 text-center text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              {column.label}
            </div>
          ))}
          {rows.map((row) => (
            <CoverageRow key={row.id} row={row} columns={columns} cells={cells} emptyLabel={emptyLabel} />
          ))}
        </div>
      </div>
    </ShellCard>
  );
}

function CoverageRow({
  row,
  columns,
  cells,
  emptyLabel,
}: {
  row: { id: string; label: string };
  columns: Array<{ id: string; label: string }>;
  cells: CoverageHeatmapCell[];
  emptyLabel: string;
}) {
  return (
    <>
      <div className="border-b border-[var(--border-soft)] bg-[var(--panel-bg)] px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
        {row.label}
      </div>
      {columns.map((column) => {
        const cell = cells.find((item) => item.eventId === row.id && item.outletId === column.id);
        const score = cell ? clamp(Math.round(cell.score * 100), 0, 100) : 0;
        const background = `color-mix(in srgb, var(--danger) ${Math.max(score, 8)}%, var(--panel-subtle))`;
        const border = `color-mix(in srgb, var(--danger) ${Math.max(score / 2, 8)}%, var(--border-soft))`;

        return (
          <div key={column.id} className="border-b border-l border-[var(--border-soft)] bg-[var(--panel-bg)] p-2">
            {cell ? (
              <Link
                href={`/profiles/${column.id}`}
                className="flex h-full min-h-[70px] flex-col justify-between rounded-[18px] border px-3 py-2 text-left transition hover:-translate-y-0.5"
                style={{ backgroundColor: background, borderColor: border }}
              >
                <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{score}%</span>
                <span className="text-xs leading-5 text-[var(--text-primary)]">{cell.eventTitle}</span>
              </Link>
            ) : (
              <div className="flex min-h-[70px] items-center justify-center rounded-[18px] border border-dashed border-[var(--border-soft)] bg-[var(--panel-subtle)] px-3 text-center text-xs text-[var(--text-subtle)]">
                {emptyLabel}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

