import { z } from "zod";

export const taskGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  goalId: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  groupId: z.string().min(1, "El grupo es requerido"),
  parentId: z.string().optional(),
  goalId: z.string().optional(),
  isFavorite: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type TaskGroupInput = z.infer<typeof taskGroupSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
