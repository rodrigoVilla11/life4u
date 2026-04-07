import { getDashboardData, getMonthlyReport, getDashboardConfig } from "@/actions/dashboard";
import { getHabitStats } from "@/actions/habits";
import { getStudyStats } from "@/actions/study";
import { getWorkoutStats } from "@/actions/gym";
import { auth } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const [data, monthlyReport, session, habitStats, studyStats, gymStats, config] =
    await Promise.all([
      getDashboardData(),
      getMonthlyReport(),
      auth(),
      getHabitStats(),
      getStudyStats(),
      getWorkoutStats(),
      getDashboardConfig(),
    ]);

  return (
    <DashboardClient
      data={JSON.parse(JSON.stringify(data))}
      monthlyReport={JSON.parse(JSON.stringify(monthlyReport))}
      userName={session?.user?.name ?? ""}
      habitStats={JSON.parse(JSON.stringify(habitStats))}
      studyStats={JSON.parse(JSON.stringify(studyStats))}
      gymStats={JSON.parse(JSON.stringify(gymStats))}
      dashboardConfig={JSON.parse(JSON.stringify(config))}
    />
  );
}
