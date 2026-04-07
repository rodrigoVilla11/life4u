import { getGlobalOverview } from "@/actions/goals";
import { GoalsPageClient } from "@/components/goals/goals-page-client";

export default async function GoalsPage() {
  const overview = await getGlobalOverview();

  return <GoalsPageClient overview={overview} />;
}
