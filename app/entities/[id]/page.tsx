import { EntityDetailPage } from "@/features/platform/entity-detail-page";

export default async function EntityDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EntityDetailPage entityId={id} />;
}