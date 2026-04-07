"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Pause, Play, Star, Trophy, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { updateLogEntry, finishWorkout } from "@/actions/gym";
import type { startWorkout } from "@/actions/gym";

type WorkoutLog = Awaited<ReturnType<typeof startWorkout>>;
type LogEntry = WorkoutLog["entries"][number];

interface PreviousEntry {
  exerciseName: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
}

interface WorkoutActiveProps {
  log: WorkoutLog;
  dayName: string;
  routineName: string;
  onFinish: () => void;
  previousEntries?: PreviousEntry[];
}

function groupByExercise(entries: LogEntry[]) {
  const groups: { exerciseName: string; exerciseId: string | null; sets: LogEntry[] }[] = [];
  for (const entry of entries) {
    const existing = groups.find((g) => g.exerciseId === entry.exerciseId);
    if (existing) { existing.sets.push(entry); }
    else { groups.push({ exerciseName: entry.exerciseName, exerciseId: entry.exerciseId, sets: [entry] }); }
  }
  return groups;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function WorkoutActive({ log, dayName, routineName, onFinish, previousEntries = [] }: WorkoutActiveProps) {
  const [entries, setEntries] = useState<LogEntry[]>(log.entries);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");

  // Rest timer
  const [restTime, setRestTime] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [initialRestTime, setInitialRestTime] = useState(0);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed time
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest timer effect
  useEffect(() => {
    if (restRunning && restTime > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTime((t) => {
          if (t <= 1) { setRestRunning(false); toast.info("Descanso terminado"); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, [restRunning, restTime]);

  // Debounced server updates
  const pendingUpdates = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const debouncedUpdate = useCallback((entryId: string, data: { reps?: number; weight?: number }) => {
    const existing = pendingUpdates.current.get(entryId);
    if (existing) clearTimeout(existing);
    pendingUpdates.current.set(entryId, setTimeout(async () => {
      try { await updateLogEntry(entryId, data); }
      catch { /* silent - state is optimistic */ }
      pendingUpdates.current.delete(entryId);
    }, 500));
  }, []);

  // Flush pending before finish
  function flushPending() {
    pendingUpdates.current.forEach((timeout) => clearTimeout(timeout));
    pendingUpdates.current.clear();
  }

  const completedSets = entries.filter((e) => e.completed).length;
  const totalSets = entries.length;
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const exerciseGroups = groupByExercise(entries);

  function startRest(seconds: number) {
    setRestTime(seconds);
    setInitialRestTime(seconds);
    setRestRunning(true);
  }

  function getPrevious(exerciseName: string, setNumber: number) {
    return previousEntries.find((p) => p.exerciseName === exerciseName && p.setNumber === setNumber);
  }

  async function handleToggleSet(entry: LogEntry) {
    const newCompleted = !entry.completed;
    setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, completed: newCompleted } : e));
    try { await updateLogEntry(entry.id, { completed: newCompleted }); }
    catch { setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, completed: !newCompleted } : e)); }
  }

  function handleUpdateReps(entry: LogEntry, reps: string) {
    const repsNum = parseInt(reps);
    if (isNaN(repsNum)) return;
    setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, reps: repsNum } : e));
    debouncedUpdate(entry.id, { reps: repsNum });
  }

  function handleUpdateWeight(entry: LogEntry, weight: string) {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum)) return;
    setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, weight: weightNum } : e));
    debouncedUpdate(entry.id, { weight: weightNum });
  }

  async function handleFinish() {
    setFinishing(true);
    flushPending();
    try {
      const durationMin = parseInt(duration) || Math.round(elapsed / 60);
      await finishWorkout(log.id, { duration: durationMin, rating: rating > 0 ? rating : undefined, notes: notes.trim() || undefined });
      toast.success("Entrenamiento completado");
      onFinish();
    } catch { toast.error("Error al finalizar"); }
    finally { setFinishing(false); }
  }

  const restActive = restTime > 0;

  return (
    <div className={`space-y-5 ${restActive ? "pb-28" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{dayName}</h1>
          <p className="text-xs text-muted-foreground">{routineName}</p>
        </div>
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm tabular-nums">
          <Timer className="size-3.5" />
          {formatTime(elapsed)}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-semibold tabular-nums">{completedSets}/{totalSets} series · {progressPct.toFixed(0)}%</span>
        </div>
        <Progress value={progressPct} className="h-2.5" />
      </div>

      {/* Exercise Groups */}
      <div className="space-y-4">
        {exerciseGroups.map((group) => (
          <Card key={group.exerciseId ?? group.exerciseName} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-[15px]">{group.exerciseName}</h3>

              {/* Header row */}
              <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 px-1 text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                <span>Set</span>
                <span>Reps</span>
                <span>Peso (kg)</span>
                <span className="text-center">OK</span>
              </div>

              {/* Set rows */}
              {group.sets.map((entry) => {
                const prev = getPrevious(entry.exerciseName, entry.setNumber);
                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 items-center px-1 py-1 rounded-xl transition-all duration-200 ${
                      entry.completed
                        ? "bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200 dark:ring-emerald-800"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <span className={`text-sm font-bold tabular-nums text-center ${
                      entry.completed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}>
                      {entry.setNumber}
                    </span>

                    <div>
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="h-12 md:h-10 text-center text-base md:text-sm font-semibold tabular-nums"
                        value={entry.reps?.toString() || ""}
                        onChange={(e) => handleUpdateReps(entry, e.target.value)}
                        placeholder="-"
                      />
                      {prev && prev.reps && (
                        <p className="text-[10px] text-muted-foreground/50 text-center mt-0.5 tabular-nums">
                          ant: {prev.reps}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        className="h-12 md:h-10 text-center text-base md:text-sm font-semibold tabular-nums"
                        value={entry.weight?.toString() || ""}
                        onChange={(e) => handleUpdateWeight(entry, e.target.value)}
                        placeholder="kg"
                      />
                      {prev && prev.weight && (
                        <p className="text-[10px] text-muted-foreground/50 text-center mt-0.5 tabular-nums">
                          ant: {prev.weight}kg
                        </p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          handleToggleSet(entry);
                          if (!entry.completed) startRest(90);
                        }}
                        className={`size-10 md:size-8 rounded-xl border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
                          entry.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground/30 hover:border-emerald-400"
                        }`}
                      >
                        {entry.completed && (
                          <svg className="size-5 md:size-4" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finish Button */}
      <Button size="lg" className="w-full h-14 text-base font-semibold gap-2" onClick={() => setFinishOpen(true)}>
        <Trophy className="size-5" />
        Finalizar Entrenamiento
      </Button>

      {/* ===== REST TIMER (sticky bottom bar) ===== */}
      {restActive && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground safe-area-bottom">
          <div className="relative">
            {/* Progress bar */}
            <div className="h-1 bg-primary-foreground/20">
              <div
                className="h-full bg-primary-foreground/60 transition-all duration-1000"
                style={{ width: `${initialRestTime > 0 ? (restTime / initialRestTime) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-bold tabular-nums">{formatTime(restTime)}</span>
                <span className="text-primary-foreground/60 text-sm">descanso</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRestRunning((r) => !r)}
                  className="gap-1"
                >
                  {restRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {restRunning ? "Pausar" : "Seguir"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setRestTime(0); setRestRunning(false); }}
                  className="gap-1"
                >
                  <SkipForward className="size-4" />
                  Saltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Dialog */}
      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar entrenamiento</DialogTitle>
            <DialogDescription>
              {completedSets}/{totalSets} series completadas en {formatTime(elapsed)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Duración (min)</Label>
              <Input type="number" inputMode="numeric" placeholder={Math.round(elapsed / 60).toString()} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Valoración</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" className="p-1.5 transition-transform active:scale-90" onClick={() => setRating(star === rating ? 0 : star)}>
                    <Star className={`size-8 transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notas</Label>
              <Textarea placeholder="Cómo te sentiste, qué tal fue la sesión..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishOpen(false)}>Cancelar</Button>
            <Button onClick={handleFinish} disabled={finishing}>
              {finishing ? "Guardando..." : "Completar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
