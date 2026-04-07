"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Star,
  Calendar,
} from "lucide-react";
import {
  toggleTaskComplete,
  updateTask,
  toggleCollapse,
} from "@/actions/tasks";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale/es";
import type { TaskNode } from "@/types";

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
}

export function TaskItem({ task, depth, onAddChild, onEditTask, onTaskToggled }: TaskItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic state
  const [optimisticCompleted, setOptimisticCompleted] = useState<boolean | null>(null);
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const [optimisticCollapsed, setOptimisticCollapsed] = useState<boolean | null>(null);

  const isCompleted = optimisticCompleted ?? task.status === "COMPLETED";
  const isFavorite = optimisticFavorite ?? task.isFavorite;
  const isCollapsed = optimisticCollapsed ?? task.isCollapsed;
  const hasChildren = task.children.length > 0;
  const indent = depth * 20;

  const act = useCallback((fn: () => Promise<unknown>) => {
    startTransition(async () => {
      try { await fn(); router.refresh(); }
      catch { toast.error("Error al ejecutar acción"); }
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

  // Click on row (not on buttons) opens detail
  const handleRowClick = () => {
    onEditTask(task);
  };

  const dueDateLabel = (() => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    if (isToday(d)) return "Hoy";
    return format(d, "d MMM", { locale: es });
  })();

  const isOverdue = task.dueDate && !isCompleted && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <>
      {/* ===== TASK ROW ===== */}
      <div
        onClick={handleRowClick}
        className={`
          group relative transition-colors duration-100 border-l-3 cursor-pointer
          hover:bg-accent/40 active:bg-accent/60
          ${PRIORITY_BORDER[task.priority]}
          ${isPending ? "opacity-80" : ""}
        `}
        style={{ paddingLeft: indent + 12 }}
      >
        <div className="flex items-center gap-2.5 py-3 sm:py-2.5 pr-3 min-h-[48px] sm:min-h-[44px]">
          {/* Collapse chevron */}
          <button
            type="button"
            onClick={handleToggleCollapse}
            className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-all
              ${hasChildren ? "text-muted-foreground hover:text-foreground hover:bg-accent" : "invisible"}`}
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${hasChildren && !isCollapsed ? "rotate-90" : ""}`} />
          </button>

          {/* Checkbox */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`shrink-0 w-[22px] h-[22px] sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${isCompleted
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-muted-foreground/30 hover:border-emerald-400"
              }`}
          >
            {isCompleted && (
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Title + metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[15px] sm:text-sm leading-snug truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </span>
              {hasChildren && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <span className="tabular-nums">{task.completedChildrenCount}/{task.childrenCount}</span>
                  <span className="w-8 h-1.5 rounded-full bg-muted overflow-hidden">
                    <span className="block h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${task.progress}%` }} />
                  </span>
                </span>
              )}
            </div>
            {/* Metadata row */}
            <div className="flex items-center gap-2 mt-0.5">
              {dueDateLabel && (
                <span className={`inline-flex items-center gap-0.5 text-[11px] ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                  <Calendar className="h-3 w-3" />
                  {dueDateLabel}
                </span>
              )}
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {tag.name}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground">+{task.tags.length - 2}</span>
              )}
            </div>
          </div>

          {/* Favorite star */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`shrink-0 p-1.5 rounded-lg transition-colors
              ${isFavorite
                ? "text-amber-400"
                : "text-transparent group-hover:text-muted-foreground/30 hover:!text-amber-400"
              }`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* ===== CHILDREN ===== */}
      {hasChildren && !isCollapsed && (
        <div
          className="border-l-2 border-muted-foreground/10"
          style={{ marginLeft: indent + 16 }}
        >
          {task.children.map((child) => (
            <TaskItem key={child.id} task={child} depth={0} onAddChild={onAddChild} onEditTask={onEditTask} onTaskToggled={onTaskToggled} />
          ))}
        </div>
      )}
    </>
  );
}
