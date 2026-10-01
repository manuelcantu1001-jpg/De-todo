import { ReParteEvent } from '@/components/reparte-event';

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ReParteEvent slug={slug} />;
}
