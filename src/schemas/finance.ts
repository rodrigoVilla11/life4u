import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  currency: z.string().default("USD"),
  date: z.string(),
  description: z.string().optional(),
  notes: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  toAccountId: z.string().optional(),
  goalId: z.string().optional(),
  paymentMethod: z.enum(["CASH", "DEBIT", "CREDIT", "TRANSFER", "VIRTUAL_WALLET", "CRYPTO", "OTHER"]).optional(),
  isFixed: z.boolean().default(false),
  receiptUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const accountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["CASH", "BANK", "VIRTUAL_WALLET", "SAVINGS", "INVESTMENT", "CREDIT_CARD", "CRYPTO", "OTHER"]),
  currency: z.string().default("USD"),
  initialBalance: z.coerce.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().optional(),
});

export const recurringSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  currency: z.string().default("USD"),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  paymentMethod: z.enum(["CASH", "DEBIT", "CREDIT", "TRANSFER", "VIRTUAL_WALLET", "CRYPTO", "OTHER"]).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]),
  interval: z.coerce.number().int().positive().default(1),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type AccountInput = z.infer<typeof accountSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type RecurringInput = z.infer<typeof recurringSchema>;
