"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Star, Dumbbell } from "lucide-react";

interface LogEntry {
  exerciseName: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

interface WorkoutLog {
  id: string;
  date: string;
  duration: number | null;
  rating: number | null;
  notes: string | null;
  routine: { name: string } | null;
  day: { name: string } | null;
  entries: LogEntry[];
}

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
}

export function WorkoutHistory({ logs }: WorkoutHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Dumbbell className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-semibold mb-1">Sin entrenamientos todavía</p>
        <p className="text-sm text-muted-foreground">Iniciá un entrenamiento desde una rutina</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const completedSets = log.entries.filter((e) => e.completed).length;
        const totalSets = log.entries.length;
        const exercises = [...new Set(log.entries.map((e) => e.exerciseName))];

        return (
          <Card key={log.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] truncate">{log.day?.name ?? "Entrenamiento"}</p>
                  {log.routine && (
                    <p className="text-xs text-muted-foreground">{log.routine.name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium flex items-center gap-1 justify-end">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(log.date), "d MMM", { locale: es })}
                  </p>
                  {log.duration && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" /> {log.duration} min
                    </p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {completedSets}/{totalSets} series
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {exercises.length} ejercicios
                </Badge>
                {log.rating && log.rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < log.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Exercise summary */}
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                {exercises.join(" · ")}
              </p>

              {log.notes && (
                <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">&quot;{log.notes}&quot;</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
