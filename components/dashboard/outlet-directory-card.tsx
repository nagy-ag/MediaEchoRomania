import Link from "next/link";
import type { OutletSummary } from "@/lib/contracts/media-echo";
import { ShellCard } from "@/components/dashboard/shell-card";
import { CardHeader } from "@/components/dashboard/card-header";

export function OutletDirectoryCard({
  title,
  outlets,
}: {
  title: string;
  outlets: OutletSummary[];
}) {
  return (
    <ShellCard>
      <CardHeader title={title} />
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {outlets.map((outlet) => (
          <Link key={outlet.id} href={`/profiles/${outlet.id}`} className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3.5 transition hover:border-[var(--border-strong)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">{outlet.name}</p>
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--text-subtle)]">{outlet.typology}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{outlet.summary}</p>
          </Link>
        ))}
      </div>
    </ShellCard>
  );
}




