"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addExercise, updateExercise } from "@/actions/gym";
import { MUSCLE_COLORS, type ExerciseTemplate } from "@/lib/exercise-database";
import { Loader2 } from "lucide-react";

const MUSCLE_GROUP_OPTIONS = [
  "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps",
  "Piernas", "Glúteos", "Abdominales", "Cardio", "Full Body", "Otro",
];

interface Exercise {
  id: string; name: string; muscleGroup: string | null;
  sets: number; reps: string; weight: string | null;
  restSeconds: number; notes: string | null;
}

interface ExerciseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayId: string;
  exercise?: Exercise | null;
  prefill?: ExerciseTemplate | null;
}

export function ExerciseForm({ open, onOpenChange, dayId, exercise, prefill }: ExerciseFormProps) {
  const isEditing = !!exercise;

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [restSeconds, setRestSeconds] = useState("90");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Apply prefill or exercise data when dialog opens
  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setMuscleGroup(exercise.muscleGroup ?? "");
      setSets(String(exercise.sets));
      setReps(exercise.reps);
      setWeight(exercise.weight ?? "");
      setRestSeconds(String(exercise.restSeconds));
      setNotes(exercise.notes ?? "");
    } else if (prefill) {
      setName(prefill.name);
      setMuscleGroup(prefill.muscleGroup);
      setSets("3");
      setReps("10");
      setWeight("");
      setRestSeconds("90");
      setNotes("");
    } else {
      setName(""); setMuscleGroup(""); setSets("3"); setReps("10");
      setWeight(""); setRestSeconds("90"); setNotes("");
    }
  }, [exercise, prefill, open]);

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        muscleGroup: muscleGroup || undefined,
        sets: parseInt(sets) || 3,
        reps: reps.trim() || "10",
        weight: weight.trim() || undefined,
        restSeconds: parseInt(restSeconds) || 90,
        notes: notes.trim() || undefined,
      };

      if (isEditing && exercise) {
        await updateExercise(exercise.id, data);
        toast.success("Ejercicio actualizado");
      } else {
        await addExercise(dayId, data);
        toast.success("Ejercicio agregado");
      }
      onOpenChange(false);
    } catch {
      toast.error("Error al guardar ejercicio");
    } finally {
      setLoading(false);
    }
  }

  const mgColor = MUSCLE_COLORS[muscleGroup] ?? "#6b7280";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>{isEditing ? "Editar ejercicio" : "Agregar ejercicio"}</DialogTitle>
        </DialogHeader>

        <div className="p-5 pt-4 space-y-5">
          {/* Prefill preview */}
          {prefill && !isEditing && (
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-accent/20">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0">
                <img src={prefill.image} alt="" className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{prefill.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="text-[10px]" style={{ backgroundColor: `${mgColor}20`, color: mgColor }}>{prefill.muscleGroup}</Badge>
                  {prefill.secondaryMuscles.slice(0, 2).map((m) => (
                    <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nombre</Label>
            <Input placeholder="Ej: Press de Banca" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!prefill} />
          </div>

          {/* Muscle group */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Grupo muscular</Label>
            <NativeSelect value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}>
              <option value="">Sin especificar</option>
              {MUSCLE_GROUP_OPTIONS.map((mg) => <option key={mg} value={mg}>{mg}</option>)}
            </NativeSelect>
          </div>

          {/* Sets + Reps */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Series</Label>
              <Input type="number" inputMode="numeric" min={1} value={sets} onChange={(e) => setSets(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Repeticiones</Label>
              <Input placeholder="10, 8-12, al fallo" value={reps} onChange={(e) => setReps(e.target.value)} />
            </div>
          </div>

          {/* Weight + Rest */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Peso</Label>
              <Input placeholder="80kg, bodyweight" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Descanso (seg)</Label>
              <Input type="number" inputMode="numeric" min={0} value={restSeconds} onChange={(e) => setRestSeconds(e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notas</Label>
            <Textarea placeholder="Notas adicionales..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Guardar" : "Agregar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
