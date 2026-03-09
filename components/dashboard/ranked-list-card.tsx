import Link from "next/link";
import { CardHeader, CardBadge } from "@/components/dashboard/card-header";
import { ShellCard } from "@/components/dashboard/shell-card";

interface RankingItem {
  id: string;
  label: string;
  value: string;
  detail: string;
  href?: string;
  tone?: "accent" | "warning" | "danger" | "muted";
}

export function RankedListCard({ title, items }: { title: string; items: RankingItem[] }) {
  return (
    <ShellCard>
      <CardHeader title={title} />
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const content = (
            <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3.5 transition hover:border-[var(--border-strong)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.detail}</p>
                </div>
                <CardBadge tone={item.tone ?? "muted"}>{item.value}</CardBadge>
              </div>
            </div>
          );

          return item.href ? (
            <Link key={item.id} href={item.href}>
              {content}
            </Link>
          ) : (
            <div key={item.id}>{content}</div>
          );
        })}
      </div>
    </ShellCard>
  );
}

