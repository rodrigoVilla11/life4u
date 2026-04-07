"use client";

import { useRouter } from "next/navigation";
import { Dumbbell, Calendar, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { getRoutines } from "@/actions/gym";

type Routine = Awaited<ReturnType<typeof getRoutines>>[number];

export function RoutineCard({ routine }: { routine: Routine }) {
  const router = useRouter();
  const totalExercises = routine.days.reduce(
    (sum, d) => sum + d._count.exercises,
    0
  );
  const totalDays = routine.days.length;
  const color = routine.color || "#6b7280";

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => router.push(`/gym/${routine.id}`)}
    >
      {/* Color strip */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Name & description */}
          <div>
            <h3 className="font-semibold text-[15px] md:text-sm leading-snug group-hover:text-primary transition-colors">
              {routine.name}
            </h3>
            {routine.description && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2 leading-relaxed">
                {routine.description}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="gap-1">
              <Calendar className="size-3" />
              {totalDays} {totalDays === 1 ? "dia" : "dias"}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Dumbbell className="size-3" />
              {totalExercises} {totalExercises === 1 ? "ejercicio" : "ejercicios"}
            </Badge>
          </div>

          {/* Workouts logged */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t">
            <Activity className="size-3.5" />
            <span>
              {routine._count.logs}{" "}
              {routine._count.logs === 1
                ? "entrenamiento registrado"
                : "entrenamientos registrados"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
