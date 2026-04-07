import { getCalendarEvents } from "@/actions/calendar";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

export default async function CalendarPage() {
  const now = new Date();
  const events = await getCalendarEvents(now.getFullYear(), now.getMonth());

  return (
    <CalendarPageClient
      initialEvents={JSON.parse(JSON.stringify(events))}
      initialYear={now.getFullYear()}
      initialMonth={now.getMonth()}
    />
  );
}
