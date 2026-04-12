import type { Metadata } from "next";
import { getMonthlyReport, getCategoryBreakdown } from "@/actions/dashboard";
import { getAccounts } from "@/actions/finance";
import { getGoals } from "@/actions/goals";
import { ReportsPageClient } from "@/components/reports/reports-page-client";

export const metadata: Metadata = { title: "Reportes" };

export default async function ReportsPage() {
  const [monthlyReport, expenseBreakdown, incomeBreakdown, accounts, goals] = await Promise.all([
    getMonthlyReport(12),
    getCategoryBreakdown("EXPENSE"),
    getCategoryBreakdown("INCOME"),
    getAccounts(),
    getGoals(),
  ]);

  return (
    <ReportsPageClient
      monthlyReport={monthlyReport}
      expenseBreakdown={expenseBreakdown}
      incomeBreakdown={incomeBreakdown}
      accounts={JSON.parse(JSON.stringify(accounts))}
      goals={JSON.parse(JSON.stringify(goals))}
    />
  );
}
