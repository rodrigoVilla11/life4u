"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { startOfMonth, endOfMonth, subDays, addDays } from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  endDate?: string;
  type: "task" | "habit" | "study_session" | "exam" | "recurring" | "workout" | "routine";
  color: string;
  icon?: string;
  status?: string;
  metadata?: Record<string, string>;
}

export async function getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const user = await getRequiredUser();
  const start = subDays(startOfMonth(new Date(year, month, 1)), 7); // include prev month overlap
  const end = addDays(endOfMonth(new Date(year, month, 1)), 7);
  const events: CalendarEvent[] = [];

  // Tasks with due dates
  const tasks = await prisma.task.findMany({
    where: { userId: user.id, dueDate: { gte: start, lte: end }, archivedAt: null },
    select: { id: true, title: true, dueDate: true, status: true, priority: true },
  });
  for (const t of tasks) {
    if (t.dueDate) {
      events.push({
        id: `task-${t.id}`, title: t.title, date: t.dueDate.toISOString(),
        type: "task", color: t.priority === "URGENT" ? "#ef4444" : t.priority === "HIGH" ? "#f59e0b" : "#3b82f6",
        status: t.status, icon: "✅",
      });
    }
  }

  // Habit logs (completed)
  const habitLogs = await prisma.habitLog.findMany({
    where: { userId: user.id, date: { gte: start, lte: end }, completed: true },
    include: { habit: { select: { title: true, color: true, icon: true } } },
  });
  for (const l of habitLogs) {
    events.push({
      id: `habit-${l.id}`, title: l.habit.title, date: l.date.toISOString(),
      type: "habit", color: l.habit.color ?? "#8b5cf6", icon: l.habit.icon ?? "🔄",
    });
  }

  // Study sessions
  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id, OR: [{ scheduledStart: { gte: start, lte: end } }, { actualStart: { gte: start, lte: end } }] },
    include: { subject: { select: { name: true, color: true, icon: true } } },
  });
  for (const s of sessions) {
    const date = s.actualStart ?? s.scheduledStart;
    if (date) {
      events.push({
        id: `session-${s.id}`, title: s.subject?.name ?? s.title ?? "Sesión de estudio",
        date: date.toISOString(), type: "study_session",
        color: s.subject?.color ?? "#06b6d4", icon: s.subject?.icon ?? "📚",
        status: s.status,
        metadata: { method: s.method, duration: s.actualDurationMin ? `${s.actualDurationMin}min` : "" },
      });
    }
  }

  // Exams
  const exams = await prisma.studyExam.findMany({
    where: { subject: { userId: user.id }, date: { gte: start, lte: end } },
    include: { subject: { select: { name: true, color: true } } },
  });
  for (const e of exams) {
    events.push({
      id: `exam-${e.id}`, title: `📝 ${e.title}`, date: e.date.toISOString(),
      type: "exam", color: e.subject.color ?? "#ef4444", icon: "📝",
      status: e.status,
    });
  }

  // Recurring transactions (upcoming)
  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId: user.id, isActive: true, nextDueDate: { gte: start, lte: end } },
    select: { id: true, name: true, nextDueDate: true, type: true, amount: true, currency: true },
  });
  for (const r of recurring) {
    events.push({
      id: `recurring-${r.id}`, title: r.name, date: r.nextDueDate.toISOString(),
      type: "recurring", color: r.type === "INCOME" ? "#10b981" : "#ef4444",
      icon: r.type === "INCOME" ? "💰" : "💸",
      metadata: { amount: `${r.currency} ${r.amount}` },
    });
  }

  // Workout logs
  const workouts = await prisma.workoutLog.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    include: { routine: { select: { name: true } }, day: { select: { name: true } } },
  });
  for (const w of workouts) {
    events.push({
      id: `workout-${w.id}`, title: w.day?.name ?? w.routine?.name ?? "Entrenamiento",
      date: w.date.toISOString(), type: "workout", color: "#ec4899", icon: "💪",
      metadata: { duration: w.duration ? `${w.duration}min` : "" },
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
