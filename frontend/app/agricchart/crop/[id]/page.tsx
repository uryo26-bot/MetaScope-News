import { notFound } from "next/navigation";
import { getCropById } from "../../../../data/crops";
import { CropDetailView } from "../../../../components/agricchart/CropDetailView";

type PageProps = { params: Promise<{ id: string }> };

export default async function CropDetailPage({ params }: PageProps) {
  const { id } = await params;
  const crop = getCropById(id);
  if (!crop) notFound();
  return <CropDetailView crop={crop} />;
}
