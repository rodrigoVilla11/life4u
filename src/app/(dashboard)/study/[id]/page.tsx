import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubject } from "@/actions/study";
import { SubjectDetailClient } from "@/components/study/subject-detail-client";

export const metadata: Metadata = { title: "Estudio" };

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubject(id);

  if (!subject) notFound();

  return <SubjectDetailClient subject={JSON.parse(JSON.stringify(subject))} />;
}
