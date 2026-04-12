"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, Edit, Archive, FolderOpen, Target, CheckCircle2, ListTodo } from "lucide-react";
import { deleteTaskGroup, archiveTaskGroup } from "@/actions/tasks";
import { toast } from "sonner";
import type { TaskGroupWithTasks } from "@/types";

interface TaskGroupCardProps {
  group: TaskGroupWithTasks;
  onOpen: (groupId: string) => void;
  onEdit: (group: TaskGroupWithTasks) => void;
}

export function TaskGroupCard({ group, onOpen, onEdit }: TaskGroupCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteTaskGroup(group.id);
      toast.success("Grupo eliminado");
    } catch (err) {
      console.error("TaskGroupCard.handleDelete:", err);
      toast.error("Error al eliminar grupo");
    }
    setDeleteOpen(false);
  }

  async function handleArchive() {
    try {
      await archiveTaskGroup(group.id);
      toast.success("Grupo archivado");
    } catch (err) {
      console.error("TaskGroupCard.handleArchive:", err);
      toast.error("Error al archivar");
    }
  }

  const pendingTasks = group.totalTasks - group.completedTasks;

  return (
    <>
      <Card
        className="group relative overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        onClick={() => onOpen(group.id)}
      >
        {/* Color accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: group.color ?? "#6366f1" }}
        />

        <CardContent className="p-5 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${group.color ?? "#6366f1"}15` }}
              >
                <FolderOpen className="h-5 w-5" style={{ color: group.color ?? "#6366f1" }} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[15px] truncate">{group.name}</h3>
                {group.goal ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Target className="h-3 w-3 shrink-0" />
                    <span className="truncate">{group.goal.name}</span>
                  </div>
                ) : group.description ? (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{group.description}</p>
                ) : null}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(group)}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" /> Archivar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ListTodo className="h-3 w-3" />
              <span>{group.totalTasks} tareas</span>
            </div>
            {group.completedTasks > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>{group.completedTasks} listas</span>
              </div>
            )}
            {pendingTasks > 0 && (
              <span>{pendingTasks} pendientes</span>
            )}
          </div>

          {/* Progress */}
          {group.totalTasks > 0 ? (
            <div className="space-y-2">
              <Progress value={group.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-semibold">{Math.round(group.progress)}%</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Tocá para agregar tareas</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &quot;{group.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todas las tareas y subtareas dentro de este grupo. Esta acción no se puede deshacer.
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
