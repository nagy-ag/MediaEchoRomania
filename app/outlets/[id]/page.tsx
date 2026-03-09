import { OutletDetailPage } from "@/features/platform/outlet-detail-page";

export default async function OutletDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OutletDetailPage outletId={id} />;
}