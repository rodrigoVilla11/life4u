"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { habitSchema, habitLogSchema, dailyRoutineSchema, routineItemSchema } from "@/schemas/habits";
import { parseLocalDate } from "@/lib/utils";
import { startOfDay, subDays, differenceInDays } from "date-fns";

// ==========================================
// HABITS
// ==========================================

export async function getHabits() {
  const user = await getRequiredUser();
  const thirtyDaysAgo = subDays(new Date(), 30);

  return prisma.habit.findMany({
    where: { userId: user.id, status: { in: ["ACTIVE", "PAUSED"] } },
    orderBy: { position: "asc" },
    include: {
      logs: {
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      },
      goal: { select: { id: true, name: true } },
    },
  });
}

export async function getHabit(id: string) {
  const user = await getRequiredUser();
  return prisma.habit.findFirst({
    where: { id, userId: user.id },
    include: {
      logs: { orderBy: { date: "desc" }, take: 90 },
      goal: { select: { id: true, name: true } },
    },
  });
}

export async function createHabit(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = habitSchema.parse(data);
  const maxPos = await prisma.habit.aggregate({ where: { userId: user.id }, _max: { position: true } });

  const habit = await prisma.habit.create({
    data: {
      ...parsed,
      goalId: parsed.goalId || null,
      startDate: parsed.startDate ? parseLocalDate(parsed.startDate) : new Date(),
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      color: parsed.color || null,
      icon: parsed.icon || null,
      category: parsed.category || null,
      motivationNote: parsed.motivationNote || null,
      timeOfDay: parsed.timeOfDay || null,
      unit: parsed.unit || null,
      frequencyDays: parsed.frequencyDays || null,
      userId: user.id,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return habit;
}

export async function updateHabit(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const updateData = { ...data };
  const optionals = ["goalId", "color", "icon", "category", "motivationNote", "timeOfDay", "unit", "frequencyDays", "description"];
  for (const k of optionals) { if (k in updateData) updateData[k] = updateData[k] || null; }
  if (updateData.startDate) updateData.startDate = new Date(updateData.startDate as string);
  if ("endDate" in updateData) updateData.endDate = updateData.endDate ? new Date(updateData.endDate as string) : null;
  await prisma.habit.update({ where: { id, userId: user.id }, data: updateData });
  revalidatePath("/habits");
}

export async function deleteHabit(id: string) {
  const user = await getRequiredUser();
  await prisma.habit.delete({ where: { id, userId: user.id } });
  revalidatePath("/habits");
}

// ==========================================
// HABIT LOGS
// ==========================================

export async function logHabit(habitId: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = habitLogSchema.parse(data);
  const date = startOfDay(new Date(parsed.date));

  await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date } },
    update: { completed: parsed.completed, value: parsed.value, notes: parsed.notes || null },
    create: { habitId, userId: user.id, date, completed: parsed.completed, value: parsed.value, notes: parsed.notes || null },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function quickToggleHabit(habitId: string, dateStr: string) {
  const user = await getRequiredUser();
  const date = startOfDay(new Date(dateStr));

  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date } },
  });

  if (existing) {
    await prisma.habitLog.update({
      where: { id: existing.id },
      data: { completed: !existing.completed },
    });
  } else {
    await prisma.habitLog.create({
      data: { habitId, userId: user.id, date, completed: true },
    });
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

// ==========================================
// HABIT STATS
// ==========================================

export async function getHabitStats() {
  const user = await getRequiredUser();
  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = subDays(today, 7);

  const [totalHabits, todayCompleted, todayTotal, weekCompleted] = await Promise.all([
    prisma.habit.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.habitLog.count({ where: { userId: user.id, date: today, completed: true } }),
    prisma.habit.count({ where: { userId: user.id, status: "ACTIVE" } }), // habits due today (simplified)
    prisma.habitLog.count({ where: { userId: user.id, date: { gte: weekAgo }, completed: true } }),
  ]);

  // Calculate best streak across all habits
  const recentLogs = await prisma.habitLog.findMany({
    where: { userId: user.id, completed: true },
    orderBy: { date: "desc" },
    take: 90,
    select: { date: true },
  });

  let bestStreak = 0;
  if (recentLogs.length > 0) {
    const uniqueDates = [...new Set(recentLogs.map((l) => startOfDay(l.date).getTime()))].sort((a, b) => b - a);
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      if (differenceInDays(new Date(uniqueDates[i - 1]), new Date(uniqueDates[i])) === 1) {
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, streak);
  }

  return {
    totalHabits,
    todayCompleted,
    todayTotal,
    weekCompleted,
    bestStreak,
    todayProgress: todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0,
  };
}

// ==========================================
// DAILY ROUTINES
// ==========================================

export async function getDailyRoutines() {
  const user = await getRequiredUser();
  return prisma.dailyRoutine.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { position: "asc" },
    include: {
      items: { orderBy: { position: "asc" }, include: { habit: { select: { id: true, title: true, icon: true } } } },
      _count: { select: { sessions: true } },
    },
  });
}

export async function createDailyRoutine(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = dailyRoutineSchema.parse(data);
  const maxPos = await prisma.dailyRoutine.aggregate({ where: { userId: user.id }, _max: { position: true } });

  const routine = await prisma.dailyRoutine.create({
    data: {
      ...parsed,
      color: parsed.color || null,
      icon: parsed.icon || null,
      timeOfDay: parsed.timeOfDay || null,
      userId: user.id,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });

  revalidatePath("/habits");
  return routine;
}

export async function addRoutineItem(routineId: string, data: Record<string, unknown>) {
  const parsed = routineItemSchema.parse(data);
  const maxPos = await prisma.dailyRoutineItem.aggregate({ where: { routineId }, _max: { position: true } });

  await prisma.dailyRoutineItem.create({
    data: {
      ...parsed,
      habitId: parsed.habitId || null,
      routineId,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });

  revalidatePath("/habits");
}

export async function deleteRoutineItem(id: string) {
  await prisma.dailyRoutineItem.delete({ where: { id } });
  revalidatePath("/habits");
}

export async function deleteDailyRoutine(id: string) {
  const user = await getRequiredUser();
  await prisma.dailyRoutine.delete({ where: { id, userId: user.id } });
  revalidatePath("/habits");
}

export async function startRoutineSession(routineId: string) {
  const user = await getRequiredUser();

  const routine = await prisma.dailyRoutine.findFirst({
    where: { id: routineId, userId: user.id },
    include: { items: { orderBy: { position: "asc" } } },
  });
  if (!routine) throw new Error("Routine not found");

  const session = await prisma.dailyRoutineSession.create({
    data: {
      routineId,
      userId: user.id,
      items: {
        create: routine.items.map((item, i) => ({
          title: item.title,
          position: i,
          completed: false,
        })),
      },
    },
    include: { items: { orderBy: { position: "asc" } } },
  });

  revalidatePath("/habits");
  return session;
}

export async function toggleSessionItem(itemId: string) {
  const item = await prisma.dailyRoutineSessionItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  await prisma.dailyRoutineSessionItem.update({
    where: { id: itemId },
    data: {
      completed: !item.completed,
      completedAt: !item.completed ? new Date() : null,
    },
  });
  revalidatePath("/habits");
}

export async function finishRoutineSession(sessionId: string) {
  await prisma.dailyRoutineSession.update({
    where: { id: sessionId },
    data: { finishedAt: new Date() },
  });
  revalidatePath("/habits");
}
