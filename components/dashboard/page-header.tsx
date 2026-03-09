import { ShellCard } from "@/components/dashboard/shell-card";

export function PageHeader({
  eyebrow,
  title,
  summary,
  aside,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  aside?: React.ReactNode;
}) {
  return (
    <ShellCard className="p-5">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">{eyebrow}</p>
          <h1 className="mt-2 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3.4rem)] leading-none text-[var(--text-primary)]">{title}</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-muted)]">{summary}</p>
        </div>
        {aside ? <div className="xl:min-w-[16rem]">{aside}</div> : null}
      </div>
    </ShellCard>
  );
}
