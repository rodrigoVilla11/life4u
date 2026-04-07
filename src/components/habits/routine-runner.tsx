"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toggleSessionItem, finishRoutineSession } from "@/actions/habits";
import { toast } from "sonner";
import { CheckCircle2, Circle, Timer, Trophy, ArrowLeft } from "lucide-react";
import type { startRoutineSession } from "@/actions/habits";

type Session = Awaited<ReturnType<typeof startRoutineSession>>;

interface RoutineRunnerProps {
  session: Session;
  routineName: string;
  routineIcon?: string;
  onFinish: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RoutineRunner({ session, routineName, routineIcon, onFinish }: RoutineRunnerProps) {
  const [items, setItems] = useState(session.items);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = completedCount === totalCount;
  const current = items[currentStep];

  async function handleToggle(itemId: string, index: number) {
    // Optimistic
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date() : null } : i));
    try {
      await toggleSessionItem(itemId);
      // Auto advance to next uncompleted
      if (!items[index].completed) {
        const nextIndex = items.findIndex((i, idx) => idx > index && !i.completed);
        if (nextIndex !== -1) setCurrentStep(nextIndex);
      }
    } catch {
      // Revert
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, completed: !i.completed } : i));
    }
  }

  async function handleFinish() {
    try {
      await finishRoutineSession(session.id);
      toast.success("Rutina completada");
      onFinish();
    } catch {
      toast.error("Error al finalizar");
    }
  }

  // Finished view
  if (allDone) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">¡Rutina completada!</h2>
          <p className="text-muted-foreground">{routineName} · {formatTime(elapsed)}</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {items.map((item) => (
            <Badge key={item.id} variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> {item.title}
            </Badge>
          ))}
        </div>
        <Button size="lg" onClick={handleFinish} className="w-full max-w-xs h-12 text-base font-semibold">
          Guardar y cerrar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={onFinish}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
              {routineIcon && <span>{routineIcon}</span>}
              {routineName}
            </h2>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5 tabular-nums">
          <Timer className="h-3.5 w-3.5" /> {formatTime(elapsed)}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Paso {currentStep + 1} de {totalCount}</span>
          <span className="font-semibold">{completedCount}/{totalCount}</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      {/* Current step hero */}
      {current && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Paso actual</p>
            <h3 className="text-xl font-bold">{current.title}</h3>
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold gap-2"
              onClick={() => handleToggle(current.id, currentStep)}
            >
              <CheckCircle2 className="h-5 w-5" />
              {current.completed ? "Desmarcar" : "Completar"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All steps list */}
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => { setCurrentStep(index); if (!item.completed) handleToggle(item.id, index); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              index === currentStep ? "bg-accent/50 ring-1 ring-primary/20" :
              item.completed ? "opacity-60" : "hover:bg-accent/30"
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className={`h-5 w-5 shrink-0 ${index === currentStep ? "text-primary" : "text-muted-foreground/30"}`} />
            )}
            <span className={`text-[15px] ${item.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
              {item.title}
            </span>
          </button>
        ))}
      </div>

      {/* Finish button */}
      <Button variant="outline" className="w-full" onClick={handleFinish}>
        Terminar rutina
      </Button>
    </div>
  );
}
