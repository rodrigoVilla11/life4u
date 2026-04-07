"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { routineSchema, workoutDaySchema, exerciseSchema } from "@/schemas/gym";

// ==========================================
// ROUTINES
// ==========================================

export async function getRoutines() {
  const user = await getRequiredUser();
  return prisma.workoutRoutine.findMany({
    where: { userId: user.id },
    orderBy: { position: "asc" },
    include: {
      days: {
        orderBy: { position: "asc" },
        include: {
          exercises: { orderBy: { position: "asc" } },
          _count: { select: { exercises: true } },
        },
      },
      _count: { select: { logs: true } },
    },
  });
}

export async function getRoutine(id: string) {
  const user = await getRequiredUser();
  return prisma.workoutRoutine.findFirst({
    where: { id, userId: user.id },
    include: {
      days: {
        orderBy: { position: "asc" },
        include: {
          exercises: { orderBy: { position: "asc" } },
        },
      },
    },
  });
}

export async function createRoutine(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = routineSchema.parse(data);
  const maxPos = await prisma.workoutRoutine.aggregate({ where: { userId: user.id }, _max: { position: true } });

  const routine = await prisma.workoutRoutine.create({
    data: {
      ...parsed,
      color: parsed.color || null,
      userId: user.id,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });
  revalidatePath("/gym");
  return routine;
}

export async function updateRoutine(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const updateData = { ...data };
  if ("color" in updateData) updateData.color = updateData.color || null;
  if ("description" in updateData) updateData.description = updateData.description || null;
  await prisma.workoutRoutine.update({ where: { id, userId: user.id }, data: updateData });
  revalidatePath("/gym");
}

export async function deleteRoutine(id: string) {
  const user = await getRequiredUser();
  await prisma.workoutRoutine.delete({ where: { id, userId: user.id } });
  revalidatePath("/gym");
}

// ==========================================
// WORKOUT DAYS
// ==========================================

export async function addDay(routineId: string, data: Record<string, unknown>) {
  const parsed = workoutDaySchema.parse(data);
  const maxPos = await prisma.workoutDay.aggregate({ where: { routineId }, _max: { position: true } });

  const day = await prisma.workoutDay.create({
    data: {
      ...parsed,
      dayOfWeek: parsed.dayOfWeek === -1 ? null : (parsed.dayOfWeek ?? null),
      routineId,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });
  revalidatePath("/gym");
  return day;
}

export async function updateDay(id: string, data: Record<string, unknown>) {
  const updateData = { ...data };
  if ("dayOfWeek" in updateData) {
    updateData.dayOfWeek = updateData.dayOfWeek === -1 ? null : updateData.dayOfWeek;
  }
  if ("notes" in updateData) updateData.notes = updateData.notes || null;
  await prisma.workoutDay.update({ where: { id }, data: updateData });
  revalidatePath("/gym");
}

export async function deleteDay(id: string) {
  await prisma.workoutDay.delete({ where: { id } });
  revalidatePath("/gym");
}

// ==========================================
// EXERCISES
// ==========================================

export async function addExercise(dayId: string, data: Record<string, unknown>) {
  const parsed = exerciseSchema.parse(data);
  const maxPos = await prisma.workoutExercise.aggregate({ where: { dayId }, _max: { position: true } });

  const exercise = await prisma.workoutExercise.create({
    data: {
      ...parsed,
      muscleGroup: parsed.muscleGroup || null,
      weight: parsed.weight || null,
      notes: parsed.notes || null,
      supersetGroup: parsed.supersetGroup || null,
      dayId,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });
  revalidatePath("/gym");
  return exercise;
}

export async function updateExercise(id: string, data: Record<string, unknown>) {
  const updateData = { ...data };
  const optionals = ["muscleGroup", "weight", "notes", "supersetGroup"];
  for (const k of optionals) { if (k in updateData) updateData[k] = updateData[k] || null; }
  await prisma.workoutExercise.update({ where: { id }, data: updateData });
  revalidatePath("/gym");
}

export async function deleteExercise(id: string) {
  await prisma.workoutExercise.delete({ where: { id } });
  revalidatePath("/gym");
}

// ==========================================
// WORKOUT LOGS
// ==========================================

export async function getWorkoutLogs(limit: number = 20) {
  const user = await getRequiredUser();
  return prisma.workoutLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      routine: { select: { name: true } },
      day: { select: { name: true } },
      entries: { orderBy: { setNumber: "asc" } },
    },
  });
}

export async function startWorkout(routineId: string, dayId: string) {
  const user = await getRequiredUser();

  const day = await prisma.workoutDay.findFirst({
    where: { id: dayId },
    include: { exercises: { orderBy: { position: "asc" } } },
  });
  if (!day) throw new Error("Day not found");

  const log = await prisma.workoutLog.create({
    data: {
      userId: user.id,
      routineId,
      dayId,
      entries: {
        create: day.exercises.flatMap((ex) =>
          Array.from({ length: ex.sets }, (_, i) => ({
            exerciseId: ex.id,
            exerciseName: ex.name,
            setNumber: i + 1,
            reps: parseInt(ex.reps) || null,
            weight: ex.weight ? parseFloat(ex.weight) || null : null,
            completed: false,
          }))
        ),
      },
    },
    include: { entries: true },
  });

  revalidatePath("/gym");
  return log;
}

export async function updateLogEntry(id: string, data: { reps?: number; weight?: number; completed?: boolean; notes?: string }) {
  await prisma.workoutLogEntry.update({ where: { id }, data });
  revalidatePath("/gym");
}

export async function finishWorkout(logId: string, data: { duration?: number; notes?: string; rating?: number }) {
  await prisma.workoutLog.update({
    where: { id: logId },
    data: { duration: data.duration, notes: data.notes || null, rating: data.rating },
  });
  revalidatePath("/gym");
}

export async function deleteWorkoutLog(id: string) {
  const user = await getRequiredUser();
  await prisma.workoutLog.delete({ where: { id, userId: user.id } });
  revalidatePath("/gym");
}

// ==========================================
// STATS & HISTORY
// ==========================================

export async function getWorkoutStats() {
  const user = await getRequiredUser();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const [total, thisWeek, recentDates] = await Promise.all([
    prisma.workoutLog.count({ where: { userId: user.id } }),
    prisma.workoutLog.count({ where: { userId: user.id, date: { gte: weekStart } } }),
    prisma.workoutLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 60,
      select: { date: true },
    }),
  ]);

  // Calculate streak (consecutive days with workouts)
  let streak = 0;
  if (recentDates.length > 0) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dates = [...new Set(recentDates.map((d) => {
      const dt = new Date(d.date); dt.setHours(0, 0, 0, 0); return dt.getTime();
    }))].sort((a, b) => b - a);

    // Check if today or yesterday had a workout
    const diff = Math.round((today.getTime() - dates[0]) / 86400000);
    if (diff <= 1) {
      streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const gap = Math.round((dates[i - 1] - dates[i]) / 86400000);
        if (gap <= 1) streak++;
        else break;
      }
    }
  }

  return { total, thisWeek, streak };
}

export async function getPreviousWorkoutData(dayId: string) {
  const user = await getRequiredUser();
  const lastLog = await prisma.workoutLog.findFirst({
    where: { userId: user.id, dayId },
    orderBy: { date: "desc" },
    include: { entries: { orderBy: { setNumber: "asc" } } },
  });
  return lastLog?.entries.map((e) => ({
    exerciseName: e.exerciseName,
    setNumber: e.setNumber,
    reps: e.reps,
    weight: e.weight,
  })) ?? [];
}
