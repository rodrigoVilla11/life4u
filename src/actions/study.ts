"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { subjectSchema, topicSchema, scheduleBlockSchema, sessionSchema, examSchema } from "@/schemas/study";
import { parseLocalDate } from "@/lib/utils";
import { startOfDay, subDays } from "date-fns";

// ==========================================
// SUBJECTS
// ==========================================

export async function getSubjects() {
  const user = await getRequiredUser();
  return prisma.studySubject.findMany({
    where: { userId: user.id, status: { not: "archived" } },
    orderBy: { position: "asc" },
    include: {
      topics: { orderBy: { position: "asc" } },
      exams: { orderBy: { date: "asc" } },
      scheduleBlocks: { orderBy: { dayOfWeek: "asc" } },
      _count: { select: { sessions: true, topics: true, exams: true } },
    },
  });
}

export async function getSubject(id: string) {
  const user = await getRequiredUser();
  return prisma.studySubject.findFirst({
    where: { id, userId: user.id },
    include: {
      topics: { orderBy: { position: "asc" } },
      exams: { orderBy: { date: "asc" } },
      scheduleBlocks: { orderBy: { dayOfWeek: "asc" } },
      sessions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function createSubject(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = subjectSchema.parse(data);
  const maxPos = await prisma.studySubject.aggregate({ where: { userId: user.id }, _max: { position: true } });

  const subject = await prisma.studySubject.create({
    data: {
      ...parsed,
      color: parsed.color || null,
      icon: parsed.icon || null,
      teacher: parsed.teacher || null,
      notes: parsed.notes || null,
      description: parsed.description || null,
      userId: user.id,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });
  revalidatePath("/study");
  return subject;
}

export async function updateSubject(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const updateData = { ...data };
  const optionals = ["color", "icon", "teacher", "notes", "description"];
  for (const k of optionals) { if (k in updateData) updateData[k] = updateData[k] || null; }
  await prisma.studySubject.update({ where: { id, userId: user.id }, data: updateData });
  revalidatePath("/study");
}

export async function deleteSubject(id: string) {
  const user = await getRequiredUser();
  await prisma.studySubject.delete({ where: { id, userId: user.id } });
  revalidatePath("/study");
}

// ==========================================
// TOPICS
// ==========================================

export async function addTopic(subjectId: string, data: Record<string, unknown>) {
  const parsed = topicSchema.parse(data);
  const maxPos = await prisma.studyTopic.aggregate({ where: { subjectId }, _max: { position: true } });
  await prisma.studyTopic.create({
    data: { ...parsed, description: parsed.description || null, subjectId, position: (maxPos._max.position ?? 0) + 1 },
  });
  revalidatePath("/study");
}

export async function updateTopic(id: string, data: Record<string, unknown>) {
  const updateData = { ...data };
  if ("description" in updateData) updateData.description = updateData.description || null;
  await prisma.studyTopic.update({ where: { id }, data: updateData });
  revalidatePath("/study");
}

export async function deleteTopic(id: string) {
  await prisma.studyTopic.delete({ where: { id } });
  revalidatePath("/study");
}

// ==========================================
// SCHEDULE BLOCKS
// ==========================================

export async function addScheduleBlock(data: Record<string, unknown>) {
  const parsed = scheduleBlockSchema.parse(data);
  await prisma.studyScheduleBlock.create({ data: parsed });
  revalidatePath("/study");
}

export async function deleteScheduleBlock(id: string) {
  await prisma.studyScheduleBlock.delete({ where: { id } });
  revalidatePath("/study");
}

// ==========================================
// SESSIONS
// ==========================================

export async function getSessions(limit: number = 20) {
  const user = await getRequiredUser();
  return prisma.studySession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      subject: { select: { id: true, name: true, color: true, icon: true } },
      topic: { select: { id: true, title: true } },
    },
  });
}

export async function createSession(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = sessionSchema.parse(data);
  const session = await prisma.studySession.create({
    data: {
      ...parsed,
      subjectId: parsed.subjectId || null,
      topicId: parsed.topicId || null,
      title: parsed.title || null,
      scheduledStart: parsed.scheduledStart ? new Date(parsed.scheduledStart) : null,
      scheduledEnd: parsed.scheduledEnd ? new Date(parsed.scheduledEnd) : null,
      userId: user.id,
    },
    include: { subject: { select: { name: true, color: true } }, topic: { select: { title: true } } },
  });
  revalidatePath("/study");
  return session;
}

export async function startSession(id: string) {
  await prisma.studySession.update({
    where: { id },
    data: { status: "active", actualStart: new Date() },
  });
  revalidatePath("/study");
}

export async function completeSession(id: string, data: {
  actualDurationMin?: number;
  pomodoroCompleted?: number;
  interruptionCount?: number;
  focusScore?: number;
  notes?: string;
}) {
  await prisma.studySession.update({
    where: { id },
    data: {
      status: "completed",
      actualEnd: new Date(),
      actualDurationMin: data.actualDurationMin,
      pomodoroCompleted: data.pomodoroCompleted,
      interruptionCount: data.interruptionCount,
      focusScore: data.focusScore,
      notes: data.notes || null,
    },
  });
  revalidatePath("/study");
}

export async function deleteSession(id: string) {
  const user = await getRequiredUser();
  await prisma.studySession.delete({ where: { id, userId: user.id } });
  revalidatePath("/study");
}

// ==========================================
// EXAMS
// ==========================================

export async function addExam(data: Record<string, unknown>) {
  const parsed = examSchema.parse(data);
  await prisma.studyExam.create({
    data: { ...parsed, date: parseLocalDate(parsed.date), notes: parsed.notes || null },
  });
  revalidatePath("/study");
}

export async function updateExam(id: string, data: Record<string, unknown>) {
  const updateData = { ...data };
  if (updateData.date) updateData.date = new Date(updateData.date as string);
  if ("notes" in updateData) updateData.notes = updateData.notes || null;
  await prisma.studyExam.update({ where: { id }, data: updateData });
  revalidatePath("/study");
}

export async function deleteExam(id: string) {
  await prisma.studyExam.delete({ where: { id } });
  revalidatePath("/study");
}

// ==========================================
// STATS
// ==========================================

export async function getStudyStats() {
  const user = await getRequiredUser();
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const today = startOfDay(now);

  const [totalSessions, weekSessions, totalSubjects, upcomingExams] = await Promise.all([
    prisma.studySession.count({ where: { userId: user.id, status: "completed" } }),
    prisma.studySession.findMany({
      where: { userId: user.id, status: "completed", actualEnd: { gte: weekAgo } },
      select: { actualDurationMin: true, pomodoroCompleted: true },
    }),
    prisma.studySubject.count({ where: { userId: user.id, status: "active" } }),
    prisma.studyExam.findMany({
      where: { subject: { userId: user.id }, date: { gte: today }, status: { not: "done" } },
      orderBy: { date: "asc" },
      take: 3,
      include: { subject: { select: { name: true, color: true } } },
    }),
  ]);

  const weekHours = weekSessions.reduce((s, se) => s + (se.actualDurationMin ?? 0), 0) / 60;
  const weekPomodoros = weekSessions.reduce((s, se) => s + (se.pomodoroCompleted ?? 0), 0);

  return {
    totalSessions,
    weekSessions: weekSessions.length,
    weekHours: Math.round(weekHours * 10) / 10,
    weekPomodoros,
    totalSubjects,
    upcomingExams: upcomingExams.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      subjectName: e.subject.name,
      subjectColor: e.subject.color,
      daysLeft: Math.max(0, Math.ceil((e.date.getTime() - now.getTime()) / 86400000)),
    })),
  };
}
