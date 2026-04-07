"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HabitHeatmap } from "./habit-heatmap";
import { quickToggleHabit, logHabit } from "@/actions/habits";
import { toast } from "sonner";
import { Check, Minus, Plus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitTodayRowProps {
  habit: {
    id: string;
    title: string;
    icon: string | null;
    color: string | null;
    type: string;
    targetValue: number | null;
    unit: string | null;
    logs: { date: Date; completed: boolean; value: number | null }[];
  };
}

function getTodayLog(logs: { date: Date; completed: boolean; value: number | null }[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return logs.find((l) => {
    const d = new Date(l.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function HabitTodayRow({ habit }: HabitTodayRowProps) {
  const todayLog = getTodayLog(habit.logs);
  const [completed, setCompleted] = useState(todayLog?.completed ?? false);
  const [value, setValue] = useState(todayLog?.value ?? 0);
  const [isPending, startTransition] = useTransition();
  const color = habit.color || "#6b7280";
  const target = habit.targetValue || 1;

  const handleToggle = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    startTransition(async () => {
      try {
        await quickToggleHabit(habit.id, todayStr());
      } catch {
        setCompleted(!newCompleted);
        toast.error("Error al actualizar el habito");
      }
    });
  };

  const handleValueChange = (newValue: number) => {
    const clamped = Math.max(0, newValue);
    setValue(clamped);
    const isComplete = clamped >= target;
    setCompleted(isComplete);
    startTransition(async () => {
      try {
        await logHabit(habit.id, {
          date: todayStr(),
          completed: isComplete,
          value: clamped,
        });
      } catch {
        toast.error("Error al actualizar el habito");
      }
    });
  };

  const handleQuickAdd = (minutes: number) => {
    handleValueChange(value + minutes);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-2xl bg-card border transition-all",
        isPending && "opacity-70"
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <span className="text-xl shrink-0">{habit.icon || "📌"}</span>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-[15px] truncate">{habit.title}</p>
        <div className="mt-1">
          <HabitHeatmap logs={habit.logs} size="sm" days={7} />
        </div>
      </div>

      <div className="shrink-0">
        {habit.type === "CHECKBOX" && (
          <button
            onClick={handleToggle}
            className={cn(
              "size-9 rounded-full border-2 flex items-center justify-center transition-all",
              completed
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-gray-300 dark:border-gray-600 hover:border-emerald-400"
            )}
          >
            {completed && <Check className="h-5 w-5" />}
          </button>
        )}

        {habit.type === "COUNT" && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => handleValueChange(value - 1)}
              disabled={value <= 0}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-semibold min-w-[3.5rem] text-center tabular-nums">
              {value}/{target}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => handleValueChange(value + 1)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {habit.type === "DURATION" && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-semibold tabular-nums">
              {value}/{target} min
            </span>
            <div className="flex gap-1">
              {[5, 10, 15].map((m) => (
                <Button
                  key={m}
                  variant="outline"
                  size="xs"
                  onClick={() => handleQuickAdd(m)}
                  className="text-[10px] px-1.5"
                >
                  +{m}
                </Button>
              ))}
            </div>
          </div>
        )}

        {habit.type === "AMOUNT" && (
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              value={value || ""}
              onChange={(e) => handleValueChange(Number(e.target.value))}
              className="w-16 h-8 text-center text-sm px-1"
              placeholder="0"
            />
            <span className="text-xs text-muted-foreground">
              /{target} {habit.unit || ""}
            </span>
          </div>
        )}

        {habit.type === "AVOID" && (
          <Badge
            variant={!completed ? "success" : "destructive"}
            className="cursor-pointer select-none"
            onClick={handleToggle}
          >
            {!completed ? (
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Sin completar
              </span>
            ) : (
              "Fallaste"
            )}
          </Badge>
        )}
      </div>
    </div>
  );
}
