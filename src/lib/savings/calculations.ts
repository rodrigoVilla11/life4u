import { differenceInDays, eachDayOfInterval, startOfDay, isAfter } from "date-fns";
import { convertToGoalCurrency } from "./currency";
import type {
  GoalParameters,
  DailyEntry,
  GoalAsset,
  GoalMovement,
  DailyRow,
  GoalDashboard,
  GoalDiagnosis,
  ExchangeRateMap,
} from "./types";

// ==========================================
// DAILY ENTRY HELPERS
// ==========================================

/**
 * Determine if entry is "real" (has manual amount) or "projected"
 */
export function getDailyEntryType(entry: DailyEntry): "real" | "projected" {
  return entry.amount !== null ? "real" : "projected";
}

/**
 * Get the effective value for a daily entry in goal currency.
 * Real: actual amount converted. Projected: dailySavingsBase.
 */
export function getDailyEffectiveValue(
  entry: DailyEntry,
  dailySavingsBase: number,
  goalCurrency: string,
  rates: ExchangeRateMap
): number {
  if (entry.amount !== null) {
    return convertToGoalCurrency(entry.amount, entry.currency, goalCurrency, rates);
  }
  return dailySavingsBase; // projected uses base
}

/**
 * Get difference between actual entry value and base
 */
export function getDailyDifferenceVsBase(
  convertedAmount: number,
  dailySavingsBase: number
): number {
  return convertedAmount - dailySavingsBase;
}

// ==========================================
// BUILD DAILY TABLE
// ==========================================

/**
 * Build the full daily table with accumulated values.
 * This replicates the "Ahorro Diario" sheet from the Excel.
 */
