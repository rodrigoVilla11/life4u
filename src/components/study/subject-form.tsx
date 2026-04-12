"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createSubject, updateSubject } from "@/actions/study";

const SUBJECT_ICONS = ["📚", "📐", "🧮", "💻", "🌍", "🧪", "📖", "🎨", "🎵", "⚖️", "🏛️", "💼"];
const PRESET_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#06b6d4",
];

interface SubjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    difficulty: number | null;
    weeklyTargetHours: number | null;
    teacher: string | null;
    notes: string | null;
  } | null;
}

export function SubjectForm({ open, onOpenChange, subject }: SubjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!subject;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("📚");
  const [difficulty, setDifficulty] = useState(0);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState("");
  const [teacher, setTeacher] = useState("");
  const [notes, setNotes] = useState("");

  // Sync form state when subject changes
  const resetForm = () => {
    if (subject) {
      setName(subject.name);
      setDescription(subject.description || "");
      setColor(subject.color || "#3b82f6");
      setIcon(subject.icon || "📚");
      setDifficulty(subject.difficulty || 0);
      setWeeklyTargetHours(subject.weeklyTargetHours?.toString() || "");
      setTeacher(subject.teacher || "");
      setNotes(subject.notes || "");
    } else {
      setName("");
      setDescription("");
      setColor("#3b82f6");
      setIcon("📚");
      setDifficulty(0);
      setWeeklyTargetHours("");
      setTeacher("");
      setNotes("");
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      difficulty: difficulty || undefined,
      weeklyTargetHours: weeklyTargetHours ? parseFloat(weeklyTargetHours) : undefined,
      teacher: teacher.trim(),
      notes: notes.trim(),
    };

    startTransition(async () => {
      try {
        if (isEditing && subject) {
          await updateSubject(subject.id, data);
          toast.success("Materia actualizada");
        } else {
          await createSubject(data);
          toast.success("Materia creada");
        }
        onOpenChange(false);
      } catch (err) {
        console.error("SubjectForm.handleSubmit:", err);
        toast.error("Error al guardar la materia");
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) resetForm();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Materia" : "Nueva Materia"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej: Matematicas"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Textarea
              placeholder="Descripcion de la materia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-17.5"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                    icon === ic
                      ? "bg-primary/10 ring-2 ring-primary scale-110"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Dificultad</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDifficulty(i + 1)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-6 ${
                      i < difficulty
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {difficulty > 0 && (
                <button
                  type="button"
                  onClick={() => setDifficulty(0)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Borrar
                </button>
              )}
            </div>
          </div>

          {/* Weekly Target */}
          <div className="space-y-2">
            <Label>Meta semanal (horas)</Label>
            <Input
              type="number"
              placeholder="Ej: 10"
              min={0}
              step={0.5}
              value={weeklyTargetHours}
              onChange={(e) => setWeeklyTargetHours(e.target.value)}
            />
          </div>

          {/* Teacher */}
          <div className="space-y-2">
            <Label>Profesor</Label>
            <Input
              placeholder="Nombre del profesor"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-15"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Materia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
