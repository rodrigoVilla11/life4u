"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredUser, getUserTimezone } from "@/lib/auth-helpers";
import { subMonths, format } from "date-fns";
import {
  nowInTimezone, startOfDayInTz, endOfDayInTz,
  startOfWeekInTz, endOfWeekInTz, startOfMonthInTz, endOfMonthInTz,
} from "@/lib/timezone";
import { getGoals } from "./goals";
import type { DashboardData, MonthlyReport, CategoryBreakdown } from "@/types";

export async function getDashboardData(): Promise<DashboardData> {
  const user = await getRequiredUser();
  const tz = await getUserTimezone();
  const now = nowInTimezone(tz);
  const monthStart = startOfMonthInTz(now, tz);
  const monthEnd = endOfMonthInTz(now, tz);
  const weekStart = startOfWeekInTz(now, tz);
  const weekEnd = endOfWeekInTz(now, tz);
  const todayStart = startOfDayInTz(now, tz);
  const todayEnd = endOfDayInTz(now, tz);

  // Tasks summary
  const [todayPending, overdue, completedThisWeek, totalTasks] = await Promise.all([
    prisma.task.count({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { gte: todayStart, lte: todayEnd },
        archivedAt: null,
      },
    }),
    prisma.task.count({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { lt: todayStart },
        archivedAt: null,
      },
    }),
    prisma.task.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    }),
    prisma.task.count({
      where: { userId: user.id, archivedAt: null },
    }),
  ]);

  // Finance summary
  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: monthStart, lte: monthEnd },
    },
  });

  let monthIncome = 0;
  let monthExpense = 0;
  monthTransactions.forEach((t) => {
    if (t.type === "INCOME") monthIncome += t.amount;
    else if (t.type === "EXPENSE") monthExpense += t.amount;
  });

  // Total savings from goals (using new GoalDashboard)
  const goals = await getGoals("ACTIVE");
  const totalSavings = goals.reduce((sum, g) => sum + g.realTotalToday, 0);
  const closestGoal = goals
    .filter((g) => g.status !== "COMPLETED")
    .sort((a, b) => b.progressVsMin - a.progressVsMin)[0] ?? null;

  // Recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 5,
    include: {
      category: { select: { name: true, icon: true } },
    },
  });

  // Upcoming recurring
  const upcomingRecurring = await prisma.recurringTransaction.findMany({
    where: {
      userId: user.id,
      isActive: true,
      nextDueDate: { gte: now },
    },
    orderBy: { nextDueDate: "asc" },
    take: 5,
  });

  return {
    tasksSummary: {
      todayPending,
      overdue,
      completedThisWeek,
      total: totalTasks,
    },
    financeSummary: {
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
      totalSavings,
    },
    goalsSummary: {
      activeGoals: goals.length,
      closestGoal,
    },
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      description: t.description,
      date: t.date,
      category: t.category,
    })),
    upcomingRecurring: upcomingRecurring.map((r) => ({
      id: r.id,
      name: r.name,
      amount: r.amount,
      currency: r.currency,
      nextDueDate: r.nextDueDate,
      type: r.type,
    })),
  };
}

export async function getMonthlyReport(months: number = 6): Promise<MonthlyReport[]> {
  const user = await getRequiredUser();
  const tz = await getUserTimezone();
  const now = nowInTimezone(tz);
  const reports: MonthlyReport[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonthInTz(date, tz);
    const end = endOfMonthInTz(date, tz);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: start, lte: end },
        type: { in: ["INCOME", "EXPENSE"] },
      },
    });

    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === "INCOME") income += t.amount;
      else expense += t.amount;
    });

    reports.push({
      month: format(date, "MMM yyyy"),
      income,
      expense,
      balance: income - expense,
    });
  }

  return reports;
}

export async function getCategoryBreakdown(
  type: "INCOME" | "EXPENSE",
  dateFrom?: string,
  dateTo?: string
): Promise<CategoryBreakdown[]> {
  const user = await getRequiredUser();

  const where: Record<string, unknown> = {
    userId: user.id,
    type,
  };

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: { select: { name: true, color: true } } },
  });

  const categoryMap = new Map<string, { amount: number; color: string }>();
  let total = 0;

  transactions.forEach((t) => {
    const catName = t.category?.name ?? "Sin categoría";
    const catColor = t.category?.color ?? "#6b7280";
    const existing = categoryMap.get(catName) ?? { amount: 0, color: catColor };
    existing.amount += t.amount;
    categoryMap.set(catName, existing);
    total += t.amount;
  });

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

  return Array.from(categoryMap.entries())
    .map(([category, data], i) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      color: data.color !== "#6b7280" ? data.color : colors[i % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getDashboardConfig() {
  const user = await getRequiredUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
    select: { dashboardWidgetOrder: true, dashboardWallpaper: true, accentColor: true },
  });
  return {
    widgetConfig: settings?.dashboardWidgetOrder ? JSON.parse(settings.dashboardWidgetOrder) : null,
    wallpaper: settings?.dashboardWallpaper ?? null,
    accentColor: settings?.accentColor ?? "blue",
  };
}

export async function saveDashboardConfig(data: { widgetConfig?: string; wallpaper?: string; accentColor?: string }) {
  const user = await getRequiredUser();
  const updateData: Record<string, unknown> = {};
  if (data.widgetConfig !== undefined) updateData.dashboardWidgetOrder = data.widgetConfig;
  if (data.wallpaper !== undefined) updateData.dashboardWallpaper = data.wallpaper || null;
  if (data.accentColor !== undefined) updateData.accentColor = data.accentColor;

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: updateData,
    create: { userId: user.id, ...updateData },
  });
  revalidatePath("/dashboard");
}

export async function getUserSettings() {
  const user = await getRequiredUser();
  return prisma.userSettings.findUnique({ where: { userId: user.id } });
}

export async function updateUserSettings(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });
  revalidatePath("/");
  return settings;
}
