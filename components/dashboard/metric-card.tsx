import { ShellCard } from "@/components/dashboard/shell-card";

export function MetricCard({
  label,
  value,
  delta,
  status,
}: {
  label: string;
  value: string;
  delta: string;
  status: string;
}) {
  return (
    <ShellCard className="p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">{label}</p>
      <p className="mt-3 [font-family:var(--font-display)] text-3xl leading-none text-[var(--text-primary)]">{value}</p>
      <p className="mt-3 text-xs text-[var(--text-muted)]">{delta}</p>
      <p className="mt-1 text-xs text-[var(--text-subtle)]">{status}</p>
    </ShellCard>
  );
}
