"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Play,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  updateRoutine,
  deleteRoutine,
  addDay,
  updateDay,
  deleteDay,
  startWorkout,
} from "@/actions/gym";
import { ExerciseRow } from "./exercise-row";
import { ExerciseForm } from "./exercise-form";
import { ExercisePicker } from "./exercise-picker";
import { MuscleCoverage } from "./muscle-coverage";
import type { ExerciseTemplate } from "@/lib/exercise-database";
import { WorkoutActive } from "./workout-active";
import { getPreviousWorkoutData } from "@/actions/gym";
import type { getRoutine } from "@/actions/gym";

type Routine = NonNullable<Awaited<ReturnType<typeof getRoutine>>>;
type WorkoutDay = Routine["days"][number];
type Exercise = WorkoutDay["exercises"][number];

const DAY_OF_WEEK_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

export function RoutineDetailClient({ routine }: { routine: Routine }) {
  const router = useRouter();

  // Routine edit state
  const [editRoutineOpen, setEditRoutineOpen] = useState(false);
  const [routineName, setRoutineName] = useState(routine.name);
  const [routineDesc, setRoutineDesc] = useState(routine.description || "");
  const [saving, setSaving] = useState(false);

  // Delete routine state
  const [deleteRoutineOpen, setDeleteRoutineOpen] = useState(false);
  const [deletingRoutine, setDeletingRoutine] = useState(false);

  // Day dialog state
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
  const [dayName, setDayName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("-1");
  const [dayNotes, setDayNotes] = useState("");
  const [savingDay, setSavingDay] = useState(false);

  // Delete day state
  const [deleteDayOpen, setDeleteDayOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<WorkoutDay | null>(null);
  const [deletingDay, setDeletingDay] = useState(false);

  // Exercise form state
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [exerciseFormDayId, setExerciseFormDayId] = useState("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDayId, setPickerDayId] = useState("");
  const [prefillExercise, setPrefillExercise] = useState<ExerciseTemplate | null>(null);

  // Active workout state
  const [activeWorkout, setActiveWorkout] = useState<{
    log: Awaited<ReturnType<typeof startWorkout>>;
    dayName: string;
    previousEntries: Array<{ exerciseName: string; setNumber: number; reps: number | null; weight: number | null }>;
  } | null>(null);

  // --- Routine actions ---
  async function handleUpdateRoutine() {
    if (!routineName.trim()) return;
    setSaving(true);
    try {
      await updateRoutine(routine.id, {
        name: routineName.trim(),
        description: routineDesc.trim() || undefined,
      });
      toast.success("Rutina actualizada");
      setEditRoutineOpen(false);
    } catch (err) {
      console.error("RoutineDetailClient.handleEditRoutine:", err);
      toast.error("Error al actualizar la rutina");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoutine() {
    setDeletingRoutine(true);
    try {
      await deleteRoutine(routine.id);
      toast.success("Rutina eliminada");
      router.push("/gym");
    } catch (err) {
      console.error("RoutineDetailClient.handleDeleteRoutine:", err);
      toast.error("Error al eliminar la rutina");
    } finally {
      setDeletingRoutine(false);
    }
  }

  // --- Day actions ---
  function openAddDay() {
    setEditingDay(null);
    setDayName("");
    setDayOfWeek("-1");
    setDayNotes("");
    setDayDialogOpen(true);
  }

  function openEditDay(day: WorkoutDay) {
    setEditingDay(day);
    setDayName(day.name);
    setDayOfWeek(day.dayOfWeek?.toString() ?? "-1");
    setDayNotes(day.notes || "");
    setDayDialogOpen(true);
  }

  async function handleSaveDay() {
    if (!dayName.trim()) return;
    setSavingDay(true);
    try {
      const data = {
        name: dayName.trim(),
        dayOfWeek: parseInt(dayOfWeek),
        notes: dayNotes.trim() || undefined,
      };
      if (editingDay) {
        await updateDay(editingDay.id, data);
        toast.success("Dia actualizado");
      } else {
        await addDay(routine.id, data);
        toast.success("Dia agregado");
      }
      setDayDialogOpen(false);
    } catch (err) {
      console.error("RoutineDetailClient.handleSaveDay:", err);
      toast.error("Error al guardar el dia");
    } finally {
      setSavingDay(false);
    }
  }

  async function handleDeleteDay() {
    if (!dayToDelete) return;
    setDeletingDay(true);
    try {
      await deleteDay(dayToDelete.id);
      toast.success("Dia eliminado");
      setDeleteDayOpen(false);
      setDayToDelete(null);
    } catch (err) {
      console.error("RoutineDetailClient.handleDeleteDay:", err);
      toast.error("Error al eliminar el dia");
    } finally {
      setDeletingDay(false);
    }
  }

  // --- Exercise actions ---
  function openAddExercise(dayId: string) {
    setPickerDayId(dayId);
    setPrefillExercise(null);
    setPickerOpen(true);
  }

  function handlePickExercise(template: ExerciseTemplate) {
    setPrefillExercise(template);
    setExerciseFormDayId(pickerDayId);
    setEditingExercise(null);
    setPickerOpen(false);
    setExerciseFormOpen(true);
  }

  function openCustomExercise() {
    setPrefillExercise(null);
    setExerciseFormDayId(pickerDayId);
    setEditingExercise(null);
    setPickerOpen(false);
    setExerciseFormOpen(true);
  }

  function openEditExercise(exercise: Exercise, dayId: string) {
    setExerciseFormDayId(dayId);
    setEditingExercise(exercise);
    setExerciseFormOpen(true);
  }

  // --- Workout actions ---
  async function handleStartWorkout(day: WorkoutDay) {
    try {
      const [log, previousEntries] = await Promise.all([
        startWorkout(routine.id, day.id),
        getPreviousWorkoutData(day.id),
      ]);
      setActiveWorkout({ log, dayName: day.name, previousEntries });
    } catch (err) {
      console.error("RoutineDetailClient.handleStartWorkout:", err);
      toast.error("Error al iniciar el entrenamiento");
    }
  }

  // Active workout view
  if (activeWorkout) {
    return (
      <WorkoutActive
        log={activeWorkout.log}
        dayName={activeWorkout.dayName}
        routineName={routine.name}
        previousEntries={activeWorkout.previousEntries}
        onFinish={() => {
          setActiveWorkout(null);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 mt-0.5"
          onClick={() => router.push("/gym")}
        >
          <ArrowLeft className="size-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {routine.color && (
              <div
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: routine.color }}
              />
            )}
            <h1 className="text-xl font-bold tracking-tight truncate">
              {routine.name}
            </h1>
          </div>
          {routine.description && (
            <p className="text-muted-foreground text-sm mt-0.5">
              {routine.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setRoutineName(routine.name);
              setRoutineDesc(routine.description || "");
              setEditRoutineOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteRoutineOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Overall muscle coverage */}
      {routine.days.some((d) => d.exercises.length > 0) && (
        <Card>
          <CardContent className="p-4">
            <MuscleCoverage exercises={routine.days.flatMap((d) => d.exercises)} />
          </CardContent>
        </Card>
      )}

      {/* Days */}
      <div className="space-y-4">
        {routine.days.map((day) => (
          <Card key={day.id} className="overflow-hidden">
            <div
              className="h-0.5"
              style={{ backgroundColor: routine.color || "#6b7280" }}
            />
            <CardContent className="pt-4 space-y-3">
              {/* Day header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-semibold text-[15px] md:text-sm truncate">
                    {day.name}
                  </h3>
                  {day.dayOfWeek != null && day.dayOfWeek >= 0 && (
                    <Badge variant="secondary" className="shrink-0 gap-1">
                      <Calendar className="size-3" />
                      {DAY_OF_WEEK_LABELS[day.dayOfWeek]}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEditDay(day)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setDayToDelete(day);
                      setDeleteDayOpen(true);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {day.notes && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {day.notes}
                </p>
              )}

              {/* Muscle coverage for this day */}
              {day.exercises.length > 0 && (
                <MuscleCoverage exercises={day.exercises} compact />
              )}

              {/* Exercises */}
              <div className="space-y-2">
                {day.exercises.map((exercise) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={() => openEditExercise(exercise, day.id)}
                  />
                ))}
              </div>

              {/* Day actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAddExercise(day.id)}
                >
                  <Plus className="size-3.5" />
                  Agregar ejercicio
                </Button>
                {day.exercises.length > 0 && (
                  <Button
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleStartWorkout(day)}
                  >
                    <Play className="size-3.5" />
                    Iniciar Entrenamiento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Day Button */}
      <Button variant="outline" className="w-full" onClick={openAddDay}>
        <Plus className="size-4" />
        Agregar Dia
      </Button>

      {/* Edit Routine Dialog */}
      <Dialog open={editRoutineOpen} onOpenChange={setEditRoutineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rutina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-rname">Nombre</Label>
              <Input
                id="edit-rname"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rdesc">Descripcion</Label>
              <Textarea
                id="edit-rdesc"
                value={routineDesc}
                onChange={(e) => setRoutineDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleUpdateRoutine}
              disabled={saving || !routineName.trim()}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Routine Confirm */}
      <AlertDialog open={deleteRoutineOpen} onOpenChange={setDeleteRoutineOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar rutina</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara la rutina &quot;{routine.name}&quot; con todos sus
              dias y ejercicios. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteRoutineOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoutine}
              disabled={deletingRoutine}
            >
              {deletingRoutine ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Day Dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDay ? "Editar dia" : "Agregar dia"}
            </DialogTitle>
            <DialogDescription>
              {editingDay
                ? "Modifica los detalles del dia de entrenamiento."
                : "Agrega un nuevo dia a tu rutina."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="day-name">Nombre</Label>
              <Input
                id="day-name"
                placeholder="Ej: Dia A - Pecho y Triceps"
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day-dow">Dia de la semana (opcional)</Label>
              <NativeSelect
                id="day-dow"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                <option value="-1">Sin asignar</option>
                {DAY_OF_WEEK_LABELS.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="day-notes">Notas (opcional)</Label>
              <Textarea
                id="day-notes"
                placeholder="Notas adicionales..."
                value={dayNotes}
                onChange={(e) => setDayNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleSaveDay}
              disabled={savingDay || !dayName.trim()}
            >
              {savingDay
                ? "Guardando..."
                : editingDay
                ? "Guardar"
                : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Day Confirm */}
      <AlertDialog open={deleteDayOpen} onOpenChange={setDeleteDayOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar dia</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara &quot;{dayToDelete?.name}&quot; con todos sus
              ejercicios. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDayOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDay}
              disabled={deletingDay}
            >
              {deletingDay ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exercise Picker */}
      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePickExercise}
        onCustom={openCustomExercise}
      />

      {/* Exercise Form */}
      <ExerciseForm
        key={editingExercise?.id || exerciseFormDayId}
        open={exerciseFormOpen}
        onOpenChange={setExerciseFormOpen}
        dayId={exerciseFormDayId}
        exercise={editingExercise}
        prefill={prefillExercise}
      />
    </div>
  );
}
