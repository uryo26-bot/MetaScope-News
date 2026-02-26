import { notFound } from "next/navigation";
import { getResourceById } from "../../../../data/resources";
import { ResourceDetailView } from "../../../../components/metalchart/ResourceDetailView";

type PageProps = { params: Promise<{ id: string }> };

export default async function ResourceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const resource = getResourceById(id);
  if (!resource) notFound();
  return <ResourceDetailView resource={resource} />;
}
