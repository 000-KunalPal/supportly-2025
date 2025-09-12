import { WidgetView } from "@/modules/widget/ui/views/widget-view";

interface WidgetPageProps {
  searchParams: Promise<{ organizationId: string }>;
}

export default async function Page({ searchParams }: WidgetPageProps) {
  const { organizationId } = await searchParams;
  return <WidgetView organizationId={organizationId} />;
}
