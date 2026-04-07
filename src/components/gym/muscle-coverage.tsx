"use client";

import { MUSCLE_COLORS } from "@/lib/exercise-database";

interface MuscleCoverageProps {
  exercises: Array<{ muscleGroup: string | null }>;
  compact?: boolean;
}

export function MuscleCoverage({ exercises, compact = false }: MuscleCoverageProps) {
  // Count exercises per muscle group
  const counts = new Map<string, number>();
  for (const ex of exercises) {
    if (ex.muscleGroup) {
      counts.set(ex.muscleGroup, (counts.get(ex.muscleGroup) ?? 0) + 1);
    }
  }

  if (counts.size === 0) return null;

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] ?? 1;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {sorted.map(([muscle, count]) => (
          <div
            key={muscle}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: `${MUSCLE_COLORS[muscle] ?? "#6b7280"}15`,
              color: MUSCLE_COLORS[muscle] ?? "#6b7280",
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: MUSCLE_COLORS[muscle] ?? "#6b7280" }} />
            {muscle} ({count})
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">Músculos trabajados</p>
      <div className="space-y-1.5">
        {sorted.map(([muscle, count]) => {
          const pct = (count / maxCount) * 100;
          const color = MUSCLE_COLORS[muscle] ?? "#6b7280";
          return (
            <div key={muscle} className="flex items-center gap-2">
              <span className="text-xs font-medium w-24 truncate" style={{ color }}>{muscle}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums w-5 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
