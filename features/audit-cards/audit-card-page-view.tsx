"use client";

import { useAuditCard } from "@/data/convex/use-media-data";
import { useUiPreferences } from "@/features/shell/ui-preferences";
import { AuditCardView } from "@/components/dashboard/audit-card-view";
import { ShellCard } from "@/components/dashboard/shell-card";

export function AuditCardPageView({ cardId }: { cardId: string }) {
  const { t } = useUiPreferences();
  const card = useAuditCard(cardId);

  if (card === undefined) {
    return <ShellCard>{t("common.loading")}</ShellCard>;
  }

  if (!card) {
    return <ShellCard>{t("common.noData")}</ShellCard>;
  }

  return (
    <div>
      <AuditCardView card={card} />
    </div>
  );
}
