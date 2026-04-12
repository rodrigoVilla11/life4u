"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, ListChecks, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/tasks/task-item";
import { createTask, reorderTasks } from "@/actions/tasks";
import { toast } from "sonner";
import type { TaskNode } from "@/types";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  // Sync when server data changes
  useState(() => { setTasks(initialTasks); });

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
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <ListChecks className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">Sin tareas todavía</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-[280px] leading-relaxed">
          Creá tu primera tarea para empezar a organizar este grupo.
        </p>
        <Button onClick={() => onAddTask()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva tarea
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div>
            {tasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onAddChild={handleAddChild}
                onEditTask={onEditTask}
                onTaskToggled={onTaskToggled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Quick add input */}
      <div className="flex items-center gap-3 px-4 py-3 border-t bg-muted/30">
        <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/25 shrink-0" />
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
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 py-1"
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

function SortableTaskItem({ task, onAddChild, onEditTask, onTaskToggled }: {
  task: TaskNode;
  onAddChild: (parentId: string) => void;
  onEditTask: (task: TaskNode) => void;
  onTaskToggled?: (wasCompleted: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag handle - anchored to first row only (48px height) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-[24px] -translate-y-1/2 p-1 rounded-md cursor-grab active:cursor-grabbing touch-none z-10 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <TaskItem
        task={task}
        depth={0}
        onAddChild={onAddChild}
        onEditTask={onEditTask}
        onTaskToggled={onTaskToggled}
      />
    </div>
  );
}
