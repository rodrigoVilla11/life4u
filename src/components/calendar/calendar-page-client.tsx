"use client";

import { useState, useTransition, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCalendarEvents, type CalendarEvent } from "@/actions/calendar";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  CheckCircle2,
  Repeat,
  BookOpen,
  FileText,
  DollarSign,
  Dumbbell,
  LayoutList,
} from "lucide-react";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_HEADERS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const EVENT_TYPE_CONFIG: Record<
  CalendarEvent["type"],
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  task: { label: "Tarea", color: "#3b82f6", bgColor: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-700 dark:text-blue-300" },
  habit: { label: "Habito", color: "#8b5cf6", bgColor: "bg-purple-100 dark:bg-purple-900/30", textColor: "text-purple-700 dark:text-purple-300" },
  study_session: { label: "Estudio", color: "#06b6d4", bgColor: "bg-cyan-100 dark:bg-cyan-900/30", textColor: "text-cyan-700 dark:text-cyan-300" },
  exam: { label: "Examen", color: "#ef4444", bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-700 dark:text-red-300" },
  recurring: { label: "Recurrente", color: "#f59e0b", bgColor: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-700 dark:text-amber-300" },
  workout: { label: "Entreno", color: "#ec4899", bgColor: "bg-pink-100 dark:bg-pink-900/30", textColor: "text-pink-700 dark:text-pink-300" },
  routine: { label: "Rutina", color: "#6366f1", bgColor: "bg-indigo-100 dark:bg-indigo-900/30", textColor: "text-indigo-700 dark:text-indigo-300" },
};

function getEventIcon(type: CalendarEvent["type"]) {
  switch (type) {
    case "task": return <CheckCircle2 className="h-4 w-4" />;
    case "habit": return <Repeat className="h-4 w-4" />;
    case "study_session": return <BookOpen className="h-4 w-4" />;
    case "exam": return <FileText className="h-4 w-4" />;
    case "recurring": return <DollarSign className="h-4 w-4" />;
    case "workout": return <Dumbbell className="h-4 w-4" />;
    case "routine": return <LayoutList className="h-4 w-4" />;
  }
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return "";
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

interface CalendarPageClientProps {
  initialEvents: CalendarEvent[];
  initialYear: number;
  initialMonth: number;
}

export function CalendarPageClient({
  initialEvents,
  initialYear,
  initialMonth,
}: CalendarPageClientProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [view, setView] = useState<"month" | "agenda">("month");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const navigateMonth = useCallback(
    (delta: number) => {
      let newMonth = month + delta;
      let newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      setYear(newYear);
      setMonth(newMonth);
      setSelectedDay(null);
      startTransition(async () => {
        const newEvents = await getCalendarEvents(newYear, newMonth);
        setEvents(JSON.parse(JSON.stringify(newEvents)));
      });
    },
    [month, year],
  );

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  // getDay() returns 0=Sun. We need Mon=0. Adjust:
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Group events by day-of-month key (YYYY-MM-DD)
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const d = new Date(ev.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(ev);
  }

  function getEventsForDay(y: number, m: number, d: number): CalendarEvent[] {
    return eventsByDay.get(`${y}-${m}-${d}`) ?? [];
  }

  // Build grid cells
  const cells: Array<{ day: number; currentMonth: boolean; year: number; month: number }> = [];

  for (let i = startDayOffset - 1; i >= 0; i--) {
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, year: prevY, month: prevM });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, year, month });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, currentMonth: false, year: nextY, month: nextM });
    }
  }

  // Events for selected day
  const selectedDayEvents = selectedDay
    ? getEventsForDay(year, month, selectedDay)
    : [];

  // Agenda: events in current month sorted
  const monthEvents = events
    .filter((ev) => {
      const d = new Date(ev.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group agenda events by day
  const agendaGroups = new Map<number, CalendarEvent[]>();
  for (const ev of monthEvents) {
    const day = new Date(ev.date).getDate();
    if (!agendaGroups.has(day)) agendaGroups.set(day, []);
    agendaGroups.get(day)!.push(ev);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendario</h1>
      </div>

      {/* Navigation + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigateMonth(-1)}
            disabled={isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[180px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigateMonth(1)}
            disabled={isPending}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setView("month")}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Mes
          </Button>
          <Button
            variant={view === "agenda" ? "default" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setView("agenda")}
          >
            <List className="h-3.5 w-3.5" />
            Agenda
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Cargando eventos...
        </div>
      )}

      {/* Month View */}
      {view === "month" && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-2 sm:p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_HEADERS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {cells.map((cell, idx) => {
                  const dayEvents = getEventsForDay(cell.year, cell.month, cell.day);
                  const isToday = isCurrentMonth && cell.currentMonth && cell.day === todayDate;
                  const isSelected = cell.currentMonth && cell.day === selectedDay;

                  return (
                    <button
                      key={idx}
                      className={`
                        relative min-h-[52px] sm:min-h-[72px] p-1 sm:p-1.5 border border-border/40
                        transition-colors text-left
                        ${cell.currentMonth ? "bg-background hover:bg-accent/50" : "bg-muted/30 text-muted-foreground"}
                        ${isSelected ? "ring-2 ring-primary ring-inset bg-accent/60" : ""}
                      `}
                      onClick={() => {
                        if (cell.currentMonth) {
                          setSelectedDay(cell.day === selectedDay ? null : cell.day);
                        }
                      }}
                    >
                      <span
                        className={`
                          text-xs sm:text-sm font-medium inline-flex items-center justify-center
                          ${isToday ? "h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary text-primary-foreground" : ""}
                        `}
                      >
                        {cell.day}
                      </span>

                      {/* Event dots */}
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5 sm:mt-1">
                          {dayEvents.slice(0, 4).map((ev, i) => (
                            <div
                              key={i}
                              className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0"
                              style={{ backgroundColor: ev.color || EVENT_TYPE_CONFIG[ev.type].color }}
                              title={ev.title}
                            />
                          ))}
                          {dayEvents.length > 4 && (
                            <span className="text-[9px] text-muted-foreground leading-none">
                              +{dayEvents.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected day detail */}
          {selectedDay !== null && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[15px] mb-3">
                  {selectedDay} de {MONTH_NAMES[month]} {year}
                </h3>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin eventos este dia
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map((ev) => (
                      <EventRow key={ev.id} event={ev} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Agenda View */}
      {view === "agenda" && (
        <Card>
          <CardContent className="p-4">
            {monthEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay eventos en {MONTH_NAMES[month]}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(agendaGroups.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([day, dayEvents]) => {
                    const dateObj = new Date(year, month, day);
                    const dayOfWeek = [
                      "Domingo", "Lunes", "Martes", "Miercoles",
                      "Jueves", "Viernes", "Sabado",
                    ][dateObj.getDay()];
                    const isToday = isCurrentMonth && day === todayDate;

                    return (
                      <div key={day}>
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`
                              h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                              ${isToday ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}
                            `}
                          >
                            {day}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                              {dayOfWeek}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {MONTH_NAMES[month]} {year}
                            </p>
                          </div>
                        </div>
                        <div className="ml-[52px] space-y-1.5">
                          {dayEvents.map((ev) => (
                            <EventRow key={ev.id} event={ev} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const config = EVENT_TYPE_CONFIG[event.type];
  const time = formatTime(event.date);

  return (
    <div className="flex items-center gap-3 py-2 px-2.5 -mx-1 rounded-xl hover:bg-accent/50 transition-colors">
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${config.bgColor}`}
      >
        {event.icon ? (
          <span className="text-sm">{event.icon}</span>
        ) : (
          <span className={config.textColor}>{getEventIcon(event.type)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {time && (
            <span className="text-xs text-muted-foreground">{time}</span>
          )}
          {event.metadata?.duration && (
            <span className="text-xs text-muted-foreground">
              {event.metadata.duration}
            </span>
          )}
          {event.metadata?.amount && (
            <span className="text-xs text-muted-foreground">
              {event.metadata.amount}
            </span>
          )}
        </div>
      </div>
      <Badge
        variant="outline"
        className={`text-[10px] shrink-0 ${config.textColor} border-current/20`}
      >
        {config.label}
      </Badge>
      {event.status && (
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {event.status === "COMPLETED" || event.status === "completed" ? "Listo" : event.status}
        </Badge>
      )}
    </div>
  );
}
