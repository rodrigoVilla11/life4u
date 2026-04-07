"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { getCurrencySymbol } from "@/lib/constants";
import { DIAGNOSIS_CONFIG } from "@/lib/savings/status";
import {
  TrendingUp, TrendingDown, DollarSign, Target, Wallet,
  ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react";
import type { MonthlyReport, CategoryBreakdown, GoalDashboard, AccountWithBalance } from "@/types";

interface ReportsPageClientProps {
  monthlyReport: MonthlyReport[];
  expenseBreakdown: CategoryBreakdown[];
  incomeBreakdown: CategoryBreakdown[];
  accounts: AccountWithBalance[];
  goals: GoalDashboard[];
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "13px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

export function ReportsPageClient({
  monthlyReport, expenseBreakdown, incomeBreakdown, accounts, goals,
}: ReportsPageClientProps) {
  const totalIncome = monthlyReport.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlyReport.reduce((s, m) => s + m.expense, 0);
  const balance = totalIncome - totalExpense;
  const months = monthlyReport.length || 1;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground text-[15px] mt-1">Análisis de tus finanzas y progreso</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={TrendingUp} label="Ingresos Totales" value={`$${totalIncome.toLocaleString()}`}
          color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-900/30" />
        <SummaryCard icon={TrendingDown} label="Gastos Totales" value={`$${totalExpense.toLocaleString()}`}
          color="text-red-600 dark:text-red-400" bg="bg-red-100 dark:bg-red-900/30" />
        <SummaryCard icon={DollarSign} label="Prom. Gasto/Mes" value={`$${Math.round(totalExpense / months).toLocaleString()}`}
          color="text-orange-600 dark:text-orange-400" bg="bg-orange-100 dark:bg-orange-900/30" />
        <SummaryCard icon={BarChart3} label="Balance Neto"
          value={`${balance >= 0 ? "+" : ""}$${balance.toLocaleString()}`}
          color={balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
          bg={balance >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Ingresos vs Gastos" subtitle="Últimos meses">
              {monthlyReport.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyReport} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`$${Number(v).toLocaleString()}`, n === "income" ? "Ingresos" : "Gastos"]} />
                    <Bar dataKey="income" name="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
              <ChartLegend items={[{ color: "#10b981", label: "Ingresos" }, { color: "#ef4444", label: "Gastos" }]} />
            </ChartCard>

            <ChartCard title="Balance Mensual" subtitle="Tendencia">
              {monthlyReport.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyReport} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Balance"]} />
                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </ChartCard>
          </div>
        </TabsContent>

        {/* ===== EXPENSES ===== */}
        <TabsContent value="expenses" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ChartCard title="Distribución de Gastos">
                {expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                        dataKey="amount" nameKey="category" paddingAngle={2}>
                        {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>
            </div>
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[15px] mb-4">Top Categorías de Gasto</h3>
                  {expenseBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {expenseBreakdown.slice(0, 8).map((cat) => (
                        <div key={cat.category} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                              <span className="font-medium">{cat.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">${cat.amount.toLocaleString()}</span>
                              <Badge variant="secondary" className="text-[10px] min-w-[40px] justify-center">{cat.percentage.toFixed(0)}%</Badge>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground text-center py-8 text-sm">No hay datos todavía</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== INCOME ===== */}
        <TabsContent value="income" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ChartCard title="Fuentes de Ingreso">
                {incomeBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={incomeBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                        dataKey="amount" nameKey="category" paddingAngle={2}>
                        {incomeBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>
            </div>
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[15px] mb-4">Detalle de Ingresos</h3>
                  {incomeBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {incomeBreakdown.map((cat) => (
                        <div key={cat.category} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                              <span className="font-medium">{cat.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">${cat.amount.toLocaleString()}</span>
                              <Badge variant="secondary" className="text-[10px] min-w-[40px] justify-center">{cat.percentage.toFixed(0)}%</Badge>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground text-center py-8 text-sm">No hay datos todavía</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== ACCOUNTS ===== */}
        <TabsContent value="accounts" className="mt-4">
          {accounts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((acc) => (
                <Card key={acc.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${acc.color ?? "#6b7280"}15` }}>
                        <Wallet className="h-5 w-5" style={{ color: acc.color ?? "#6b7280" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{acc.name}</p>
                        <p className="text-[11px] text-muted-foreground">{acc.currency}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold tracking-tight mb-2">
                      {getCurrencySymbol(acc.currency)}{acc.currentBalance.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight className="h-3 w-3" /> +${acc.totalIncome.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <ArrowDownRight className="h-3 w-3" /> -${acc.totalExpense.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-center py-12">No hay cuentas creadas todavía</p>}
        </TabsContent>

        {/* ===== GOALS ===== */}
        <TabsContent value="goals" className="mt-4">
          {goals.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {goals.map((goal) => {
                const cfg = DIAGNOSIS_CONFIG[goal.status];
                const sym = getCurrencySymbol(goal.currency);
                return (
                  <Card key={goal.goalId}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                            <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{goal.name}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color}`}>
                              {cfg.emoji} {cfg.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-bold shrink-0">{goal.progressVsMin.toFixed(0)}%</p>
                      </div>
                      <Progress value={goal.progressVsMin} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{sym}{goal.realTotalToday.toLocaleString()} de {sym}{goal.targetMin.toLocaleString()}</span>
                        {goal.daysRemaining > 0 && <span>{goal.daysRemaining}d · {sym}{goal.requiredPerDayForMin.toFixed(0)}/día</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : <p className="text-muted-foreground text-center py-12">No hay metas creadas todavía</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== HELPER COMPONENTS =====

function SummaryCard({ icon: Icon, label, value, color, bg }: {
  icon: typeof TrendingUp; label: string; value: string; color: string; bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
          <Icon className={`h-4.5 w-4.5 ${color}`} />
        </div>
        <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-[15px]">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ChartLegend({ items }: { items: Array<{ color: string; label: string }> }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart() {
  return <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">No hay datos disponibles</div>;
}
