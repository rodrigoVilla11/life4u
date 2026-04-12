"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { getCurrencySymbol, CURRENCIES } from "@/lib/constants";
import { convertToGoalCurrency } from "@/lib/savings/currency";
import { createGoalMovement, updateGoalMovement, deleteGoalMovement } from "@/actions/goals";
import { toast } from "sonner";
import type { GoalMovement, ExchangeRateMap } from "@/lib/savings/types";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface GoalMovementsTableProps {
  goalId: string;
  currency: string;
  movements: GoalMovement[];
  rates: ExchangeRateMap;
}

const MOVEMENT_TYPES: Record<string, { label: string; class: string }> = {
  EXPENSE: { label: "Gasto", class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0" },
  LOAN_GIVEN: { label: "Prestamo Dado", class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0" },
  LOAN_RECEIVED: { label: "Prestamo Recibido", class: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0" },
  ADJUSTMENT: { label: "Ajuste", class: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0" },
  BONUS: { label: "Bono", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0" },
};

function fmt(n: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  return `${sym}${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface MovementFormData {
  date: string;
  description: string;
  type: string;
  currency: string;
  amount: number;
  note: string;
}

export function GoalMovementsTable({ goalId, currency, movements, rates }: GoalMovementsTableProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<GoalMovement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalExpenses = movements
    .filter((m) => m.type === "EXPENSE" || m.type === "LOAN_GIVEN")
    .reduce((sum, m) => sum + convertToGoalCurrency(m.amount, m.currency, currency, rates), 0);
  const totalBonuses = movements
    .filter((m) => m.type === "BONUS" || m.type === "LOAN_RECEIVED" || m.type === "ADJUSTMENT")
    .reduce((sum, m) => sum + convertToGoalCurrency(m.amount, m.currency, currency, rates), 0);

  function handleEdit(movement: GoalMovement) {
    setEditingMovement(movement);
    setFormOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteGoalMovement(deleteId);
        toast.success("Movimiento eliminado");
        setDeleteId(null);
      } catch (err) {
        console.error("GoalMovementsTable.handleDelete:", err);
        toast.error("Error al eliminar el movimiento");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Movimientos</h3>
        <Button size="sm" onClick={() => { setEditingMovement(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Agregar Movimiento
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => {
              const typeInfo = MOVEMENT_TYPES[movement.type] ?? MOVEMENT_TYPES.ADJUSTMENT;
              const isNegative = movement.type === "EXPENSE" || movement.type === "LOAN_GIVEN";
              return (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{fmtDate(movement.date)}</TableCell>
                  <TableCell>{movement.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeInfo.class}>{typeInfo.label}</Badge>
                  </TableCell>
                  <TableCell>{movement.currency}</TableCell>
                  <TableCell className={`text-right ${isNegative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    <span className="font-medium">{isNegative ? "-" : "+"}{fmt(movement.amount, movement.currency)}</span>
                    {movement.currency !== currency && (
                      <span className="block text-[11px] text-muted-foreground">
                        ≈ {fmt(convertToGoalCurrency(movement.amount, movement.currency, currency, rates), currency)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[120px] truncate">
                    {movement.note ?? ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(movement)} aria-label="Editar movimiento">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteId(movement.id)} aria-label="Eliminar movimiento">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay movimientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {movements.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold">Totales</TableCell>
                <TableCell className="text-right">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-red-600 dark:text-red-400">
                      Gastos: -{fmt(totalExpenses, currency)}
                    </div>
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      Bonos: +{fmt(totalBonuses, currency)}
                    </div>
                  </div>
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Movement form dialog */}
      <MovementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        goalId={goalId}
        defaultCurrency={currency}
        movement={editingMovement}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara el movimiento permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MovementFormDialog({
  open,
  onOpenChange,
  goalId,
  defaultCurrency,
  movement,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  goalId: string;
  defaultCurrency: string;
  movement: GoalMovement | null;
}) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!movement;

  function toDateStr(d: Date | string | null | undefined): string {
    if (!d) return new Date().toISOString().split("T")[0];
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toISOString().split("T")[0];
  }

  const { register, handleSubmit, reset } = useForm<MovementFormData>({
    defaultValues: {
      date: movement ? toDateStr(movement.date) : new Date().toISOString().split("T")[0],
      description: movement?.description ?? "",
      type: movement?.type ?? "EXPENSE",
      currency: movement?.currency ?? defaultCurrency,
      amount: movement?.amount ?? 0,
      note: movement?.note ?? "",
    },
  });

  const onSubmit = (data: MovementFormData) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          amount: Number(data.amount),
          note: data.note || undefined,
        };
        if (isEditing && movement) {
          await updateGoalMovement(movement.id, payload);
          toast.success("Movimiento actualizado");
        } else {
          await createGoalMovement(goalId, payload);
          toast.success("Movimiento creado");
        }
        reset();
        onOpenChange(false);
      } catch (err) {
        console.error("GoalMovementsTable.onSubmit:", err);
        toast.error("Error al guardar el movimiento");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" {...register("date", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <NativeSelect {...register("type")}>
                {Object.entries(MOVEMENT_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripcion *</Label>
            <Input placeholder="Ej: Compra de equipaje" {...register("description", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Moneda</Label>
              <NativeSelect {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label>Monto *</Label>
              <Input type="number" step="0.01" {...register("amount", { required: true, min: 0.01 })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Nota</Label>
            <Input placeholder="Nota opcional" {...register("note")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
