import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  currency: z.string().default("USD"),
  targetMin: z.coerce.number().positive("La meta mínima debe ser positiva"),
  targetIdeal: z.coerce.number().positive("La meta ideal debe ser positiva"),
  dailySavingsBase: z.coerce.number().min(0, "El ahorro base no puede ser negativo").default(0),
  startDate: z.string(),
  deadline: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  category: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const dailyEntrySchema = z.object({
  date: z.string(),
  amount: z.coerce.number(),
  currency: z.string().default("USD"),
  note: z.string().optional(),
});

export const goalAssetSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  type: z.enum(["CASH", "BANK_ACCOUNT", "INVESTMENT", "CRYPTO", "RECEIVABLE", "PROPERTY", "OTHER"]).default("OTHER"),
  currency: z.string().default("USD"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  status: z.enum(["AVAILABLE", "PENDING", "LOCKED", "SOLD"]).default("AVAILABLE"),
  note: z.string().optional(),
});

export const goalMovementSchema = z.object({
  date: z.string(),
  description: z.string().min(1, "La descripción es requerida"),
  type: z.enum(["EXPENSE", "LOAN_GIVEN", "LOAN_RECEIVED", "ADJUSTMENT", "BONUS"]),
  currency: z.string().default("USD"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  note: z.string().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;
export type DailyEntryInput = z.infer<typeof dailyEntrySchema>;
export type GoalAssetInput = z.infer<typeof goalAssetSchema>;
export type GoalMovementInput = z.infer<typeof goalMovementSchema>;
