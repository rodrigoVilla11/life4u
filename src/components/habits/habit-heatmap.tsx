"use client";

import { cn } from "@/lib/utils";

interface HeatmapLog {
  date: Date;
  completed: boolean;
}

interface HabitHeatmapProps {
  logs: HeatmapLog[];
  size?: "sm" | "md";
  days?: number;
}

export function HabitHeatmap({ logs, size = "sm", days = 7 }: HabitHeatmapProps) {
  const dotSize = size === "sm" ? "size-2.5" : "size-3.5";
  const gap = size === "sm" ? "gap-1" : "gap-1.5";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayDots = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    date.setHours(0, 0, 0, 0);

    const log = logs.find((l) => {
      const logDate = new Date(l.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === date.getTime();
    });

    return {
      date,
      completed: log?.completed ?? false,
      hasLog: !!log,
    };
  });

  return (
    <div className={cn("flex items-center", gap)}>
      {dayDots.map((dot, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full shrink-0 transition-colors",
            dotSize,
            dot.completed
              ? "bg-emerald-500"
              : dot.hasLog
                ? "bg-gray-300 dark:bg-gray-600"
                : "border border-gray-200 dark:border-gray-700 bg-transparent"
          )}
          title={`${dot.date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })}${dot.completed ? " - Completado" : ""}`}
        />
      ))}
    </div>
  );
}
