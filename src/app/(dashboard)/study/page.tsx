import { getSubjects, getStudyStats, getSessions } from "@/actions/study";
import { StudyPageClient } from "@/components/study/study-page-client";

export default async function StudyPage() {
  const [subjects, stats, sessions] = await Promise.all([
    getSubjects(),
    getStudyStats(),
    getSessions(10),
  ]);

  return (
    <StudyPageClient
      subjects={JSON.parse(JSON.stringify(subjects))}
      stats={JSON.parse(JSON.stringify(stats))}
      sessions={JSON.parse(JSON.stringify(sessions))}
    />
  );
}
