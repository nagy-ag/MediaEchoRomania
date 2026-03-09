import Link from "next/link";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import type { AuditCardPayload } from "@/lib/contracts/media-echo";

export function AuditCardView({ card }: { card: AuditCardPayload }) {
  return (
    <ShellCard className="space-y-6 p-6 md:p-7" elevated>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">MediaEcho audit export</p>
          <h1 className="mt-3 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-none text-[var(--text-primary)]">{card.articleTitle}</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-muted)]">{card.articleSummary}</p>
        </div>
        <CardBadge tone="accent">{card.viralityScore}%</CardBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Baseline fact</p>
          <p className="mt-3 text-lg leading-8 text-[var(--text-primary)]">{card.baselineFact}</p>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--danger)]">Biased quote</p>
          <p className="mt-3 text-lg leading-8 text-[var(--text-primary)]">&quot;{card.biasedQuote}&quot;</p>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Finding</p>
          <p className="mt-3 text-base leading-8 text-[var(--text-primary)]">{card.finding}</p>
          <div className="mt-4 flex gap-2">
            <Link href={`/events/${card.relatedEventId}`} className="rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--panel-bg)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)]">Open event</Link>
            <Link href={`/profiles/${card.relatedProfileId}`} className="rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--panel-bg)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)]">Open profile</Link>
          </div>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--panel-subtle)] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Omission notes</p>
          <div className="mt-3 space-y-3">
            {card.omissionNotes.map((item) => (
              <div key={item} className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--panel-bg)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)]">{item}</div>
            ))}
          </div>
        </section>
      </div>

      <ShellCard className="p-5">
        <CardHeader title="Evidence" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {card.evidence.map((item) => (
            <div key={item.label} className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">{item.label}</p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </ShellCard>
    </ShellCard>
  );
}


