"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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

  // Sync when server data changes
  useEffect(() => { setLocalGroups(initialGroups); }, [initialGroups]);

  // Drag & drop sensors
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
      // Persist to server
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
  // Optimistic progress: track delta of completions done in this session
  const [completionDelta, setCompletionDelta] = useState(0);

  const activeGroup = activeGroupId ? groups.find((g) => g.id === activeGroupId) : null;

  // Reset delta when switching groups
  const handleOpenGroupWithReset = useCallback((groupId: string) => {
    setActiveGroupId(groupId);
    setCompletionDelta(0);
    setSearch("");
  }, []);

  // Called by TaskItem when a task is toggled
  const handleTaskToggled = useCallback((wasCompleted: boolean) => {
    setCompletionDelta((d) => wasCompleted ? d - 1 : d + 1);
  }, []);

  // Reset delta when server data changes (groups prop updates)
  useEffect(() => {
    setCompletionDelta(0);
  }, [groups]);

  // Progress from server data (most accurate) + delta for optimistic
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

  // Compute totals for the overview header
  const totalTasks = groups.reduce((s, g) => s + g.totalTasks, 0);
  const completedTasks = groups.reduce((s, g) => s + g.completedTasks, 0);

  // ==========================================
  // GROUPS OVERVIEW
  // ==========================================
  if (!activeGroup) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tareas</h1>
            <p className="text-muted-foreground text-[15px] mt-1">Organizá tus proyectos y tareas en grupos</p>
          </div>
          <Button onClick={handleNewGroup} className="gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Nuevo Grupo
          </Button>
        </div>

        {/* Overview stats */}
        {groups.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm">
              <FolderOpen className="h-3.5 w-3.5" />
              {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm">
              <ListTodo className="h-3.5 w-3.5" />
              {totalTasks} tareas
            </Badge>
            <Badge variant="success" className="gap-1.5 py-1.5 px-3 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completedTasks} completadas
            </Badge>
          </div>
        )}

        {/* Groups grid with drag & drop */}
        {groups.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={groups.map((g) => g.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            description="Creá tu primer grupo para organizar tareas. Por ejemplo: 'Visa España', 'Mudanza', 'Proyecto X'."
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
  // GROUP DETAIL WITH TASK TREE
  // ==========================================
  const filteredTasks = filterTasks(activeGroup.tasks, search);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setActiveGroupId(null)}
          className="mt-1 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center"
              style={{ backgroundColor: activeGroup.color ?? "#6366f1" }}
            >
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{activeGroup.name}</h1>
              {activeGroup.description && (
                <p className="text-sm text-muted-foreground truncate">{activeGroup.description}</p>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => handleAddTask()} size="sm" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Tarea</span>
        </Button>
      </div>

      {/* Progress + stats */}
      {activeGroup.totalTasks > 0 && (
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Progreso</span>
              <Badge variant={optimisticProgress >= 100 ? "success" : "secondary"} className="text-xs">
                {Math.round(optimisticProgress)}%
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {optimisticCompleted} de {activeGroup.totalTasks} tareas
            </span>
          </div>
          <Progress value={optimisticProgress} className="h-2.5 transition-all duration-300" />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tareas..."
          className="pl-10 max-w-md"
        />
      </div>

      {/* Task Tree */}
      <div className="border rounded-2xl bg-card overflow-hidden">
        <TaskTree
          tasks={filteredTasks}
          groupId={activeGroup.id}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onTaskToggled={handleTaskToggled}
        />
      </div>

      {/* Task Form Dialog (create only) */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        groupId={activeGroup.id}
        parentId={taskFormParentId}
        parentTitle={taskFormParentTitle}
        goals={goals.map((g) => ({ id: g.goalId, name: g.name }))}
      />

      {/* Task Detail Sheet (view/edit) */}
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
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 focus:opacity-100 cursor-grab active:cursor-grabbing touch-none transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <TaskGroupCard
        group={group}
        onOpen={onOpen}
        onEdit={onEdit}
      />
    </div>
  );
}
