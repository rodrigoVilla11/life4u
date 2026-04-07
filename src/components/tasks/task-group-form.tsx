"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { createTaskGroup, updateTaskGroup } from "@/actions/tasks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TaskGroupWithTasks, GoalDashboard } from "@/types";

const PRESET_COLORS = [
  "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#22c55e",
  "#84cc16", "#f59e0b", "#f97316", "#ef4444", "#ec4899",
  "#8b5cf6", "#d946ef",
];

interface TaskGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGroup?: TaskGroupWithTasks | null;
  goals?: GoalDashboard[];
}

export function TaskGroupForm({ open, onOpenChange, editGroup, goals = [] }: TaskGroupFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [goalId, setGoalId] = useState("");

  useEffect(() => {
    if (editGroup) {
      setName(editGroup.name);
      setDescription(editGroup.description ?? "");
      setColor(editGroup.color ?? PRESET_COLORS[0]);
      setGoalId(editGroup.goalId ?? "");
    } else {
      setName("");
      setDescription("");
      setColor(PRESET_COLORS[0]);
      setGoalId("");
    }
  }, [editGroup, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        goalId: goalId || undefined,
      };

      if (editGroup) {
        await updateTaskGroup(editGroup.id, data);
        toast.success("Grupo actualizado");
      } else {
        await createTaskGroup(data);
        toast.success("Grupo creado");
      }
      onOpenChange(false);
    } catch {
      toast.error("Error al guardar grupo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editGroup ? "Editar Grupo" : "Nuevo Grupo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Visa España, Mudanza, Proyecto X..."
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional del grupo..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {goals.length > 0 && (
            <div className="space-y-1.5">
              <Label>Vincular a meta de ahorro</Label>
              <NativeSelect value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                <option value="">Sin vincular</option>
                {goals.map((g) => (
                  <option key={g.goalId} value={g.goalId}>{g.name}</option>
                ))}
              </NativeSelect>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Guardando..." : editGroup ? "Actualizar" : "Crear Grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
