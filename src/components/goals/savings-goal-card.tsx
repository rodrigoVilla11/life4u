"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCurrencySymbol } from "@/lib/constants";
import { DIAGNOSIS_CONFIG } from "@/lib/savings/status";
import type { GoalDashboard } from "@/lib/savings/types";
import { Calendar, TrendingUp, Target } from "lucide-react";

interface SavingsGoalCardProps {
  goal: GoalDashboard;
}

export function SavingsGoalCard({ goal }: SavingsGoalCardProps) {
  const router = useRouter();
  const config = DIAGNOSIS_CONFIG[goal.status];
  const progress = Math.min(Math.max(goal.progressVsMin, 0), 100);
  const symbol = getCurrencySymbol(goal.currency);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
      onClick={() => router.push(`/goals/${goal.goalId}`)}
    >
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: config.bgColor.includes("green") ? "#10b981" : config.bgColor.includes("blue") ? "#3b82f6" : config.bgColor.includes("orange") ? "#f59e0b" : config.bgColor.includes("red") ? "#ef4444" : "#8b5cf6" }} />

      <CardContent className="p-5 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[15px] truncate">{goal.name}</h3>
              <p className="text-[11px] text-muted-foreground">{goal.currency}</p>
            </div>
          </div>
          <Badge variant="outline" className={`shrink-0 text-[11px] border-0 ${config.color} ${config.bgColor}`}>
            {config.emoji} {config.label}
          </Badge>
        </div>

        {/* Amount hero */}
        <div>
          <p className="text-2xl font-bold tracking-tight">
            {symbol}{goal.realTotalToday.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            de {symbol}{goal.targetMin.toLocaleString()} meta mínima
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {goal.daysRemaining > 0 ? `${goal.daysRemaining}d restantes` : goal.status === "COMPLETED" ? "Completado" : "Sin fecha"}
          </span>
          {goal.requiredPerDayForMin > 0 && goal.daysRemaining > 0 && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <TrendingUp className="h-3 w-3" />
              {symbol}{goal.requiredPerDayForMin.toFixed(0)}/día
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
