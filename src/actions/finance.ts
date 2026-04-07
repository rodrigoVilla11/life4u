"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { parseLocalDate } from "@/lib/utils";
import { transactionSchema, accountSchema, recurringSchema } from "@/schemas/finance";

// ==========================================
// ACCOUNTS
// ==========================================

export async function getAccounts() {
  const user = await getRequiredUser();
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      transactionsFrom: { select: { type: true, amount: true } },
      transactionsTo: { select: { type: true, amount: true } },
    },
  });

  return accounts.map((acc) => {
    let totalIncome = 0;
    let totalExpense = 0;

    acc.transactionsFrom.forEach((t) => {
      if (t.type === "INCOME") totalIncome += t.amount;
      else if (t.type === "EXPENSE") totalExpense += t.amount;
      else if (t.type === "TRANSFER") totalExpense += t.amount;
    });

    acc.transactionsTo.forEach((t) => {
      if (t.type === "TRANSFER") totalIncome += t.amount;
    });

    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      initialBalance: acc.initialBalance,
      color: acc.color,
      icon: acc.icon,
      isActive: acc.isActive,
      archivedAt: acc.archivedAt,
      createdAt: acc.createdAt,
      currentBalance: acc.initialBalance + totalIncome - totalExpense,
      totalIncome,
      totalExpense,
    };
  });
}

export async function createAccount(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = accountSchema.parse(data);

  const account = await prisma.account.create({
    data: { ...parsed, userId: user.id },
  });

  revalidatePath("/accounts");
  revalidatePath("/finances");
  return account;
}

export async function updateAccount(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const account = await prisma.account.update({
    where: { id, userId: user.id },
    data,
  });
  revalidatePath("/accounts");
  return account;
}

export async function deleteAccount(id: string) {
  const user = await getRequiredUser();
  await prisma.account.delete({ where: { id, userId: user.id } });
  revalidatePath("/accounts");
}

// ==========================================
// TRANSACTIONS
// ==========================================

export async function getTransactions(filters?: {
  type?: string;
  categoryId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  currency?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
}) {
  const user = await getRequiredUser();

  const where: Record<string, unknown> = { userId: user.id };

  if (filters?.type) where.type = filters.type;
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.accountId) where.accountId = filters.accountId;
  if (filters?.currency) where.currency = filters.currency;
  if (filters?.search) {
    where.description = { contains: filters.search, mode: "insensitive" };
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters?.dateFrom) (where.date as Record<string, unknown>).gte = new Date(filters.dateFrom);
    if (filters?.dateTo) (where.date as Record<string, unknown>).lte = new Date(filters.dateTo);
  }

  const orderBy: Record<string, string> = {};
  orderBy[filters?.sortBy ?? "date"] = filters?.sortOrder ?? "desc";

  return prisma.transaction.findMany({
    where,
    orderBy,
    take: filters?.limit,
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      account: { select: { id: true, name: true, type: true } },
      toAccount: { select: { id: true, name: true, type: true } },
      goal: { select: { id: true, name: true } },
      tags: true,
    },
  });
}

export async function createTransaction(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = transactionSchema.parse(data);
  const { tags, date, categoryId, accountId, toAccountId, goalId, paymentMethod, receiptUrl, ...rest } = parsed;

  const tx = await prisma.transaction.create({
    data: {
      ...rest,
      date: new Date(date),
      categoryId: categoryId || null,
      accountId: accountId || null,
      toAccountId: toAccountId || null,
      goalId: goalId || null,
      paymentMethod: paymentMethod || null,
      receiptUrl: receiptUrl || null,
      userId: user.id,
      tags: tags.length > 0
        ? { create: tags.map((name) => ({ name })) }
        : undefined,
    },
    include: { category: true, account: true, tags: true },
  });

  revalidatePath("/finances");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return tx;
}

export async function updateTransaction(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();

  const updateData = { ...data };
  if (data.date) updateData.date = parseLocalDate(data.date as string);

  // Clean optional foreign keys
  const optionalFks = ["categoryId", "accountId", "toAccountId", "goalId", "paymentMethod", "receiptUrl"];
  for (const key of optionalFks) {
    if (key in updateData) updateData[key] = updateData[key] || null;
  }

  if (data.tags) {
    const tags = data.tags as string[];
    delete updateData.tags;
    await prisma.transactionTag.deleteMany({ where: { transactionId: id } });
    if (tags.length > 0) {
      await prisma.transactionTag.createMany({
        data: tags.map((name) => ({ transactionId: id, name })),
      });
    }
  }

  const tx = await prisma.transaction.update({
    where: { id, userId: user.id },
    data: updateData,
  });

  revalidatePath("/finances");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return tx;
}

export async function deleteTransaction(id: string) {
  const user = await getRequiredUser();
  await prisma.transaction.delete({ where: { id, userId: user.id } });
  revalidatePath("/finances");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getCategories(type?: string) {
  const user = await getRequiredUser();
  const where: Record<string, unknown> = { userId: user.id };
  if (type) where.type = type;

  return prisma.transactionCategory.findMany({
    where,
    orderBy: { name: "asc" },
    include: { children: true, _count: { select: { transactions: true } } },
  });
}

export async function createCategory(data: { name: string; type: "INCOME" | "EXPENSE" | "TRANSFER"; icon?: string; color?: string }) {
  const user = await getRequiredUser();
  const cat = await prisma.transactionCategory.create({
    data: { ...data, userId: user.id },
  });
  revalidatePath("/finances");
  revalidatePath("/settings");
  return cat;
}

export async function deleteCategory(id: string) {
  const user = await getRequiredUser();
  await prisma.transactionCategory.delete({ where: { id, userId: user.id } });
  revalidatePath("/finances");
  revalidatePath("/settings");
}

// ==========================================
// RECURRING TRANSACTIONS
// ==========================================

export async function getRecurringTransactions() {
  const user = await getRequiredUser();
  return prisma.recurringTransaction.findMany({
    where: { userId: user.id },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function createRecurringTransaction(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = recurringSchema.parse(data);
  const { categoryId, accountId, paymentMethod, startDate, endDate, ...rest } = parsed;

  const recurring = await prisma.recurringTransaction.create({
    data: {
      ...rest,
      categoryId: categoryId || null,
      accountId: accountId || null,
      paymentMethod: paymentMethod || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      nextDueDate: new Date(startDate),
      userId: user.id,
    },
  });

  revalidatePath("/finances");
  return recurring;
}

export async function toggleRecurring(id: string, isActive: boolean) {
  const user = await getRequiredUser();
  await prisma.recurringTransaction.update({
    where: { id, userId: user.id },
    data: { isActive },
  });
  revalidatePath("/finances");
}

export async function deleteRecurring(id: string) {
  const user = await getRequiredUser();
  await prisma.recurringTransaction.delete({ where: { id, userId: user.id } });
  revalidatePath("/finances");
}
