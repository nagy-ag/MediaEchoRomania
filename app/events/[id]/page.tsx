import { EventDetailPage } from "@/features/platform/event-detail-page";

export default async function EventDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailPage eventId={id} />;
}