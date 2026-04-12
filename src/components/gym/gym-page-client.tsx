"use client";

import { useState } from "react";
import { Plus, Dumbbell, Flame, CalendarCheck, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createRoutine } from "@/actions/gym";
import { RoutineCard } from "./routine-card";
import { WorkoutHistory } from "./workout-history";
import { cn } from "@/lib/utils";
import type { getRoutines } from "@/actions/gym";

type Routines = Awaited<ReturnType<typeof getRoutines>>;

interface WorkoutStats {
  total: number;
  thisWeek: number;
  streak: number;
}

interface GymPageClientProps {
  routines: Routines;
  stats: WorkoutStats;
  logs: Array<{
    id: string; date: string; duration: number | null; rating: number | null;
    notes: string | null; routine: { name: string } | null; day: { name: string } | null;
    entries: Array<{ exerciseName: string; setNumber: number; reps: number | null; weight: number | null; completed: boolean }>;
  }>;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#d946ef", "#6b7280",
];

export function GymPageClient({ routines, stats, logs }: GymPageClientProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[4]);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createRoutine({ name: name.trim(), description: description.trim() || undefined, color });
      toast.success("Rutina creada");
      setOpen(false);
      setName(""); setDescription(""); setColor(PRESET_COLORS[4]);
    } catch (err) { console.error("GymPageClient.handleCreate:", err); toast.error("Error al crear la rutina"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gimnasio</h1>
        <p className="text-muted-foreground text-[15px] mt-1">Tus rutinas y entrenamientos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1.5 text-amber-500" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Entrenamientos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarCheck className="h-5 w-5 mx-auto mb-1.5 text-blue-500" />
            <p className="text-2xl font-bold">{stats.thisWeek}</p>
            <p className="text-[11px] text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1.5 text-orange-500" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-[11px] text-muted-foreground">Racha (días)</p>
          </CardContent>
        </Card>
      </div>

      {/* New routine button */}
      <Button onClick={() => setOpen(true)} className="gap-2 w-full sm:w-auto">
        <Plus className="h-4 w-4" /> Nueva Rutina
      </Button>

      {/* Tabs: Rutinas / Historial */}
      <Tabs defaultValue="routines">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="routines" className="flex-1 sm:flex-initial">Rutinas</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 sm:flex-initial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="mt-4">
          {routines.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Sin rutinas"
              description="Creá tu primera rutina de entrenamiento para empezar a registrar tus sesiones."
              actionLabel="Crear rutina"
              onAction={() => setOpen(true)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {routines.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <WorkoutHistory logs={logs} />
        </TabsContent>
      </Tabs>

      {/* Create Routine Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle>Nueva Rutina</DialogTitle>
          </DialogHeader>
          <div className="p-5 pt-4 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nombre</Label>
              <Input placeholder="Ej: Push Pull Legs, Upper/Lower..." value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Descripción</Label>
              <Textarea placeholder="Descripción breve de tu rutina..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      "size-11 rounded-full border-2 transition-all active:scale-90",
                      color === c ? "border-foreground scale-105" : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={loading || !name.trim()}>
                {loading ? "Creando..." : "Crear Rutina"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
