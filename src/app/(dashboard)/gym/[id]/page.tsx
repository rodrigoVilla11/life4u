import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoutine } from "@/actions/gym";
import { RoutineDetailClient } from "@/components/gym/routine-detail-client";

export const metadata: Metadata = { title: "Rutina" };

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const routine = await getRoutine(id);

  if (!routine) notFound();

  return <RoutineDetailClient routine={routine} />;
}
