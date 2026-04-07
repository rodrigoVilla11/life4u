// ==========================================
// SAVINGS GOAL TYPES (Excel-based multi-goal)
// ==========================================

export interface GoalParameters {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  targetMin: number;
  targetIdeal: number;
  dailySavingsBase: number;
  startDate: Date | string;
  deadline: Date | string | null;
  category: string | null;
  color: string | null;
  icon: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
}

export interface DailyEntry {
  id: string;
  date: Date | string;
  amount: number | null;  // null = not yet entered
  currency: string;
  note: string | null;
}

export interface GoalAsset {
  id: string;
  description: string;
  type: string;
  currency: string;
  amount: number;
  status: "AVAILABLE" | "PENDING" | "LOCKED" | "SOLD";
  note: string | null;
}

export interface GoalMovement {
  id: string;
  date: Date | string;
  description: string;
  type: "EXPENSE" | "LOAN_GIVEN" | "LOAN_RECEIVED" | "ADJUSTMENT" | "BONUS";
  currency: string;
  amount: number;
  note: string | null;
}

export interface ExchangeRateMap {
  [key: string]: number; // "USD_EUR" -> 0.92
}

// ==========================================
// COMPUTED DAILY ROW (what each day looks like)
// ==========================================

export interface DailyRow {
  date: Date;
  entryType: "real" | "projected";
  amount: number;          // in entry currency
  convertedAmount: number; // in goal currency
  accumulated: number;     // running total in goal currency
  differenceVsBase: number; // vs dailySavingsBase
  note: string | null;
}

// ==========================================
// GOAL DASHBOARD (computed summary)
// ==========================================

export interface GoalDashboard {
  // Parameters
  goalId: string;
  name: string;
  currency: string;
  targetMin: number;
  targetIdeal: number;
  startDate: Date;
  deadline: Date | null;

  // Time
  totalDays: number;
  daysPassed: number;
  daysLoaded: number;       // days with real entries
  daysRemaining: number;

  // Savings
  realSavingsAccumulated: number;    // sum of real daily entries
  projectedSavingsRemaining: number; // remaining days * dailySavingsBase

  // Assets
  availableAssets: number;    // sum of AVAILABLE assets in goal currency
  pendingAssets: number;      // sum of PENDING assets in goal currency

  // Movements
  totalExpenses: number;      // sum of EXPENSE + LOAN_GIVEN
  totalBonuses: number;       // sum of LOAN_RECEIVED + BONUS + ADJUSTMENT(positive)

  // Totals
  realTotalToday: number;     // realSavings + availableAssets - expenses + bonuses
  estimatedTotalAtDeadline: number; // realTotal + projectedRemaining + pendingAssets

  // vs Targets
  diffVsTargetMin: number;
  diffVsTargetIdeal: number;
  progressVsMin: number;      // percentage
  progressVsIdeal: number;    // percentage

  // Required per day
  requiredPerDayForMin: number;
  requiredPerDayForIdeal: number;

  // Status
  status: GoalDiagnosis;
}

export type GoalDiagnosis =
  | "EXCELLENT"      // vas muy bien - ahead of ideal
  | "ON_TRACK"       // vas bien - between min and ideal pace
  | "BEHIND"         // ajustá - behind min pace
  | "CRITICAL"       // muy atrasado
  | "COMPLETED"      // meta alcanzada
  | "NO_DEADLINE";   // sin fecha objetivo

export interface GlobalSavingsOverview {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  goalsAtRisk: number;
  totalSavedAllGoals: number;
  totalTargetMinAllGoals: number;
  totalTargetIdealAllGoals: number;
  overallProgressMin: number;
  overallProgressIdeal: number;
  goals: GoalDashboard[];
}
