import { z } from "zod";

export const routineSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const workoutDaySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  dayOfWeek: z.coerce.number().int().min(-1).max(6).optional(), // -1 = sin día
  notes: z.string().optional(),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  muscleGroup: z.string().optional(),
  sets: z.coerce.number().int().positive().default(3),
  reps: z.string().default("10"),
  weight: z.string().optional(),
  restSeconds: z.coerce.number().int().min(0).default(90),
  notes: z.string().optional(),
  supersetGroup: z.string().optional(),
});

export const logEntrySchema = z.object({
  exerciseName: z.string(),
  setNumber: z.coerce.number().int().positive(),
  reps: z.coerce.number().int().optional(),
  weight: z.coerce.number().optional(),
  notes: z.string().optional(),
  completed: z.boolean().default(true),
});

export type RoutineInput = z.infer<typeof routineSchema>;
export type WorkoutDayInput = z.infer<typeof workoutDaySchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type LogEntryInput = z.infer<typeof logEntrySchema>;
