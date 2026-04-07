"use client";

import { useState } from "react";
import { Trash2, GripVertical, Timer, Weight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { deleteExercise } from "@/actions/gym";

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Pecho: "#ef4444",
  Espalda: "#3b82f6",
  Hombros: "#f59e0b",
  "Biceps": "#8b5cf6",
  "Triceps": "#ec4899",
  Piernas: "#10b981",
  "Gluteos": "#f97316",
  Abdominales: "#06b6d4",
  Cardio: "#22c55e",
  "Full Body": "#6366f1",
  Otro: "#6b7280",
};

function getMuscleColor(group: string | null) {
  if (!group) return "#6b7280";
  return MUSCLE_GROUP_COLORS[group] || "#6b7280";
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string | null;
  sets: number;
  reps: string;
  weight: string | null;
  restSeconds: number;
  notes: string | null;
}

interface ExerciseRowProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
}

export function ExerciseRow({ exercise, onEdit }: ExerciseRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const borderColor = getMuscleColor(exercise.muscleGroup);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteExercise(exercise.id);
      toast.success("Ejercicio eliminado");
      setConfirmDelete(false);
    } catch {
      toast.error("Error al eliminar el ejercicio");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer border-l-[3px]"
        style={{ borderLeftColor: borderColor }}
        onClick={() => onEdit(exercise)}
      >
        <GripVertical className="size-4 text-muted-foreground/40 shrink-0 hidden sm:block" />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[15px] md:text-sm truncate">
              {exercise.name}
            </span>
            {exercise.muscleGroup && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 shrink-0"
                style={{
                  backgroundColor: `${borderColor}15`,
                  color: borderColor,
                  borderColor: `${borderColor}30`,
                }}
              >
                {exercise.muscleGroup}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">
              {exercise.sets} x {exercise.reps}
            </span>
            {exercise.weight && (
              <span className="flex items-center gap-0.5">
                <Weight className="size-3" />
                {exercise.weight}
              </span>
            )}
            {exercise.restSeconds > 0 && (
              <span className="flex items-center gap-0.5">
                <Timer className="size-3" />
                {exercise.restSeconds}s
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground/40 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ejercicio</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara &quot;{exercise.name}&quot;. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
