"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SavingsGoalCard } from "./savings-goal-card";
import { GoalForm } from "./goal-form";
import type { GlobalSavingsOverview } from "@/lib/savings/types";
import { Plus, Target, PiggyBank, CheckCircle2, AlertTriangle } from "lucide-react";

interface GoalsPageClientProps {
  overview: GlobalSavingsOverview;
}

export function GoalsPageClient({ overview }: GoalsPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Metas de Ahorro</h1>
        <p className="text-muted-foreground text-[15px] mt-1">Tus objetivos financieros y progreso</p>
      </div>

      {/* Summary */}
      {overview.totalGoals > 0 && (
        <>
          {/* Main hero card */}
          <Card className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 border-violet-200/50 dark:border-violet-800/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Ahorrado</p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    ${overview.totalSavedAllGoals.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progreso global vs meta mínima</span>
                  <span className="font-medium">{overview.overallProgressMin.toFixed(0)}%</span>
                </div>
                <Progress value={overview.overallProgressMin} className="h-2.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${overview.totalSavedAllGoals.toLocaleString()} ahorrados</span>
                  <span>${overview.totalTargetMinAllGoals.toLocaleString()} objetivo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm">
              <Target className="h-3.5 w-3.5" /> {overview.activeGoals} activas
            </Badge>
            <Badge variant="success" className="gap-1.5 py-1.5 px-3 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> {overview.completedGoals} completadas
            </Badge>
            {overview.goalsAtRisk > 0 && (
              <Badge variant="warning" className="gap-1.5 py-1.5 px-3 text-sm">
                <AlertTriangle className="h-3.5 w-3.5" /> {overview.goalsAtRisk} en riesgo
              </Badge>
            )}
          </div>
        </>
      )}

      {/* New goal button */}
      <Button onClick={() => setFormOpen(true)} className="gap-2 w-full sm:w-auto">
        <Plus className="h-4 w-4" /> Nuevo Objetivo
      </Button>

      {/* Goals grid */}
      {overview.goals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.goals.map((goal) => (
            <SavingsGoalCard key={goal.goalId} goal={goal} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No tenés objetivos de ahorro"
          description="Creá tu primer objetivo para empezar a trackear tus metas financieras con el sistema de ahorro diario."
          actionLabel="Crear mi primer objetivo"
          onAction={() => setFormOpen(true)}
        />
      )}

      <GoalForm open={formOpen} onOpenChange={setFormOpen} goal={null} />
    </div>
  );
}
