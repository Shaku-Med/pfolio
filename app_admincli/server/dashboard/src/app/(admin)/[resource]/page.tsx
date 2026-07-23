import { notFound } from "next/navigation";
import { RESOURCES, findResource } from "@/lib/resources";
import { ResourceManager } from "@/components/resource-manager";

export function generateStaticParams() {
  return RESOURCES.map((resource) => ({ resource: resource.key }));
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const resource = findResource((await params).resource);
  if (!resource) notFound();
  return <ResourceManager resource={resource} />;
}
