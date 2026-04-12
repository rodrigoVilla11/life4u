"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/tasks/task-item";
import { createTask, reorderTasks } from "@/actions/tasks";
import { toast } from "sonner";
import type { TaskNode } from "@/types";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

interface TaskTreeProps {
  tasks: TaskNode[];
  groupId: string;
  onAddTask: (parentId?: string) => void;
  onEditTask: (task: TaskNode) => void;
  onTaskToggled?: (wasCompleted: boolean) => void;
}

export function TaskTree({ tasks: initialTasks, groupId, onAddTask, onEditTask, onTaskToggled }: TaskTreeProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [quickAddValue, setQuickAddValue] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTasks(initialTasks); }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const moved = arrayMove(prev, oldIndex, newIndex);
      reorderTasks(moved.map((t) => t.id));
      return moved;
    });
  }

  const handleQuickAdd = useCallback(async () => {
    const title = quickAddValue.trim();
    if (!title) return;
    setAdding(true);
    try {
      await createTask({ title, groupId, priority: "MEDIUM", status: "PENDING", tags: [] });
      setQuickAddValue("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("TaskTree.handleQuickAdd:", err);
      toast.error("Error al crear tarea");
    } finally {
      setAdding(false);
    }
  }, [quickAddValue, groupId]);

  const handleAddChild = useCallback(
    (parentId: string) => { onAddTask(parentId); },
    [onAddTask]
  );

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <ListChecks className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold mb-1">Sin tareas todavía</h3>
        <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
          Creá tu primera tarea para empezar.
        </p>
        <Button size="sm" onClick={() => onAddTask()} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nueva tarea
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-border/40">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                depth={0}
                onAddChild={handleAddChild}
                onEditTask={onEditTask}
                onTaskToggled={onTaskToggled}
                sortable
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Quick add */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border/40 bg-muted/20">
        <div className="h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground/20 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleQuickAdd(); }
          }}
          placeholder="Agregar tarea rápida..."
          disabled={adding}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 py-1 text-foreground"
        />
        {quickAddValue.trim() && (
          <Button size="xs" onClick={handleQuickAdd} disabled={adding} className="shrink-0">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
