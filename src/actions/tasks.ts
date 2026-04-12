"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-helpers";
import { taskSchema, taskGroupSchema } from "@/schemas/task";
import { parseLocalDate } from "@/lib/utils";
import type { TaskNode, TaskGroupWithTasks } from "@/types";

// ==========================================
// TASK GROUPS
// ==========================================

export async function getTaskGroups(): Promise<TaskGroupWithTasks[]> {
  const user = await getRequiredUser();

  const groups = await prisma.taskGroup.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: { position: "asc" },
    include: {
      goal: { select: { id: true, name: true } },
      tasks: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
        include: {
          tags: true,
          goal: { select: { id: true, name: true } },
        },
      },
    },
  });

  return groups.map((group) => {
    const tree = buildTaskTree(group.tasks);
    const allTasks = group.tasks;
    const completedTasks = allTasks.filter((t) => t.status === "COMPLETED").length;

    return {
      id: group.id,
      userId: group.userId,
      name: group.name,
      description: group.description,
      color: group.color,
      icon: group.icon,
      position: group.position,
      goalId: group.goalId,
      goal: group.goal,
      archivedAt: group.archivedAt,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      tasks: tree,
      totalTasks: allTasks.length,
      completedTasks,
      progress: allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0,
    };
  });
}

export async function getTaskGroup(id: string): Promise<TaskGroupWithTasks | null> {
  const user = await getRequiredUser();

  const group = await prisma.taskGroup.findFirst({
    where: { id, userId: user.id },
    include: {
      goal: { select: { id: true, name: true } },
      tasks: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
        include: {
          tags: true,
          goal: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!group) return null;

  const tree = buildTaskTree(group.tasks);
  const completedTasks = group.tasks.filter((t) => t.status === "COMPLETED").length;

  return {
    id: group.id,
    userId: group.userId,
    name: group.name,
    description: group.description,
    color: group.color,
    icon: group.icon,
    position: group.position,
    goalId: group.goalId,
    goal: group.goal,
    archivedAt: group.archivedAt,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    tasks: tree,
    totalTasks: group.tasks.length,
    completedTasks,
    progress: group.tasks.length > 0 ? (completedTasks / group.tasks.length) * 100 : 0,
  };
}

export async function createTaskGroup(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = taskGroupSchema.parse(data);

  const maxPos = await prisma.taskGroup.aggregate({
    where: { userId: user.id },
    _max: { position: true },
  });

  // Clean empty strings to null for optional foreign keys
  const { goalId, ...rest } = parsed;

  const group = await prisma.taskGroup.create({
    data: {
      ...rest,
      goalId: goalId || null,
      userId: user.id,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });

  revalidatePath("/tasks");
  return group;
}

export async function updateTaskGroup(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const updateData = { ...data };
  // Clean empty strings to null for optional foreign keys
  if ("goalId" in updateData) {
    updateData.goalId = updateData.goalId || null;
  }
  await prisma.taskGroup.update({
    where: { id, userId: user.id },
    data: updateData,
  });
  revalidatePath("/tasks");
}

export async function deleteTaskGroup(id: string) {
  const user = await getRequiredUser();
  await prisma.taskGroup.delete({ where: { id, userId: user.id } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function reorderGroups(orderedIds: string[]) {
  const user = await getRequiredUser();
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.taskGroup.update({
        where: { id, userId: user.id },
        data: { position: i },
      })
    )
  );
  revalidatePath("/tasks");
}

export async function reorderTasks(orderedIds: string[]) {
  const user = await getRequiredUser();
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.task.update({
        where: { id, userId: user.id },
        data: { position: i },
      })
    )
  );
  revalidatePath("/tasks");
}

export async function archiveTaskGroup(id: string) {
  const user = await getRequiredUser();
  await prisma.taskGroup.update({
    where: { id, userId: user.id },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/tasks");
}

// ==========================================
// TASKS (HIERARCHICAL)
// ==========================================

export async function createTask(data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const parsed = taskSchema.parse(data);
  const { tags, dueDate, parentId, goalId, ...rest } = parsed;

  // Calculate level based on parent
  let level = 0;
  if (parentId) {
    const parent = await prisma.task.findFirst({ where: { id: parentId } });
    if (parent) level = parent.level + 1;
  }

  // Get max position among siblings
  const maxPos = await prisma.task.aggregate({
    where: {
      groupId: parsed.groupId,
      parentId: parentId ?? null,
    },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      ...rest,
      parentId: parentId || null,
      goalId: goalId || null,
      dueDate: dueDate ? parseLocalDate(dueDate) : undefined,
      userId: user.id,
      level,
      position: (maxPos._max.position ?? 0) + 1,
      tags: tags.length > 0
        ? { create: tags.map((name) => ({ name })) }
        : undefined,
    },
    include: { tags: true, goal: { select: { id: true, name: true } } },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  const user = await getRequiredUser();
  const updateData: Record<string, unknown> = { ...data };

  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? parseLocalDate(data.dueDate as string) : null;
  }

  if (data.status === "COMPLETED" && !data.completedAt) {
    updateData.completedAt = new Date();
  } else if (data.status && data.status !== "COMPLETED") {
    updateData.completedAt = null;
  }

  if (data.tags) {
    const tags = data.tags as string[];
    delete updateData.tags;
    await prisma.taskTag.deleteMany({ where: { taskId: id } });
    if (tags.length > 0) {
      await prisma.taskTag.createMany({
        data: tags.map((name) => ({ taskId: id, name })),
      });
    }
  }

  const task = await prisma.task.update({
    where: { id, userId: user.id },
    data: updateData,
    include: { tags: true, children: true },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function toggleTaskComplete(id: string) {
  const user = await getRequiredUser();
  const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!task) throw new Error("Task not found");

  const isCompleting = task.status !== "COMPLETED";
  const newStatus = isCompleting ? "COMPLETED" : "PENDING";

  await prisma.task.update({
    where: { id },
    data: {
      status: newStatus,
      completedAt: isCompleting ? new Date() : null,
    },
  });

  // If completing, also complete all children recursively
  if (isCompleting) {
    await completeChildrenRecursive(id);
  }

  // Check if parent should auto-complete
  if (task.parentId && isCompleting) {
    await checkParentAutoComplete(task.parentId);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

async function completeChildrenRecursive(parentId: string) {
  const children = await prisma.task.findMany({
    where: { parentId, status: { not: "COMPLETED" } },
  });

  for (const child of children) {
    await prisma.task.update({
      where: { id: child.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    await completeChildrenRecursive(child.id);
  }
}

async function checkParentAutoComplete(parentId: string) {
  const siblings = await prisma.task.findMany({
    where: { parentId, archivedAt: null },
    select: { status: true },
  });

  const allCompleted = siblings.every((s) => s.status === "COMPLETED");
  if (allCompleted && siblings.length > 0) {
    await prisma.task.update({
      where: { id: parentId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    // Check grandparent too
    const parent = await prisma.task.findFirst({ where: { id: parentId } });
    if (parent?.parentId) {
      await checkParentAutoComplete(parent.parentId);
    }
  }
}

export async function deleteTask(id: string) {
  const user = await getRequiredUser();
  // Cascade will handle children deletion
  await prisma.task.delete({ where: { id, userId: user.id } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function moveTask(
  id: string,
  targetGroupId: string,
  targetParentId: string | null,
  targetPosition: number
) {
  const user = await getRequiredUser();

  // Calculate new level
  let level = 0;
  if (targetParentId) {
    const parent = await prisma.task.findFirst({ where: { id: targetParentId } });
    if (parent) level = parent.level + 1;
  }

  await prisma.task.update({
    where: { id, userId: user.id },
    data: {
      groupId: targetGroupId,
      parentId: targetParentId,
      position: targetPosition,
      level,
    },
  });

  // Update children levels recursively
  await updateChildrenLevels(id, level + 1);

  revalidatePath("/tasks");
}

async function updateChildrenLevels(parentId: string, level: number) {
  const children = await prisma.task.findMany({ where: { parentId } });
  for (const child of children) {
    await prisma.task.update({
      where: { id: child.id },
      data: { level },
    });
    await updateChildrenLevels(child.id, level + 1);
  }
}

export async function indentTask(id: string) {
  const user = await getRequiredUser();
  const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!task) throw new Error("Task not found");

  // Find the previous sibling (same parentId, position < current, order by position desc)
  const prevSibling = await prisma.task.findFirst({
    where: {
      groupId: task.groupId,
      parentId: task.parentId,
      position: { lt: task.position },
      archivedAt: null,
    },
    orderBy: { position: "desc" },
  });

  if (!prevSibling) return; // Can't indent if no previous sibling

  // Make this task a child of the previous sibling
  const maxPos = await prisma.task.aggregate({
    where: { parentId: prevSibling.id },
    _max: { position: true },
  });

  await prisma.task.update({
    where: { id },
    data: {
      parentId: prevSibling.id,
      level: prevSibling.level + 1,
      position: (maxPos._max.position ?? 0) + 1,
    },
  });

  await updateChildrenLevels(id, prevSibling.level + 2);
  revalidatePath("/tasks");
}

export async function outdentTask(id: string) {
  const user = await getRequiredUser();
  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
    include: { parent: true },
  });
  if (!task || !task.parent) return; // Can't outdent root tasks

  const grandparentId = task.parent.parentId;

  // Move to after parent in grandparent's children
  const maxPos = await prisma.task.aggregate({
    where: {
      groupId: task.groupId,
      parentId: grandparentId,
    },
    _max: { position: true },
  });

  await prisma.task.update({
    where: { id },
    data: {
      parentId: grandparentId,
      level: Math.max(task.level - 1, 0),
      position: (maxPos._max.position ?? 0) + 1,
    },
  });

  await updateChildrenLevels(id, Math.max(task.level, 1));
  revalidatePath("/tasks");
}

export async function toggleCollapse(id: string) {
  const user = await getRequiredUser();
  const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!task) return;

  await prisma.task.update({
    where: { id },
    data: { isCollapsed: !task.isCollapsed },
  });
  revalidatePath("/tasks");
}

export async function duplicateTaskWithChildren(id: string) {
  const user = await getRequiredUser();
  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
    include: { tags: true },
  });
  if (!task) throw new Error("Task not found");

  const newTask = await prisma.task.create({
    data: {
      userId: user.id,
      groupId: task.groupId,
      parentId: task.parentId,
      goalId: task.goalId,
      title: `${task.title} (copia)`,
      description: task.description,
      priority: task.priority,
      status: "PENDING",
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      level: task.level,
      position: task.position + 1,
      tags: {
        create: task.tags.map((t) => ({ name: t.name, color: t.color })),
      },
    },
  });

  // Recursively duplicate children
  await duplicateChildren(id, newTask.id, user.id);

  revalidatePath("/tasks");
  return newTask;
}

async function duplicateChildren(sourceParentId: string, newParentId: string, userId: string) {
  const children = await prisma.task.findMany({
    where: { parentId: sourceParentId },
    include: { tags: true },
    orderBy: { position: "asc" },
  });

  for (const child of children) {
    const newChild = await prisma.task.create({
      data: {
        userId,
        groupId: child.groupId,
        parentId: newParentId,
        goalId: child.goalId,
        title: child.title,
        description: child.description,
        priority: child.priority,
        status: "PENDING",
        dueDate: child.dueDate,
        dueTime: child.dueTime,
        level: child.level,
        position: child.position,
        tags: {
          create: child.tags.map((t) => ({ name: t.name, color: t.color })),
        },
      },
    });
    await duplicateChildren(child.id, newChild.id, userId);
  }
}

export async function archiveTask(id: string) {
  const user = await getRequiredUser();
  await prisma.task.update({
    where: { id, userId: user.id },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/tasks");
}

// ==========================================
// TREE BUILDER
// ==========================================

interface FlatTask {
  id: string;
  userId: string;
  groupId: string;
  parentId: string | null;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: Date | null;
  dueTime: string | null;
  isFavorite: boolean;
  position: number;
  level: number;
  isCollapsed: boolean;
  completedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ id: string; name: string; color: string | null; taskId: string }>;
  goal: { id: string; name: string } | null;
}

function buildTaskTree(flatTasks: FlatTask[]): TaskNode[] {
  const taskMap = new Map<string, TaskNode>();
  const roots: TaskNode[] = [];

  // Create nodes
  for (const task of flatTasks) {
    taskMap.set(task.id, {
      ...task,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
      progress: 0,
    });
  }

  // Build tree
  for (const task of flatTasks) {
    const node = taskMap.get(task.id)!;
    if (task.parentId && taskMap.has(task.parentId)) {
      taskMap.get(task.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Compute progress bottom-up
  function computeProgress(node: TaskNode): void {
    for (const child of node.children) {
      computeProgress(child);
    }
    if (node.children.length > 0) {
      node.childrenCount = countAllDescendants(node);
      node.completedChildrenCount = countCompletedDescendants(node);
      node.progress = node.childrenCount > 0
        ? (node.completedChildrenCount / node.childrenCount) * 100
        : 0;
    }
  }

  for (const root of roots) {
    computeProgress(root);
  }

  return roots;
}

function countAllDescendants(node: TaskNode): number {
  let count = node.children.length;
  for (const child of node.children) {
    count += countAllDescendants(child);
  }
  return count;
}

function countCompletedDescendants(node: TaskNode): number {
  let count = node.children.filter((c) => c.status === "COMPLETED").length;
  for (const child of node.children) {
    count += countCompletedDescendants(child);
  }
  return count;
}
