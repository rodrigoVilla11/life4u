"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Trash2, Copy, Archive, ArrowRight, ArrowLeft, Star, Calendar, ChevronRight,
} from "lucide-react";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import {
  updateTask, deleteTask, indentTask, outdentTask,
  duplicateTaskWithChildren, archiveTask, createTask, toggleTaskComplete,
} from "@/actions/tasks";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import type { TaskNode } from "@/types";

interface TaskDetailSheetProps {
  task: TaskNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  goals?: Array<{ id: string; name: string }>;
  onTaskToggled?: (wasCompleted: boolean) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange, groupId, goals = [], onTaskToggled }: TaskDetailSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");

  if (!task) return null;

  const hasChildren = task.children.length > 0;

  function act(fn: () => Promise<unknown>) {
    startTransition(async () => {
      try { await fn(); router.refresh(); }
      catch { toast.error("Error"); }
    });
  }

  function handleSaveField(field: string, value: unknown) {
    act(() => updateTask(task!.id, { [field]: value || null }));
  }

  function handleDelete() {
    act(async () => {
      await deleteTask(task!.id);
      toast.success("Tarea eliminada");
      setDeleteOpen(false);
      onOpenChange(false);
    });
  }

  function handleAddSubtask() {
    const title = subtaskTitle.trim();
    if (!title) return;
    act(async () => {
      await createTask({ title, groupId, parentId: task!.id, priority: "MEDIUM", status: "PENDING", tags: [] });
      toast.success("Subtarea creada");
      setSubtaskTitle("");
      setShowSubtaskInput(false);
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          <div className="p-5 sm:p-6 space-y-6">
            <SheetHeader className="mb-0">
              <SheetTitle className="sr-only">{task.title}</SheetTitle>
              <Input
                defaultValue={task.title}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== task.title) handleSaveField("title", v);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                className="text-2xl sm:text-3xl font-bold border-0 shadow-none px-0 h-auto py-2 focus-visible:ring-0 bg-transparent tracking-tight"
                disabled={isPending}
              />
            </SheetHeader>

            {/* ===== STATUS & PRIORITY ===== */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Estado</Label>
                <NativeSelect
                  value={task.status}
                  onChange={(e) => handleSaveField("status", e.target.value)}
                  disabled={isPending}
                >
                  {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Prioridad</Label>
                <NativeSelect
                  value={task.priority}
                  onChange={(e) => handleSaveField("priority", e.target.value)}
                  disabled={isPending}
                >
                  {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            {/* ===== DUE DATE ===== */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Fecha límite</Label>
                <Input
                  type="date"
                  defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleSaveField("dueDate", e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Hora</Label>
                <Input
                  type="time"
                  defaultValue={task.dueTime ?? ""}
                  onChange={(e) => handleSaveField("dueTime", e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* ===== DESCRIPTION ===== */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Descripción</Label>
              <Textarea
                defaultValue={task.description ?? ""}
                placeholder="Agregá una descripción..."
                rows={3}
                onBlur={(e) => handleSaveField("description", e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* ===== GOAL LINK ===== */}
            {goals.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Meta vinculada</Label>
                <NativeSelect
                  value={task.goal?.id ?? ""}
                  onChange={(e) => handleSaveField("goalId", e.target.value)}
                  disabled={isPending}
                >
                  <option value="">Sin vincular</option>
                  {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </NativeSelect>
              </div>
            )}

            {/* ===== FAVORITE ===== */}
            <div className="flex items-center justify-between py-1">
              <Label className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-400" /> Favorita
              </Label>
              <Switch
                checked={task.isFavorite}
                onCheckedChange={(v) => handleSaveField("isFavorite", v)}
                disabled={isPending}
              />
            </div>

            {/* ===== SUBTASKS ===== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Subtareas {hasChildren && `(${task.completedChildrenCount}/${task.childrenCount})`}
                </Label>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setShowSubtaskInput(true)}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" /> Agregar
                </Button>
              </div>

              {hasChildren && (
                <div className="space-y-1">
                  <Progress value={task.progress} className="h-1.5 mb-2" />
                  {task.children.map((child) => (
                    <SubtaskRow key={child.id} child={child} onToggle={() => {
                      act(() => toggleTaskComplete(child.id));
                      onTaskToggled?.(child.status === "COMPLETED");
                    }} />
                  ))}
                </div>
              )}

              {showSubtaskInput && (
                <div className="flex gap-2">
                  <Input
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder="Título de la subtarea..."
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddSubtask(); if (e.key === "Escape") setShowSubtaskInput(false); }}
                    disabled={isPending}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddSubtask} disabled={isPending || !subtaskTitle.trim()}>
                    Crear
                  </Button>
                </div>
              )}

              {!hasChildren && !showSubtaskInput && (
                <p className="text-sm text-muted-foreground text-center py-3">Sin subtareas</p>
              )}
            </div>

            {/* ===== TAGS ===== */}
            {task.tags.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Etiquetas</Label>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* ===== ACTIONS ===== */}
            <div className="border-t pt-4 space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Acciones</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => { act(() => indentTask(task.id)); }} disabled={isPending}>
                  <ArrowRight className="h-4 w-4" /> Indent
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => { act(() => outdentTask(task.id)); }} disabled={isPending}>
                  <ArrowLeft className="h-4 w-4" /> Outdent
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => { act(async () => { await duplicateTaskWithChildren(task.id); toast.success("Duplicada"); }); }} disabled={isPending}>
                  <Copy className="h-4 w-4" /> Duplicar
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => { act(async () => { await archiveTask(task.id); toast.success("Archivada"); onOpenChange(false); }); }} disabled={isPending}>
                  <Archive className="h-4 w-4" /> Archivar
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start gap-2 mt-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> Eliminar tarea
              </Button>
            </div>

            {/* ===== META INFO ===== */}
            <div className="text-[11px] text-muted-foreground/60 pt-2 border-t space-y-0.5">
              <p>Creada: {format(new Date(task.createdAt), "d MMM yyyy HH:mm", { locale: es })}</p>
              {task.completedAt && <p>Completada: {format(new Date(task.completedAt), "d MMM yyyy HH:mm", { locale: es })}</p>}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{task.title}&quot;
              {hasChildren && ` y sus ${task.childrenCount} subtareas`}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SubtaskRow({ child, onToggle }: { child: TaskNode; onToggle: () => void }) {
  const [optimisticDone, setOptimisticDone] = useState<boolean | null>(null);
  const done = optimisticDone ?? child.status === "COMPLETED";

  return (
    <div className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
      <button
        type="button"
        onClick={() => { setOptimisticDone(!done); onToggle(); }}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90
          ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/30 hover:border-emerald-400"}`}
      >
        {done && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className={`text-sm flex-1 ${done ? "line-through text-muted-foreground" : ""}`}>
        {child.title}
      </span>
      {child.dueDate && (
        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
          <Calendar className="h-3 w-3" />
          {format(new Date(child.dueDate), "d MMM", { locale: es })}
        </span>
      )}
      {child.children.length > 0 && (
        <span className="text-[10px] text-muted-foreground">{child.childrenCount} sub</span>
      )}
    </div>
  );
}
