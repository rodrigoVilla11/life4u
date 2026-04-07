"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { CURRENCIES } from "@/lib/constants";
import { createGoal, updateGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { GoalParameters } from "@/lib/savings/types";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: GoalParameters | null;
}

interface FormData {
  name: string;
  description: string;
  currency: string;
  targetMin: number;
  targetIdeal: number;
  dailySavingsBase: number;
  startDate: string;
  deadline: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  color: string;
}

function toDateStr(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().split("T")[0];
}

export function GoalForm({ open, onOpenChange, goal }: GoalFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!goal;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      name: goal?.name ?? "",
      description: goal?.description ?? "",
      currency: goal?.currency ?? "USD",
      targetMin: goal?.targetMin ?? 0,
      targetIdeal: goal?.targetIdeal ?? 0,
      dailySavingsBase: goal?.dailySavingsBase ?? 0,
      startDate: goal ? toDateStr(goal.startDate) : new Date().toISOString().split("T")[0],
      deadline: goal ? toDateStr(goal.deadline) : "",
      priority: goal?.priority ?? "MEDIUM",
      category: goal?.category ?? "",
      color: goal?.color ?? "#3b82f6",
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const payload: Record<string, unknown> = {
          ...data,
          targetMin: Number(data.targetMin),
          targetIdeal: Number(data.targetIdeal),
          dailySavingsBase: Number(data.dailySavingsBase),
          deadline: data.deadline || undefined,
          description: data.description || undefined,
          category: data.category || undefined,
          color: data.color || undefined,
        };

        if (isEditing && goal) {
          await updateGoal(goal.id, payload);
          toast.success("Objetivo actualizado");
        } else {
          await createGoal(payload);
          toast.success("Objetivo creado");
        }
        reset();
        onOpenChange(false);
      } catch {
        toast.error(isEditing ? "Error al actualizar el objetivo" : "Error al crear el objetivo");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Objetivo" : "Nuevo Objetivo de Ahorro"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-name">Nombre *</Label>
            <Input
              id="goal-name"
              placeholder="Ej: Viaje a Europa"
              {...register("name", { required: "El nombre es requerido" })}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-desc">Descripcion</Label>
            <Input
              id="goal-desc"
              placeholder="Descripcion opcional"
              {...register("description")}
            />
          </div>

          {/* Currency + Targets row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-currency">Moneda</Label>
              <NativeSelect id="goal-currency" {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-tmin">Meta Minima *</Label>
              <Input
                id="goal-tmin"
                type="number"
                step="0.01"
                {...register("targetMin", { required: true, min: 0.01 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-tideal">Meta Ideal *</Label>
              <Input
                id="goal-tideal"
                type="number"
                step="0.01"
                {...register("targetIdeal", { required: true, min: 0.01 })}
              />
            </div>
          </div>

          {/* Daily base */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-daily">Ahorro Diario Base</Label>
            <Input
              id="goal-daily"
              type="number"
              step="0.01"
              placeholder="0"
              {...register("dailySavingsBase")}
            />
            <p className="text-xs text-muted-foreground">
              Monto base diario esperado para proyecciones
            </p>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-start">Fecha Inicio *</Label>
              <Input
                id="goal-start"
                type="date"
                {...register("startDate", { required: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-deadline">Fecha Limite</Label>
              <Input
                id="goal-deadline"
                type="date"
                {...register("deadline")}
              />
            </div>
          </div>

          {/* Priority + Category + Color */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-priority">Prioridad</Label>
              <NativeSelect id="goal-priority" {...register("priority")}>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-cat">Categoria</Label>
              <Input
                id="goal-cat"
                placeholder="Ej: Viaje"
                {...register("category")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-color">Color</Label>
              <Input
                id="goal-color"
                type="color"
                className="h-9 p-1 cursor-pointer"
                {...register("color")}
              />
            </div>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Objetivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
