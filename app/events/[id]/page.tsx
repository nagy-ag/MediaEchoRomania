import { EventDetailPageView } from "@/features/events/events-page-view";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailPageView eventId={id} />;
}
