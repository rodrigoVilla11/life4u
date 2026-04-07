import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  weeklyTargetHours: z.coerce.number().optional(),
  teacher: z.string().optional(),
  notes: z.string().optional(),
});

export const topicSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  estimatedHours: z.coerce.number().optional(),
  priority: z.coerce.number().int().min(0).max(2).default(0),
});

export const scheduleBlockSchema = z.object({
  subjectId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
});

export const sessionSchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  title: z.string().optional(),
  method: z.string().default("pomodoro_25_5"),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  plannedDurationMin: z.coerce.number().int().optional(),
  pomodoroTarget: z.coerce.number().int().optional(),
});

export const examSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  subjectId: z.string().min(1),
  date: z.string(),
  priority: z.coerce.number().int().min(0).max(2).default(1),
  notes: z.string().optional(),
});

export type SubjectInput = z.infer<typeof subjectSchema>;
export type TopicInput = z.infer<typeof topicSchema>;
export type ScheduleBlockInput = z.infer<typeof scheduleBlockSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type ExamInput = z.infer<typeof examSchema>;
