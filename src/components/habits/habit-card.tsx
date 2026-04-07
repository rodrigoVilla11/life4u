"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HabitHeatmap } from "./habit-heatmap";
import { Flame } from "lucide-react";

const HABIT_TYPE_LABELS: Record<string, string> = {
  CHECKBOX: "Si/No",
  COUNT: "Conteo",
  DURATION: "Duracion",
  AMOUNT: "Monto",
  AVOID: "Evitar",
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Diario",
  WEEKDAYS: "Lun-Vie",
  SPECIFIC_DAYS: "Dias especificos",
  X_PER_WEEK: "X por semana",
  X_PER_MONTH: "X por mes",
};

interface HabitCardProps {
  habit: {
    id: string;
    title: string;
    icon: string | null;
    color: string | null;
    type: string;
    frequencyType: string;
    frequencyCount: number | null;
    logs: { date: Date; completed: boolean; value: number | null }[];
  };
  onClick?: () => void;
}

function getStreak(logs: { date: Date; completed: boolean }[]): number {
  const sorted = [...logs]
    .filter((l) => l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getFrequencyLabel(type: string, count: number | null): string {
  if (type === "X_PER_WEEK" && count) return `${count}x por semana`;
  if (type === "X_PER_MONTH" && count) return `${count}x por mes`;
  return FREQUENCY_LABELS[type] || type;
}

export function HabitCard({ habit, onClick }: HabitCardProps) {
  const streak = getStreak(habit.logs);
  const color = habit.color || "#6b7280";

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      onClick={onClick}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">{habit.icon || "📌"}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] truncate">{habit.title}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="secondary" className="text-[11px]">
                {HABIT_TYPE_LABELS[habit.type] || habit.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getFrequencyLabel(habit.frequencyType, habit.frequencyCount)}
              </span>
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 shrink-0 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t">
          <HabitHeatmap logs={habit.logs} size="sm" days={7} />
        </div>
      </CardContent>
    </Card>
  );
}
