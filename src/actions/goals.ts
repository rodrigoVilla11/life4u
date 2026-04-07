"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { goalSchema, dailyEntrySchema, goalAssetSchema, goalMovementSchema } from "@/schemas/goal";
import { parseLocalDate } from "@/lib/utils";
import { computeGoalDashboard, buildDailyTable } from "@/lib/savings/calculations";
import { buildExchangeRateMap } from "@/lib/savings/currency";
import type { GoalDashboard, GoalParameters, DailyEntry, GoalAsset, GoalMovement, DailyRow, GlobalSavingsOverview } from "@/lib/savings/types";

// ==========================================
// EXCHANGE RATES (shared)
// ==========================================

async function getUserExchangeRates(userId: string) {
  const rates = await prisma.exchangeRate.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { date: "desc" },
  });
  // Deduplicate: keep latest rate per pair
  const seen = new Set<string>();
  const unique = rates.filter((r) => {
    const key = `${r.fromCurrency}_${r.toCurrency}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return buildExchangeRateMap(unique);
}

// ==========================================
// GOAL CRUD
// ==========================================

export async function getGoals(statusFilter?: string): Promise<GoalDashboard[]> {
  const user = await getRequiredUser();
  const where: Record<string, unknown> = { userId: user.id };
  if (statusFilter) where.status = statusFilter;

  const goals = await prisma.savingsGoal.findMany({
    where,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      dailyEntries: { orderBy: { date: "asc" } },
      assets: true,
      movements: { orderBy: { date: "asc" } },
    },
  });

  const rates = await getUserExchangeRates(user.id);

  return goals.map((goal) => {
    const params: GoalParameters = {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      currency: goal.currency,
      targetMin: goal.targetMin,
      targetIdeal: goal.targetIdeal,
      dailySavingsBase: goal.dailySavingsBase,
      startDate: goal.startDate,
      deadline: goal.deadline,
      category: goal.category,
      color: goal.color,
      icon: goal.icon,
      priority: goal.priority,
      status: goal.status,
    };

    return computeGoalDashboard(
      params,
      goal.dailyEntries as DailyEntry[],
      goal.assets as GoalAsset[],
      goal.movements as GoalMovement[],
      rates
    );
  });
}

export async function getGoalFull(id: string) {
  const user = await getRequiredUser();

  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId: user.id },
    include: {
      dailyEntries: { orderBy: { date: "asc" } },
      assets: { orderBy: { createdAt: "desc" } },
      movements: { orderBy: { date: "desc" } },
    },
  });

  if (!goal) return null;

  const rates = await getUserExchangeRates(user.id);

  const params: GoalParameters = {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    currency: goal.currency,
    targetMin: goal.targetMin,
    targetIdeal: goal.targetIdeal,
    dailySavingsBase: goal.dailySavingsBase,
    startDate: goal.startDate,
    deadline: goal.deadline,
    category: goal.category,
    color: goal.color,
    icon: goal.icon,
    priority: goal.priority,
    status: goal.status,
  };

  const dashboard = computeGoalDashboard(
    params,
    goal.dailyEntries as DailyEntry[],
    goal.assets as GoalAsset[],
    goal.movements as GoalMovement[],
    rates
  );

  const dailyTable = buildDailyTable(
    params,
    goal.dailyEntries as DailyEntry[],
    rates
  );

  return {
    goal: params,
    dashboard,
    dailyTable: JSON.parse(JSON.stringify(dailyTable)) as DailyRow[],
    dailyEntries: JSON.parse(JSON.stringify(goal.dailyEntries)) as DailyEntry[],
    assets: JSON.parse(JSON.stringify(goal.assets)) as GoalAsset[],
    movements: JSON.parse(JSON.stringify(goal.movements)) as GoalMovement[],
    rates,
  };
}

export async function getGlobalOverview(): Promise<GlobalSavingsOverview> {
  const goals = await getGoals();

  const activeGoals = goals.filter((g) => g.status !== "COMPLETED");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const goalsAtRisk = goals.filter((g) => g.status === "BEHIND" || g.status === "CRITICAL");

  const totalSavedAllGoals = goals.reduce((sum, g) => sum + g.realTotalToday, 0);
  const totalTargetMinAllGoals = goals.reduce((sum, g) => sum + g.targetMin, 0);
  const totalTargetIdealAllGoals = goals.reduce((sum, g) => sum + g.targetIdeal, 0);

  return {
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    goalsAtRisk: goalsAtRisk.length,
    totalSavedAllGoals,
    totalTargetMinAllGoals,
    totalTargetIdealAllGoals,
    overallProgressMin: totalTargetMinAllGoals > 0 ? (totalSavedAllGoals / totalTargetMinAllGoals) * 100 : 0,
    overallProgressIdeal: totalTargetIdealAllGoals > 0 ? (totalSavedAllGoals / totalTargetIdealAllGoals) * 100 : 0,
    goals,
  };
}

export async function createGoal(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = goalSchema.parse(data);

  const goal = await prisma.savingsGoal.create({
    data: {
      name: parsed.name,
      description: parsed.description || null,
      currency: parsed.currency,
      targetMin: Number(parsed.targetMin),
      targetIdeal: Number(parsed.targetIdeal),
      dailySavingsBase: Number(parsed.dailySavingsBase),
      startDate: parseLocalDate(parsed.startDate),
      deadline: parsed.deadline ? parseLocalDate(parsed.deadline) : null,
      priority: parsed.priority,
      category: parsed.category || null,
      color: parsed.color || null,
      icon: parsed.icon || null,
      userId: user.id,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function updateGoal(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const updateData = { ...data };

  if (data.startDate) updateData.startDate = parseLocalDate(data.startDate as string);
  if (data.deadline !== undefined) {
    updateData.deadline = data.deadline ? parseLocalDate(data.deadline as string) : null;
  }
  // Clean optional string fields
  if ("category" in updateData) updateData.category = updateData.category || null;
  if ("color" in updateData) updateData.color = updateData.color || null;
  if ("icon" in updateData) updateData.icon = updateData.icon || null;
  if ("description" in updateData) updateData.description = updateData.description || null;
  // Ensure numbers
  if ("targetMin" in updateData) updateData.targetMin = Number(updateData.targetMin);
  if ("targetIdeal" in updateData) updateData.targetIdeal = Number(updateData.targetIdeal);
  if ("dailySavingsBase" in updateData) updateData.dailySavingsBase = Number(updateData.dailySavingsBase);

  await prisma.savingsGoal.update({
    where: { id, userId: user.id },
    data: updateData,
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteGoal(id: string) {
  const user = await getRequiredUser();
  await prisma.savingsGoal.delete({ where: { id, userId: user.id } });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

// ==========================================
// DAILY ENTRIES
// ==========================================

export async function upsertDailyEntry(goalId: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = dailyEntrySchema.parse(data);

  // Verify goal belongs to user
  const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goal) throw new Error("Goal not found");

  const date = new Date(parsed.date);
  date.setHours(0, 0, 0, 0);

  await prisma.savingsGoalDailyEntry.upsert({
    where: { goalId_date: { goalId, date } },
    update: { amount: parsed.amount, currency: parsed.currency, note: parsed.note },
    create: { goalId, date, amount: parsed.amount, currency: parsed.currency, note: parsed.note },
  });

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteDailyEntry(id: string) {
  await prisma.savingsGoalDailyEntry.delete({ where: { id } });
  revalidatePath("/goals");
}

// ==========================================
// ASSETS
// ==========================================

export async function createGoalAsset(goalId: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = goalAssetSchema.parse(data);

  const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goal) throw new Error("Goal not found");

  const asset = await prisma.savingsGoalAsset.create({
    data: { ...parsed, goalId },
  });

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
  return asset;
}

export async function updateGoalAsset(id: string, data: Record<string, unknown>) {
  await prisma.savingsGoalAsset.update({ where: { id }, data });
  revalidatePath("/goals");
}

export async function deleteGoalAsset(id: string) {
  await prisma.savingsGoalAsset.delete({ where: { id } });
  revalidatePath("/goals");
}

// ==========================================
// MOVEMENTS
// ==========================================

export async function createGoalMovement(goalId: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = goalMovementSchema.parse(data);

  const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goal) throw new Error("Goal not found");

  const movement = await prisma.savingsGoalMovement.create({
    data: {
      ...parsed,
      date: parseLocalDate(parsed.date),
      goalId,
    },
  });

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
  return movement;
}

export async function updateGoalMovement(id: string, data: Record<string, unknown>) {
  const updateData = { ...data };
  if (data.date) updateData.date = parseLocalDate(data.date as string);
  await prisma.savingsGoalMovement.update({ where: { id }, data: updateData });
  revalidatePath("/goals");
}

export async function deleteGoalMovement(id: string) {
  await prisma.savingsGoalMovement.delete({ where: { id } });
  revalidatePath("/goals");
}

// ==========================================
// EXCHANGE RATES
// ==========================================

export async function getExchangeRates() {
  const user = await getRequiredUser();
  return prisma.exchangeRate.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: { date: "desc" },
  });
}

export async function upsertExchangeRate(data: { fromCurrency: string; toCurrency: string; rate: number }) {
  const user = await getRequiredUser();
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  await prisma.exchangeRate.upsert({
    where: { fromCurrency_toCurrency_date: { fromCurrency: data.fromCurrency, toCurrency: data.toCurrency, date } },
    update: { rate: data.rate },
    create: { ...data, date, userId: user.id },
  });

  revalidatePath("/goals");
  revalidatePath("/settings");
}

export async function deleteExchangeRate(id: string) {
  await prisma.exchangeRate.delete({ where: { id } });
  revalidatePath("/goals");
  revalidatePath("/settings");
}
