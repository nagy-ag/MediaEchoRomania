import { ProfileDetailPageView } from "@/features/profiles/profiles-page-view";

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProfileDetailPageView outletId={slug} />;
}
