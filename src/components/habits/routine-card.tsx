"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, ListChecks, Sun, Moon, Sunset } from "lucide-react";

const TIME_ICONS: Record<string, typeof Sun> = { morning: Sun, afternoon: Sunset, evening: Moon };
const TIME_LABELS: Record<string, string> = { morning: "Mañana", afternoon: "Tarde", evening: "Noche", anytime: "Cualquier momento" };

interface RoutineCardProps {
  routine: {
    id: string; name: string; description?: string | null; icon?: string | null;
    color?: string | null; timeOfDay?: string | null; estimatedMinutes?: number | null;
    items: Array<{ id: string; title: string }>;
    _count: { sessions: number };
  };
  onStart: (routineId: string) => void;
}

export function RoutineCard({ routine, onStart }: RoutineCardProps) {
  const TimeIcon = TIME_ICONS[routine.timeOfDay ?? ""] ?? Clock;

  return (
    <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="h-1" style={{ backgroundColor: routine.color ?? "#6366f1" }} />
      <CardContent className="p-5 pt-4 space-y-3">
        <div className="flex items-center gap-2.5">
          {routine.icon && <span className="text-xl">{routine.icon}</span>}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] truncate">{routine.name}</h3>
            {routine.description && <p className="text-xs text-muted-foreground truncate">{routine.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="gap-1 text-xs">
            <TimeIcon className="h-3 w-3" /> {TIME_LABELS[routine.timeOfDay ?? ""] ?? "Flexible"}
          </Badge>
          {routine.estimatedMinutes && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Clock className="h-3 w-3" /> {routine.estimatedMinutes} min
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1 text-xs">
            <ListChecks className="h-3 w-3" /> {routine.items.length} pasos
          </Badge>
        </div>

        <Button
          className="w-full gap-2"
          onClick={(e) => { e.stopPropagation(); onStart(routine.id); }}
          style={{ backgroundColor: routine.color ?? undefined }}
        >
          <Play className="h-4 w-4" /> Iniciar Rutina
        </Button>
      </CardContent>
    </Card>
  );
}
