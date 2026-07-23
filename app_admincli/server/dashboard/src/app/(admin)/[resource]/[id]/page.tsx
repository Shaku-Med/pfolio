import { notFound } from "next/navigation";
import { RESOURCES, findResource } from "@/lib/resources";
import { ResourceDetail } from "@/components/resource-detail";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateStaticParams() {
  return RESOURCES.map((resource) => ({ resource: resource.key }));
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  const resource = findResource(key);
  if (!resource || !UUID.test(id)) notFound();
  return <ResourceDetail resource={resource} id={id} />;
}
