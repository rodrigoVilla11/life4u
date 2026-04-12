"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Star, Calendar, GripVertical } from "lucide-react";
import { toggleTaskComplete, updateTask, toggleCollapse, reorderTasks } from "@/actions/tasks";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale/es";
import type { TaskNode } from "@/types";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_BORDER: Record<string, string> = {
  URGENT: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-blue-500",
  LOW: "border-l-slate-300 dark:border-l-slate-600",
};

interface TaskItemProps {
  task: TaskNode;
  depth: number;
  onAddChild: (parentId: string) => void;
  onEditTask: (task: TaskNode) => void;
  onTaskToggled?: (wasCompleted: boolean) => void;
  sortable?: boolean;
}

export function TaskItem({ task, depth, onAddChild, onEditTask, onTaskToggled, sortable }: TaskItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticCompleted, setOptimisticCompleted] = useState<boolean | null>(null);
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const [optimisticCollapsed, setOptimisticCollapsed] = useState<boolean | null>(null);
  const [localChildren, setLocalChildren] = useState(task.children);

  useEffect(() => { setLocalChildren(task.children); }, [task.children]);

  const isCompleted = optimisticCompleted ?? task.status === "COMPLETED";
  const isFavorite = optimisticFavorite ?? task.isFavorite;
  const isCollapsed = optimisticCollapsed ?? task.isCollapsed;
  const hasChildren = localChildren.length > 0;
  const indent = depth * 24;

  // Sortable hook (only used when sortable prop is true)
  const {
    attributes, listeners, setNodeRef, transform, transition: sortTransition, isDragging,
  } = useSortable({ id: task.id, disabled: !sortable });

  const sortStyle = sortable ? {
    transform: CSS.Transform.toString(transform),
    transition: sortTransition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  // Sensors for children drag
  const childSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleChildDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalChildren((prev) => {
      const oldIdx = prev.findIndex((t) => t.id === active.id);
      const newIdx = prev.findIndex((t) => t.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return prev;
      const moved = arrayMove(prev, oldIdx, newIdx);
      reorderTasks(moved.map((t) => t.id));
      return moved;
    });
  }

  const act = useCallback((fn: () => Promise<unknown>) => {
    startTransition(async () => {
      try { await fn(); router.refresh(); }
      catch (err) { console.error("TaskItem.act:", err); toast.error("Error al ejecutar acción"); }
    });
  }, [router]);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptimisticCompleted(!isCompleted);
    onTaskToggled?.(isCompleted);
    act(() => toggleTaskComplete(task.id));
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptimisticCollapsed(!isCollapsed);
    act(() => toggleCollapse(task.id));
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptimisticFavorite(!isFavorite);
    act(() => updateTask(task.id, { isFavorite: !isFavorite }));
  };

  const handleRowClick = () => { onEditTask(task); };

  const dueDateLabel = (() => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    if (isToday(d)) return "Hoy";
    return format(d, "d MMM", { locale: es });
  })();

  const isOverdue = task.dueDate && !isCompleted && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div ref={sortable ? setNodeRef : undefined} style={sortStyle}>
      {/* ===== TASK ROW ===== */}
      <div
        onClick={handleRowClick}
        className={`
          group/row relative transition-colors duration-100 border-l-[3px] cursor-pointer
          hover:bg-accent/50
          ${PRIORITY_BORDER[task.priority]}
          ${isPending ? "opacity-70" : ""}
        `}
        style={{ paddingLeft: indent + 8 }}
      >
        <div className="flex items-center gap-2 py-2.5 pr-3 min-h-11">
          {/* Drag handle */}
          {sortable && (
            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 p-0.5 rounded cursor-grab active:cursor-grabbing touch-none text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          )}

          {/* Collapse chevron */}
          <button
            type="button"
            onClick={handleToggleCollapse}
            className={`shrink-0 flex items-center justify-center w-5 h-5 rounded transition-colors
              ${hasChildren ? "text-muted-foreground hover:text-foreground" : "invisible"}`}
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-150 ${hasChildren && !isCollapsed ? "rotate-90" : ""}`} />
          </button>

          {/* Checkbox */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${isCompleted
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-muted-foreground/25 hover:border-emerald-400"
              }`}
          >
            {isCompleted && (
              <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Title + metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm leading-snug truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </span>
              {hasChildren && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                  <span className="tabular-nums">{task.completedChildrenCount}/{task.childrenCount}</span>
                  <span className="w-6 h-1 rounded-full bg-muted overflow-hidden">
                    <span className="block h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${task.progress}%` }} />
                  </span>
                </span>
              )}
            </div>
            {(dueDateLabel || task.tags.length > 0) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {dueDateLabel && (
                  <span className={`inline-flex items-center gap-0.5 text-[10px] ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                    <Calendar className="h-2.5 w-2.5" />
                    {dueDateLabel}
                  </span>
                )}
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-[9px] px-1.5 py-0 h-3.5">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Favorite star */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`shrink-0 p-1 rounded transition-colors
              ${isFavorite
                ? "text-amber-400"
                : "text-transparent group-hover/row:text-muted-foreground/25 hover:!text-amber-400"
              }`}
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* ===== CHILDREN with DnD ===== */}
      {hasChildren && !isCollapsed && (
        <div
          className="border-l border-border/30"
          style={{ marginLeft: indent + 20 }}
        >
          <DndContext sensors={childSensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd}>
            <SortableContext items={localChildren.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {localChildren.map((child) => (
                <TaskItem
                  key={child.id}
                  task={child}
                  depth={0}
                  onAddChild={onAddChild}
                  onEditTask={onEditTask}
                  onTaskToggled={onTaskToggled}
                  sortable
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
