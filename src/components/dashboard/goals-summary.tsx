"use client";

import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrencySymbol } from "@/lib/constants";
import { DIAGNOSIS_CONFIG } from "@/lib/savings/status";
import type { GoalDashboard } from "@/types";

interface GoalsSummaryProps {
  goalsSummary: {
    activeGoals: number;
    closestGoal: GoalDashboard | null;
  };
}

export function GoalsSummary({ goalsSummary }: GoalsSummaryProps) {
  const { activeGoals, closestGoal } = goalsSummary;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Metas de Ahorro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Metas activas</span>
            <span className="text-lg font-bold">{activeGoals}</span>
          </div>

          {closestGoal ? (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{closestGoal.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Meta más cercana</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${DIAGNOSIS_CONFIG[closestGoal.status].bgColor} ${DIAGNOSIS_CONFIG[closestGoal.status].color}`}>
                  {DIAGNOSIS_CONFIG[closestGoal.status].emoji} {DIAGNOSIS_CONFIG[closestGoal.status].label}
                </span>
              </div>
              <Progress value={closestGoal.progressVsMin} />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {getCurrencySymbol(closestGoal.currency)}
                  {closestGoal.realTotalToday.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
                <span className="font-medium">{closestGoal.progressVsMin.toFixed(0)}%</span>
                <span className="text-muted-foreground">
                  {getCurrencySymbol(closestGoal.currency)}
                  {closestGoal.targetMin.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {closestGoal.daysRemaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {closestGoal.daysRemaining} días restantes · Necesitás {getCurrencySymbol(closestGoal.currency)}{closestGoal.requiredPerDayForMin.toFixed(0)}/día
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No hay metas activas</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
