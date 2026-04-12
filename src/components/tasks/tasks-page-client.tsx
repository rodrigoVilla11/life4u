"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TaskGroupCard } from "./task-group-card";
import { TaskGroupForm } from "./task-group-form";
import { TaskForm } from "./task-form";
import { TaskTree } from "./task-tree";
import { TaskDetailSheet } from "./task-detail-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, ArrowLeft, Search, FolderOpen, CheckCircle2, ListTodo, GripVertical } from "lucide-react";
import { reorderGroups } from "@/actions/tasks";
import { Progress } from "@/components/ui/progress";
import type { TaskGroupWithTasks, TaskNode, GoalDashboard } from "@/types";

interface TasksPageClientProps {
  groups: TaskGroupWithTasks[];
  goals: GoalDashboard[];
}

export function TasksPageClient({ groups: initialGroups, goals }: TasksPageClientProps) {
  const [localGroups, setLocalGroups] = useState(initialGroups);
  const groups = localGroups;

  useEffect(() => { setLocalGroups(initialGroups); }, [initialGroups]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalGroups((prev) => {
      const oldIndex = prev.findIndex((g) => g.id === active.id);
      const newIndex = prev.findIndex((g) => g.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const moved = arrayMove(prev, oldIndex, newIndex);
      reorderGroups(moved.map((g) => g.id));
      return moved;
    });
  }

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TaskGroupWithTasks | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskFormParentId, setTaskFormParentId] = useState<string | null>(null);
  const [taskFormParentTitle, setTaskFormParentTitle] = useState<string | undefined>();
  const [detailTask, setDetailTask] = useState<TaskNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [completionDelta, setCompletionDelta] = useState(0);

  const activeGroup = activeGroupId ? groups.find((g) => g.id === activeGroupId) : null;

  const handleOpenGroupWithReset = useCallback((groupId: string) => {
    setActiveGroupId(groupId);
    setCompletionDelta(0);
    setSearch("");
  }, []);

  const handleTaskToggled = useCallback((wasCompleted: boolean) => {
    setCompletionDelta((d) => wasCompleted ? d - 1 : d + 1);
  }, []);

  useEffect(() => { setCompletionDelta(0); }, [groups]);

  const optimisticCompleted = activeGroup ? Math.max(0, activeGroup.completedTasks + completionDelta) : 0;
  const optimisticTotal = activeGroup ? activeGroup.totalTasks : 0;
  const optimisticProgress = optimisticTotal > 0
    ? Math.min(Math.max((optimisticCompleted / optimisticTotal) * 100, 0), 100)
    : 0;

  function handleOpenGroup(groupId: string) {
    handleOpenGroupWithReset(groupId);
  }

  function handleAddTask(parentId?: string) {
    setTaskFormParentId(parentId ?? null);
    if (parentId && activeGroup) {
      const parent = findTaskInTree(activeGroup.tasks, parentId);
      setTaskFormParentTitle(parent?.title);
    } else {
      setTaskFormParentTitle(undefined);
    }
    setTaskFormOpen(true);
  }

  function handleEditTask(task: TaskNode) {
    setDetailTask(task);
    setDetailOpen(true);
  }

  function handleEditGroup(group: TaskGroupWithTasks) {
    setEditingGroup(group);
    setGroupFormOpen(true);
  }

  function handleNewGroup() {
    setEditingGroup(null);
    setGroupFormOpen(true);
  }

  function filterTasks(tasks: TaskNode[], query: string): TaskNode[] {
    if (!query) return tasks;
    const lower = query.toLowerCase();
    return tasks.reduce<TaskNode[]>((acc, task) => {
      const matchesSearch = task.title.toLowerCase().includes(lower) ||
        task.tags.some((t) => t.name.toLowerCase().includes(lower));
      const filteredChildren = filterTasks(task.children, query);
      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...task,
          children: filteredChildren.length > 0 ? filteredChildren : (matchesSearch ? task.children : []),
          isCollapsed: false,
        });
      }
      return acc;
    }, []);
  }

  const totalTasks = groups.reduce((s, g) => s + g.totalTasks, 0);
  const completedTasks = groups.reduce((s, g) => s + g.completedTasks, 0);

  // ==========================================
  // GROUPS OVERVIEW
  // ==========================================
  if (!activeGroup) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1>Tareas</h1>
            <p className="text-muted-foreground text-sm mt-1">Organizá tus proyectos y tareas en grupos</p>
          </div>
          <Button onClick={handleNewGroup} className="gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Nuevo Grupo
          </Button>
        </div>

        {/* Overview stats */}
        {groups.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs">
              <FolderOpen className="h-3 w-3" />
              {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs">
              <ListTodo className="h-3 w-3" />
              {totalTasks} tareas
            </Badge>
            <Badge variant="success" className="gap-1.5 py-1 px-2.5 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              {completedTasks} completadas
            </Badge>
          </div>
        )}

        {/* Groups grid */}
        {groups.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={groups.map((g) => g.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <SortableGroupCard
                    key={group.id}
                    group={group}
                    onOpen={handleOpenGroup}
                    onEdit={handleEditGroup}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No hay grupos todavía"
            description="Creá tu primer grupo para organizar tareas."
            actionLabel="Crear Grupo"
            onAction={handleNewGroup}
          />
        )}

        <TaskGroupForm
          open={groupFormOpen}
          onOpenChange={setGroupFormOpen}
          editGroup={editingGroup}
          goals={goals}
        />
      </div>
    );
  }

  // ==========================================
  // GROUP DETAIL
  // ==========================================
  const filteredTasks = filterTasks(activeGroup.tasks, search);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setActiveGroupId(null)}
          className="mt-0.5 shrink-0"
          aria-label="Volver a grupos"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center"
              style={{ backgroundColor: activeGroup.color ?? "#6366f1" }}
            >
              <FolderOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate">{activeGroup.name}</h2>
              {activeGroup.description && (
                <p className="text-xs text-muted-foreground truncate">{activeGroup.description}</p>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => handleAddTask()} size="sm" className="gap-1.5 shrink-0">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nueva Tarea</span>
        </Button>
      </div>

      {/* Progress */}
      {activeGroup.totalTasks > 0 && (
        <div className="flex items-center gap-3 px-1">
          <Progress value={optimisticProgress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {optimisticCompleted}/{activeGroup.totalTasks}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tareas..."
          className="pl-9 h-9 max-w-sm"
        />
      </div>

      {/* Task Tree */}
      <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
        <TaskTree
          tasks={filteredTasks}
          groupId={activeGroup.id}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onTaskToggled={handleTaskToggled}
        />
      </div>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        groupId={activeGroup.id}
        parentId={taskFormParentId}
        parentTitle={taskFormParentTitle}
        goals={goals.map((g) => ({ id: g.goalId, name: g.name }))}
      />

      <TaskDetailSheet
        task={detailTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        groupId={activeGroup.id}
        goals={goals.map((g) => ({ id: g.goalId, name: g.name }))}
        onTaskToggled={handleTaskToggled}
      />

      <TaskGroupForm
        open={groupFormOpen}
        onOpenChange={setGroupFormOpen}
        editGroup={editingGroup}
        goals={goals}
      />
    </div>
  );
}

function findTaskInTree(tasks: TaskNode[], id: string): TaskNode | null {
  for (const task of tasks) {
    if (task.id === id) return task;
    const found = findTaskInTree(task.children, id);
    if (found) return found;
  }
  return null;
}

function SortableGroupCard({ group, onOpen, onEdit }: {
  group: TaskGroupWithTasks;
  onOpen: (id: string) => void;
  onEdit: (group: TaskGroupWithTasks) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {/* Drag handle - integrated into card top-left */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 z-10 p-1 rounded-md cursor-grab active:cursor-grabbing touch-none text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <TaskGroupCard
        group={group}
        onOpen={onOpen}
        onEdit={onEdit}
      />
    </div>
  );
}
