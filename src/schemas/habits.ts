import { z } from "zod";

export const habitSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["CHECKBOX", "COUNT", "DURATION", "AMOUNT", "AVOID"]).default("CHECKBOX"),
  targetValue: z.coerce.number().optional(),
  unit: z.string().optional(),
  frequencyType: z.enum(["DAILY", "WEEKDAYS", "SPECIFIC_DAYS", "X_PER_WEEK", "X_PER_MONTH"]).default("DAILY"),
  frequencyDays: z.string().optional(), // JSON array
  frequencyCount: z.coerce.number().int().optional(),
  timeOfDay: z.string().optional(),
  goalId: z.string().optional(),
  motivationNote: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const habitLogSchema = z.object({
  date: z.string(),
  completed: z.boolean().default(false),
  value: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export const dailyRoutineSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  timeOfDay: z.string().optional(),
  estimatedMinutes: z.coerce.number().int().optional(),
});

export const routineItemSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  habitId: z.string().optional(),
  duration: z.coerce.number().int().optional(),
});

export type HabitInput = z.infer<typeof habitSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
export type DailyRoutineInput = z.infer<typeof dailyRoutineSchema>;
export type RoutineItemInput = z.infer<typeof routineItemSchema>;
