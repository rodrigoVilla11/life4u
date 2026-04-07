"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { HabitTodayRow } from "./habit-today-row";
import { HabitCard } from "./habit-card";
import { RoutineCard } from "./routine-card";
import { RoutineRunner } from "./routine-runner";
import { HabitForm } from "./habit-form";
import { HabitWizard } from "./habit-wizard";
import { startRoutineSession } from "@/actions/habits";
import { toast } from "sonner";
import { Plus, Flame, Trophy, CalendarCheck, Sparkles, Repeat, Target } from "lucide-react";
import type { getHabits, getDailyRoutines, startRoutineSession as StartSession } from "@/actions/habits";

type Habits = Awaited<ReturnType<typeof getHabits>>;
type Routines = Awaited<ReturnType<typeof getDailyRoutines>>;

interface HabitsPageClientProps {
  habits: Habits;
  stats: { totalHabits: number; todayCompleted: number; todayTotal: number; weekCompleted: number; bestStreak: number; todayProgress: number };
  routines: Routines;
}

export function HabitsPageClient({ habits, stats, routines }: HabitsPageClientProps) {
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    session: Awaited<ReturnType<typeof StartSession>>;
    routineName: string;
    routineIcon?: string;
  } | null>(null);

  async function handleStartRoutine(routineId: string) {
    try {
      const routine = routines.find((r) => r.id === routineId);
      const session = await startRoutineSession(routineId);
      setActiveSession({ session, routineName: routine?.name ?? "Rutina", routineIcon: routine?.icon ?? undefined });
    } catch {
      toast.error("Error al iniciar rutina");
    }
  }

  // Active routine view
  if (activeSession) {
    return (
      <RoutineRunner
        session={activeSession.session}
        routineName={activeSession.routineName}
        routineIcon={activeSession.routineIcon ?? undefined}
        onFinish={() => setActiveSession(null)}
      />
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hábitos y Rutinas</h1>
        <p className="text-muted-foreground text-[15px] mt-1">Construí rutinas positivas día a día</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{stats.todayCompleted}<span className="text-base text-muted-foreground font-normal">/{stats.todayTotal}</span></p>
            <Progress value={stats.todayProgress} className="h-1.5 mt-1.5" />
            <p className="text-[11px] text-muted-foreground mt-1">Hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1.5 text-orange-500" />
            <p className="text-2xl font-bold">{stats.bestStreak}</p>
            <p className="text-[11px] text-muted-foreground">Mejor racha</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1.5 text-amber-500" />
            <p className="text-2xl font-bold">{stats.weekCompleted}</p>
            <p className="text-[11px] text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setHabitFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Hábito
        </Button>
        <Button variant="outline" onClick={() => setWizardOpen(true)} className="gap-2">
          <Sparkles className="h-4 w-4" /> Asistente
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="today" className="flex-1 sm:flex-initial">Hoy</TabsTrigger>
          <TabsTrigger value="habits" className="flex-1 sm:flex-initial">Hábitos</TabsTrigger>
          <TabsTrigger value="routines" className="flex-1 sm:flex-initial">Rutinas</TabsTrigger>
        </TabsList>

        {/* TODAY TAB */}
        <TabsContent value="today" className="mt-4 space-y-4">
          {/* Today's routines */}
          {routines.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5" /> Rutinas de hoy
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {routines.map((r) => (
                  <RoutineCard key={r.id} routine={r} onStart={handleStartRoutine} />
                ))}
              </div>
            </div>
          )}

          {/* Today's habits */}
          {habits.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Hábitos de hoy
              </p>
              <Card>
                <CardContent className="p-0 divide-y divide-border/50">
                  {habits.map((habit) => (
                    <HabitTodayRow key={habit.id} habit={habit} />
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={Repeat}
              title="Sin hábitos todavía"
              description="Creá tu primer hábito o usá el asistente para empezar con sugerencias personalizadas."
              actionLabel="Crear hábito"
              onAction={() => setHabitFormOpen(true)}
            />
          )}
        </TabsContent>

        {/* HABITS TAB */}
        <TabsContent value="habits" className="mt-4">
          {habits.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Repeat}
              title="Sin hábitos"
              description="Empezá creando tu primer hábito diario."
              actionLabel="Crear hábito"
              onAction={() => setHabitFormOpen(true)}
            />
          )}
        </TabsContent>

        {/* ROUTINES TAB */}
        <TabsContent value="routines" className="mt-4 space-y-4">
          {routines.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {routines.map((r) => (
                <RoutineCard key={r.id} routine={r} onStart={handleStartRoutine} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Repeat}
              title="Sin rutinas"
              description="Creá una rutina para organizar tus hábitos en bloques del día."
              actionLabel="Crear rutina"
              onAction={() => {}}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <HabitForm open={habitFormOpen} onOpenChange={setHabitFormOpen} />
      <HabitWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
