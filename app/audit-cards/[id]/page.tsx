import { AuditCardPageView } from "@/features/audit-cards/audit-card-page-view";

export default async function AuditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuditCardPageView cardId={id} />;
}
