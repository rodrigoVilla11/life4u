"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCurrencySymbol } from "@/lib/constants";
import { DIAGNOSIS_CONFIG } from "@/lib/savings/status";
import type { GoalDashboard } from "@/lib/savings/types";
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Clock,
  ArrowUp,
  ArrowDown,
  Wallet,
  Banknote,
} from "lucide-react";

interface GoalMetricsPanelProps {
  dashboard: GoalDashboard;
  currency: string;
}

function fmt(amount: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  return `${sym}${amount.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  subtext?: string;
}) {
  return (
    <Card className="p-4 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color ?? "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`text-xl font-bold ${color ?? ""}`}>{value}</p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </Card>
  );
}

export function GoalMetricsPanel({ dashboard, currency }: GoalMetricsPanelProps) {
  const config = DIAGNOSIS_CONFIG[dashboard.status];
  const progressMin = Math.min(Math.max(dashboard.progressVsMin, 0), 100);
  const progressIdeal = Math.min(Math.max(dashboard.progressVsIdeal, 0), 100);

  return (
    <div className="space-y-6">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${config.color} ${config.bgColor}`}>
          <span className="text-lg">{config.emoji}</span>
          <span>{config.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>

      {/* Progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progreso vs Meta Mínima</span>
            <span className="text-sm font-bold">{progressMin.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressMin}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{fmt(dashboard.realTotalToday, currency)}</span>
            <span>{fmt(dashboard.targetMin, currency)}</span>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progreso vs Meta Ideal</span>
            <span className="text-sm font-bold">{progressIdeal.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressIdeal}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{fmt(dashboard.realTotalToday, currency)}</span>
            <span>{fmt(dashboard.targetIdeal, currency)}</span>
          </div>
        </Card>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Meta Mínima"
          value={fmt(dashboard.targetMin, currency)}
          icon={Target}
          color="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          label="Meta Ideal"
          value={fmt(dashboard.targetIdeal, currency)}
          icon={Target}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          label="Ahorro Real Hoy"
          value={fmt(dashboard.realTotalToday, currency)}
          icon={DollarSign}
          color="text-green-600 dark:text-green-400"
        />
        <MetricCard
          label="Estimado al Cierre"
          value={fmt(dashboard.estimatedTotalAtDeadline, currency)}
          icon={BarChart3}
          color="text-purple-600 dark:text-purple-400"
          subtext="Incluye proyecciones"
        />
        <MetricCard
          label="Diff vs Mínima"
          value={fmt(dashboard.diffVsTargetMin, currency)}
          icon={dashboard.diffVsTargetMin >= 0 ? ArrowUp : ArrowDown}
          color={dashboard.diffVsTargetMin >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
        />
        <MetricCard
          label="Diff vs Ideal"
          value={fmt(dashboard.diffVsTargetIdeal, currency)}
          icon={dashboard.diffVsTargetIdeal >= 0 ? ArrowUp : ArrowDown}
          color={dashboard.diffVsTargetIdeal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
        />
        <MetricCard
          label="Activos Disponibles"
          value={fmt(dashboard.availableAssets, currency)}
          icon={Wallet}
          color="text-cyan-600 dark:text-cyan-400"
        />
        <MetricCard
          label="Activos Pendientes"
          value={fmt(dashboard.pendingAssets, currency)}
          icon={Clock}
          color="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          label="Total Gastos"
          value={fmt(dashboard.totalExpenses, currency)}
          icon={Banknote}
          color="text-red-600 dark:text-red-400"
        />
        <MetricCard
          label="Total Bonos"
          value={fmt(dashboard.totalBonuses, currency)}
          icon={Banknote}
          color="text-green-600 dark:text-green-400"
        />
        <MetricCard
          label="Días Transcurridos"
          value={`${dashboard.daysPassed} / ${dashboard.totalDays > 0 ? dashboard.totalDays : "-"}`}
          icon={Calendar}
          subtext={`${dashboard.daysLoaded} días cargados`}
        />
        <MetricCard
          label="Días Restantes"
          value={dashboard.daysRemaining > 0 ? String(dashboard.daysRemaining) : "Sin fecha"}
          icon={Calendar}
          color={dashboard.daysRemaining <= 30 && dashboard.daysRemaining > 0 ? "text-orange-600 dark:text-orange-400" : undefined}
        />
      </div>

      {/* Required per day highlighted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Necesitas por dia (meta minima)
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {dashboard.requiredPerDayForMin > 0
              ? fmt(dashboard.requiredPerDayForMin, currency)
              : "Meta alcanzada"}
          </p>
        </Card>

        <Card className="p-5 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Necesitas por dia (meta ideal)
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {dashboard.requiredPerDayForIdeal > 0
              ? fmt(dashboard.requiredPerDayForIdeal, currency)
              : "Meta alcanzada"}
          </p>
        </Card>
      </div>
    </div>
  );
}
