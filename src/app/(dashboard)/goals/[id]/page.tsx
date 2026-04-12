import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGoalFull } from "@/actions/goals";
import { GoalDashboardClient } from "@/components/goals/goal-dashboard-client";

export const metadata: Metadata = { title: "Meta de Ahorro" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getGoalFull(id);

  if (!data) notFound();

  return (
    <GoalDashboardClient
      goal={data.goal}
      dashboard={data.dashboard}
      dailyTable={data.dailyTable}
      dailyEntries={data.dailyEntries}
      assets={data.assets}
      movements={data.movements}
      rates={data.rates}
    />
  );
}
