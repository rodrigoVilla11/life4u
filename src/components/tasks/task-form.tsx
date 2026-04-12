"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { createTask, updateTask } from "@/actions/tasks";
import { toast } from "sonner";
import type { TaskNode } from "@/types";
import { Star, X } from "lucide-react";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  parentId?: string | null;
  parentTitle?: string;
  editTask?: TaskNode | null;
  goals?: Array<{ id: string; name: string }>;
}

export function TaskForm({
  open,
  onOpenChange,
  groupId,
  parentId = null,
  parentTitle,
  editTask,
  goals = [],
}: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [goalId, setGoalId] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description ?? "");
      setPriority(editTask.priority);
      setStatus(editTask.status);
      setDueDate(editTask.dueDate ? new Date(editTask.dueDate).toISOString().split("T")[0] : "");
      setDueTime(editTask.dueTime ?? "");
      setGoalId(editTask.goal?.id ?? "");
      setIsFavorite(editTask.isFavorite);
      setTags(editTask.tags.map((t) => t.name));
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus("PENDING");
      setDueDate("");
      setDueTime("");
      setGoalId("");
      setIsFavorite(false);
      setTags([]);
    }
    setTagInput("");
  }, [editTask, open]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        groupId,
        parentId: editTask ? editTask.parentId : (parentId ?? undefined),
        goalId: goalId || undefined,
        isFavorite,
        tags,
      };

      if (editTask) {
        await updateTask(editTask.id, data);
        toast.success("Tarea actualizada");
      } else {
        await createTask(data);
        toast.success("Tarea creada");
      }
      onOpenChange(false);
    } catch (err) {
      console.error("TaskForm.onSubmit:", err);
      toast.error("Error al guardar tarea");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTask ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
          {parentTitle && !editTask && (
            <DialogDescription>Subtarea de: {parentTitle}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué necesitás hacer?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles opcionales..."
              rows={2}
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <NativeSelect value={priority} onChange={(e) => setPriority(e.target.value)}>
                {Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NativeSelect>
            </div>
          </div>

          {/* Due date & time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha límite</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hora</Label>
              <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>

          {/* Goal */}
          {goals.length > 0 && (
            <div className="space-y-1.5">
              <Label>Vincular a meta</Label>
              <NativeSelect value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                <option value="">Sin vincular</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </NativeSelect>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="Escribí y presioná Enter..."
            />
          </div>

          {/* Favorite */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4" /> Favorita
            </Label>
            <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Guardando..." : editTask ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
