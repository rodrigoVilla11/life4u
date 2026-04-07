import { getRoutines, getWorkoutStats, getWorkoutLogs } from "@/actions/gym";
import { GymPageClient } from "@/components/gym/gym-page-client";

export default async function GymPage() {
  const [routines, stats, logs] = await Promise.all([
    getRoutines(),
    getWorkoutStats(),
    getWorkoutLogs(20),
  ]);

  return (
    <GymPageClient
      routines={JSON.parse(JSON.stringify(routines))}
      stats={stats}
      logs={JSON.parse(JSON.stringify(logs))}
    />
  );
}