export function buildDailyTable(
  params: GoalParameters,
  entries: DailyEntry[],
  rates: ExchangeRateMap
): DailyRow[] {
  const now = new Date();

  // Use YYYY-MM-DD as key to avoid timezone mismatches
  function toDateKey(d: Date | string): string {
    const dt = typeof d === "string" ? new Date(d) : d;
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  // Parse start and end as local dates (not UTC)
  const startStr = toDateKey(params.startDate);
  const endStr = params.deadline ? toDateKey(params.deadline) : toDateKey(now);
  const todayKey = toDateKey(now);

  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  if (isAfter(start, end)) return [];

  const days = eachDayOfInterval({ start, end });

  // Deduplicate days by key (safety net)
  const seenDays = new Set<string>();
  const uniqueDays = days.filter((d) => {
    const k = toDateKey(d);
    if (seenDays.has(k)) return false;
    seenDays.add(k);
    return true;
  });

  const entryMap = new Map<string, DailyEntry>();
  for (const entry of entries) {
    entryMap.set(toDateKey(entry.date), entry);
  }

  const rows: DailyRow[] = [];
  let accumulated = 0;

  for (const day of uniqueDays) {
    const key = toDateKey(day);
    const entry = entryMap.get(key);

    const isPast = key <= todayKey;
    const hasEntry = entry && entry.amount !== null;

    let entryType: "real" | "projected";
    let amount: number;
    let convertedAmount: number;

    if (hasEntry) {
      entryType = "real";
      amount = entry.amount!;
      convertedAmount = convertToGoalCurrency(amount, entry.currency, params.currency, rates);
    } else if (isPast) {
      // Past day with no entry: treat as 0 (missed day)
      entryType = "real";
      amount = 0;
      convertedAmount = 0;
    } else {
      // Future day: projected
      entryType = "projected";
      amount = params.dailySavingsBase;
      convertedAmount = params.dailySavingsBase;
    }

    accumulated += convertedAmount;
    const differenceVsBase = getDailyDifferenceVsBase(convertedAmount, params.dailySavingsBase);

    rows.push({
      date: day,
      entryType,
      amount,
      convertedAmount,
      accumulated,
      differenceVsBase,
      note: entry?.note ?? null,
    });
  }

  return rows;
}

// ==========================================
// ASSETS CALCULATIONS
// ==========================================

export function getAvailableAssetsTotal(
  assets: GoalAsset[],
  goalCurrency: string,
  rates: ExchangeRateMap
): number {
  return assets
    .filter((a) => a.status === "AVAILABLE")
    .reduce((sum, a) => sum + convertToGoalCurrency(a.amount, a.currency, goalCurrency, rates), 0);
}

export function getPendingAssetsTotal(
  assets: GoalAsset[],
  goalCurrency: string,
  rates: ExchangeRateMap
): number {
  return assets
    .filter((a) => a.status === "PENDING")
    .reduce((sum, a) => sum + convertToGoalCurrency(a.amount, a.currency, goalCurrency, rates), 0);
}

// ==========================================
// MOVEMENTS CALCULATIONS
// ==========================================

export function getMovementsTotals(
  movements: GoalMovement[],
  goalCurrency: string,
  rates: ExchangeRateMap
): { expenses: number; bonuses: number } {
  let expenses = 0;
  let bonuses = 0;

  for (const m of movements) {
    const converted = convertToGoalCurrency(m.amount, m.currency, goalCurrency, rates);
    if (m.type === "EXPENSE" || m.type === "LOAN_GIVEN") {
      expenses += converted;
    } else {
      bonuses += converted;
    }
  }

  return { expenses, bonuses };
}

// ==========================================
// ACCUMULATED SAVINGS
// ==========================================

/**
 * Get the total of REAL daily savings (only days with actual entries)
 */
export function getRealSavingsAccumulated(dailyTable: DailyRow[]): number {
  return dailyTable
    .filter((r) => r.entryType === "real")
    .reduce((sum, r) => sum + r.convertedAmount, 0);
}

/**
 * Get the projected savings for remaining days
 */
export function getProjectedSavingsRemaining(dailyTable: DailyRow[]): number {
  return dailyTable
    .filter((r) => r.entryType === "projected")
    .reduce((sum, r) => sum + r.convertedAmount, 0);
}

// ==========================================
// GOAL TOTALS
// ==========================================

/**
 * Real total today = realSavings + availableAssets - expenses + bonuses
 */
export function getGoalRealTotalToday(
  realSavings: number,
  availableAssets: number,
  expenses: number,
  bonuses: number
): number {
  return realSavings + availableAssets - expenses + bonuses;
}

/**
 * Estimated total at deadline = realTotal + projectedRemaining + pendingAssets
 */
export function getGoalEstimatedTotal(
  realTotalToday: number,
  projectedRemaining: number,
  pendingAssets: number
): number {
  return realTotalToday + projectedRemaining + pendingAssets;
}

// ==========================================
// PROGRESS & REQUIRED PER DAY
// ==========================================

export function getGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function getGoalRequiredPerDay(
  remaining: number,
  daysLeft: number
): number {
  if (daysLeft <= 0) return remaining;
  return remaining / daysLeft;
}

// ==========================================
// DIAGNOSIS / STATUS
// ==========================================

export function getGoalStatus(
  realTotalToday: number,
  estimatedTotal: number,
  targetMin: number,
  targetIdeal: number,
  deadline: Date | null,
  daysPassed: number,
  totalDays: number
): GoalDiagnosis {
  if (realTotalToday >= targetIdeal) return "COMPLETED";
  if (!deadline) return "NO_DEADLINE";
  if (totalDays <= 0) return "NO_DEADLINE";

  // Expected progress based on time elapsed
  const expectedProgressMin = (daysPassed / totalDays) * targetMin;
  const expectedProgressIdeal = (daysPassed / totalDays) * targetIdeal;

  if (realTotalToday >= expectedProgressIdeal * 0.95) return "EXCELLENT";
  if (realTotalToday >= expectedProgressMin * 0.9) return "ON_TRACK";
  if (realTotalToday >= expectedProgressMin * 0.7) return "BEHIND";
  return "CRITICAL";
}

// ==========================================
// FULL GOAL DASHBOARD COMPUTATION
// ==========================================

/**
 * Compute the complete dashboard for a single goal.
 * This is the equivalent of the Excel "Dashboard" sheet.
 */
export function computeGoalDashboard(
  params: GoalParameters,
  entries: DailyEntry[],
  assets: GoalAsset[],
  movements: GoalMovement[],
  rates: ExchangeRateMap
): GoalDashboard {
  const now = startOfDay(new Date());
  const start = startOfDay(new Date(params.startDate));
  const deadline = params.deadline ? startOfDay(new Date(params.deadline)) : null;

  // Time calculations
  const totalDays = deadline ? Math.max(differenceInDays(deadline, start), 1) : 0;
  const daysPassed = Math.max(differenceInDays(now, start), 0);
  const daysRemaining = deadline ? Math.max(differenceInDays(deadline, now), 0) : 0;

  // Build daily table
  const dailyTable = buildDailyTable(params, entries, rates);
  const daysLoaded = dailyTable.filter(
    (r) => r.entryType === "real" && r.convertedAmount > 0
  ).length;

  // Savings
  const realSavingsAccumulated = getRealSavingsAccumulated(dailyTable);
  const projectedSavingsRemaining = getProjectedSavingsRemaining(dailyTable);

  // Assets
  const availableAssets = getAvailableAssetsTotal(assets, params.currency, rates);
  const pendingAssets = getPendingAssetsTotal(assets, params.currency, rates);

  // Movements
  const { expenses: totalExpenses, bonuses: totalBonuses } = getMovementsTotals(movements, params.currency, rates);

  // Totals
  const realTotalToday = getGoalRealTotalToday(realSavingsAccumulated, availableAssets, totalExpenses, totalBonuses);
  const estimatedTotalAtDeadline = getGoalEstimatedTotal(realTotalToday, projectedSavingsRemaining, pendingAssets);

  // vs Targets
  const diffVsTargetMin = estimatedTotalAtDeadline - params.targetMin;
  const diffVsTargetIdeal = estimatedTotalAtDeadline - params.targetIdeal;
  const progressVsMin = getGoalProgress(realTotalToday, params.targetMin);
  const progressVsIdeal = getGoalProgress(realTotalToday, params.targetIdeal);

  // Required per day
  const remainingForMin = Math.max(params.targetMin - realTotalToday, 0);
  const remainingForIdeal = Math.max(params.targetIdeal - realTotalToday, 0);
  const requiredPerDayForMin = getGoalRequiredPerDay(remainingForMin, daysRemaining);
  const requiredPerDayForIdeal = getGoalRequiredPerDay(remainingForIdeal, daysRemaining);

  // Status
  const status = getGoalStatus(
    realTotalToday,
    estimatedTotalAtDeadline,
    params.targetMin,
    params.targetIdeal,
    deadline,
    daysPassed,
    totalDays
  );

  return {
    goalId: params.id,
    name: params.name,
    currency: params.currency,
    targetMin: params.targetMin,
    targetIdeal: params.targetIdeal,
    startDate: start,
    deadline,
    totalDays,
    daysPassed,
    daysLoaded,
    daysRemaining,
    realSavingsAccumulated,
    projectedSavingsRemaining,
    availableAssets,
    pendingAssets,
    totalExpenses,
    totalBonuses,
    realTotalToday,
    estimatedTotalAtDeadline,
    diffVsTargetMin,
    diffVsTargetIdeal,
    progressVsMin,
    progressVsIdeal,
    requiredPerDayForMin,
    requiredPerDayForIdeal,
    status,
  };
}
