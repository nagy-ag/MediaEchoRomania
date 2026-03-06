import { ShellCard } from "@/components/dashboard/shell-card";
import type { AuditCardPayload } from "@/lib/contracts/media-echo";

export function AuditCardView({ card }: { card: AuditCardPayload }) {
  return (
    <ShellCard className="space-y-6 p-6 md:p-7" elevated>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
            MediaEcho audit export
          </p>
          <h1 className="mt-3 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-none text-[var(--text-primary)]">
            {card.eventTitle}
          </h1>
        </div>
        <span className="rounded-full border border-[var(--border-strong)] bg-[var(--accent-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]">
          {card.outletName}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Baseline fact</p>
          <p className="mt-3 text-lg leading-8 text-[var(--text-primary)]">{card.baselineFact}</p>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--danger)]">Biased quote</p>
          <p className="mt-3 text-lg leading-8 text-[var(--text-primary)]">"{card.biasedQuote}"</p>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Finding</p>
          <p className="mt-3 text-base leading-8 text-[var(--text-primary)]">{card.finding}</p>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Export caption</p>
          <p className="mt-3 text-base leading-8 text-[var(--text-primary)]">{card.exportCaption}</p>
        </section>
      </div>
    </ShellCard>
  );
}







