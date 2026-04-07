export type {
  User,
  UserSettings,
  Task,
  TaskGroup,
  TaskTag,
  Account,
  Transaction,
  TransactionCategory,
  TransactionTag,
  SavingsGoal,
  SavingsGoalDailyEntry,
  SavingsGoalAsset,
  SavingsGoalMovement,
  RecurringTransaction,
  ExchangeRate
} from "@prisma/client";

export type {
  TaskPriority,
  TaskStatus,
  AccountType,
  TransactionType,
  PaymentMethod,
  GoalPriority,
  GoalStatus,
  Frequency,
  AssetType,
  AssetStatus,
  MovementType,
} from "@prisma/client";

// Re-export savings types
import type {
  GoalDashboard as _GoalDashboard,
  GoalDiagnosis as _GoalDiagnosis,
} from "@/lib/savings/types";

export type GoalDashboard = _GoalDashboard;
export type GoalDiagnosis = _GoalDiagnosis;
export type {
  GoalParameters,
  DailyEntry,
  DailyRow,
  GoalAsset,
  GoalMovement,
  ExchangeRateMap,
  GlobalSavingsOverview,
} from "@/lib/savings/types";

// ==========================================
// TASK TREE TYPES
// ==========================================

export interface TaskNode {
  id: string;
  userId: string;
  groupId: string;
  parentId: string | null;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: Date | string | null;
  dueTime: string | null;
  isFavorite: boolean;
  position: number;
  level: number;
  isCollapsed: boolean;
  completedAt: Date | string | null;
  archivedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags: Array<{ id: string; name: string; color: string | null }>;
  goal: { id: string; name: string } | null;
  children: TaskNode[];
  childrenCount: number;
  completedChildrenCount: number;
  progress: number;
}

export interface TaskGroupWithTasks {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  position: number;
  goalId: string | null;
  goal: { id: string; name: string } | null;
  archivedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tasks: TaskNode[];
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

// ==========================================
// FINANCE TYPES
// ==========================================

export interface AccountWithBalance {
  id: string;
  name: string;
  type: string;
  currency: string;
  initialBalance: number;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

// Backwards compat alias - used by tasks linking, dashboard, reports
export interface GoalWithProgress {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string | null;
  color: string | null;
  icon: string | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  progress: number;
  remaining: number;
  daysLeft: number | null;
  monthlyNeeded: number | null;
  weeklyNeeded: number | null;
  dailyNeeded: number | null;
  isOnTrack: boolean | null;
  createdAt: Date;
  contributions: Array<{
    id: string;
    amount: number;
    type: "DEPOSIT" | "WITHDRAWAL";
    note: string | null;
    date: Date;
  }>;
}

export interface DashboardData {
  tasksSummary: {
    todayPending: number;
    overdue: number;
    completedThisWeek: number;
    total: number;
  };
  financeSummary: {
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    totalSavings: number;
  };
  goalsSummary: {
    activeGoals: number;
    closestGoal: GoalDashboard | null;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    description: string | null;
    date: Date;
    category: { name: string; icon: string | null } | null;
  }>;
  upcomingRecurring: Array<{
    id: string;
    name: string;
    amount: number;
    currency: string;
    nextDueDate: Date;
    type: string;
  }>;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
