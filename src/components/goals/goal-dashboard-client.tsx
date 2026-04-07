"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { GoalDailyTable } from "./goal-daily-table";
import { GoalAssetsTable } from "./goal-assets-table";
import { GoalMovementsTable } from "./goal-movements-table";
import { GoalForm } from "./goal-form";
import { DIAGNOSIS_CONFIG } from "@/lib/savings/status";
import { getCurrencySymbol } from "@/lib/constants";
import { deleteGoal } from "@/actions/goals";
import { toast } from "sonner";
import type { GoalParameters, GoalDashboard, DailyRow, DailyEntry, GoalAsset, GoalMovement, ExchangeRateMap } from "@/lib/savings/types";
import {
  ArrowLeft, Pencil, Trash2, Loader2, Target, TrendingUp, Calendar,
  Wallet, Clock, ArrowUp, ArrowDown, PiggyBank, BarChart3,
} from "lucide-react";

interface GoalDashboardClientProps {
  goal: GoalParameters;
  dashboard: GoalDashboard;
  dailyTable: DailyRow[];
  dailyEntries: DailyEntry[];
  assets: GoalAsset[];
  movements: GoalMovement[];
  rates: ExchangeRateMap;
}

function fmt(amount: number, currency: string): string {
  return `${getCurrencySymbol(currency)}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function GoalDashboardClient({ goal, dashboard, dailyTable, dailyEntries, assets, movements, rates }: GoalDashboardClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const config = DIAGNOSIS_CONFIG[dashboard.status];
  const progressMin = Math.min(Math.max(dashboard.progressVsMin, 0), 100);
  const progressIdeal = Math.min(Math.max(dashboard.progressVsIdeal, 0), 100);

  function handleDelete() {
    startTransition(async () => {
      try { await deleteGoal(goal.id); toast.success("Objetivo eliminado"); router.push("/goals"); }
      catch { toast.error("Error al eliminar"); }
    });
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/goals")} className="mt-1 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{goal.name}</h1>
            <Badge variant="outline" className={`text-[11px] border-0 shrink-0 ${config.color} ${config.bgColor}`}>
              {config.emoji} {config.label}
            </Badge>
          </div>
          {goal.description && <p className="text-sm text-muted-foreground mt-0.5">{goal.description}</p>}
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {goal.category && <Badge variant="secondary" className="text-[10px]">{goal.category}</Badge>}
            <span>{goal.currency}</span>
            <span>·</span>
            <span>Prioridad {goal.priority === "HIGH" ? "Alta" : goal.priority === "MEDIUM" ? "Media" : "Baja"}</span>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="outline" size="icon-sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" className="text-red-500 hover:text-red-600" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ===== HERO: BALANCE + PROGRESS ===== */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ahorro Real Hoy</p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                {fmt(dashboard.realTotalToday, goal.currency)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-muted-foreground">Estimado al cierre</p>
              <p className="text-lg font-semibold text-muted-foreground">
                {fmt(dashboard.estimatedTotalAtDeadline, goal.currency)}
              </p>
            </div>
          </div>

          {/* Dual progress */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Meta mínima ({fmt(dashboard.targetMin, goal.currency)})</span>
                <span className="font-semibold">{progressMin.toFixed(0)}%</span>
              </div>
              <Progress value={progressMin} className="h-2.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Meta ideal ({fmt(dashboard.targetIdeal, goal.currency)})</span>
                <span className="font-semibold">{progressIdeal.toFixed(0)}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressIdeal}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== KEY METRICS GRID ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard icon={Calendar} label="Días restantes" value={dashboard.daysRemaining > 0 ? String(dashboard.daysRemaining) : "—"}
          sub={`${dashboard.daysPassed} transcurridos · ${dashboard.daysLoaded} cargados`} />
        <MetricCard icon={Wallet} label="Activos disp." value={fmt(dashboard.availableAssets, goal.currency)}
          color="text-cyan-600 dark:text-cyan-400" />
        <MetricCard icon={ArrowDown} label="Gastos" value={fmt(dashboard.totalExpenses, goal.currency)}
          color="text-red-600 dark:text-red-400" />
        <MetricCard icon={ArrowUp} label="Bonuses" value={fmt(dashboard.totalBonuses, goal.currency)}
          color="text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* ===== REQUIRED PER DAY ===== */}
      {dashboard.daysRemaining > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Para meta mínima</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                {dashboard.requiredPerDayForMin > 0 ? `${fmt(dashboard.requiredPerDayForMin, goal.currency)}/día` : "Alcanzada"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Para meta ideal</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {dashboard.requiredPerDayForIdeal > 0 ? `${fmt(dashboard.requiredPerDayForIdeal, goal.currency)}/día` : "Alcanzada"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== DIFF VS TARGETS ===== */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Diff vs meta mínima</p>
            <p className={`text-lg font-bold ${dashboard.diffVsTargetMin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {dashboard.diffVsTargetMin >= 0 ? "+" : ""}{fmt(dashboard.diffVsTargetMin, goal.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Diff vs meta ideal</p>
            <p className={`text-lg font-bold ${dashboard.diffVsTargetIdeal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {dashboard.diffVsTargetIdeal >= 0 ? "+" : ""}{fmt(dashboard.diffVsTargetIdeal, goal.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===== TABS: Daily / Assets / Movements ===== */}
      <Tabs defaultValue="daily">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="daily">Ahorro Diario</TabsTrigger>
          <TabsTrigger value="assets">Activos</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <GoalDailyTable goalId={goal.id} currency={goal.currency} dailyTable={dailyTable} dailyEntries={dailyEntries} rates={rates} />
        </TabsContent>
        <TabsContent value="assets" className="mt-4">
          <GoalAssetsTable goalId={goal.id} currency={goal.currency} assets={assets} rates={rates} />
        </TabsContent>
        <TabsContent value="movements" className="mt-4">
          <GoalMovementsTable goalId={goal.id} currency={goal.currency} movements={movements} rates={rates} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <GoalForm open={editOpen} onOpenChange={setEditOpen} goal={goal} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar objetivo</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará &quot;{goal.name}&quot; con todas sus entradas, activos y movimientos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-white">
              {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Eliminando...</> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, sub }: {
  icon: typeof Target; label: string; value: string; color?: string; sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className={`h-4 w-4 mb-2 ${color ?? "text-muted-foreground"}`} />
        <p className={`text-lg font-bold ${color ?? ""}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
