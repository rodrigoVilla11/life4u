import type { Metadata } from "next";
import { getHabits, getHabitStats, getDailyRoutines } from "@/actions/habits";
import { HabitsPageClient } from "@/components/habits/habits-page-client";

export const metadata: Metadata = { title: "Hábitos" };

export default async function HabitsPage() {
  const [habits, stats, routines] = await Promise.all([
    getHabits(),
    getHabitStats(),
    getDailyRoutines(),
  ]);

  return (
    <HabitsPageClient
      habits={JSON.parse(JSON.stringify(habits))}
      stats={stats}
      routines={JSON.parse(JSON.stringify(routines))}
    />
  );
}
