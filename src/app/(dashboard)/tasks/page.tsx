import { getTaskGroups } from "@/actions/tasks";
import { getGoals } from "@/actions/goals";
import { TasksPageClient } from "@/components/tasks/tasks-page-client";

export const metadata = {
  title: "Tareas",
};

export default async function TasksPage() {
  const [groups, goals] = await Promise.all([
    getTaskGroups(),
    getGoals("ACTIVE"),
  ]);

  return (
    <TasksPageClient
      groups={JSON.parse(JSON.stringify(groups))}
      goals={JSON.parse(JSON.stringify(goals))}
    />
  );
}
