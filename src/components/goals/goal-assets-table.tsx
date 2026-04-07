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
import { createGoalAsset, updateGoalAsset, deleteGoalAsset } from "@/actions/goals";
import { toast } from "sonner";
import type { GoalAsset, ExchangeRateMap } from "@/lib/savings/types";
import { Plus, Pencil, Trash2, Loader2, ArrowRight } from "lucide-react";

interface GoalAssetsTableProps {
  goalId: string;
  currency: string;
  assets: GoalAsset[];
  rates: ExchangeRateMap;
}

const ASSET_TYPES: Record<string, string> = {
  CASH: "Efectivo",
  BANK_ACCOUNT: "Cuenta Bancaria",
  INVESTMENT: "Inversion",
  CRYPTO: "Crypto",
  RECEIVABLE: "Cuenta por Cobrar",
  PROPERTY: "Propiedad",
  OTHER: "Otro",
};

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  AVAILABLE: { label: "Disponible", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0" },
  PENDING: { label: "Pendiente", class: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0" },
  LOCKED: { label: "Bloqueado", class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0" },
  SOLD: { label: "Vendido", class: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0" },
};

function fmt(n: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  return `${sym}${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface AssetFormData {
  description: string;
  type: string;
  currency: string;
  amount: number;
  status: string;
  note: string;
}

export function GoalAssetsTable({ goalId, currency, assets, rates }: GoalAssetsTableProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<GoalAsset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalAvailable = assets
    .filter((a) => a.status === "AVAILABLE")
    .reduce((sum, a) => sum + convertToGoalCurrency(a.amount, a.currency, currency, rates), 0);
  const totalPending = assets
    .filter((a) => a.status === "PENDING")
    .reduce((sum, a) => sum + convertToGoalCurrency(a.amount, a.currency, currency, rates), 0);

  function handleEdit(asset: GoalAsset) {
    setEditingAsset(asset);
    setFormOpen(true);
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteGoalAsset(deleteId);
        toast.success("Activo eliminado");
        setDeleteId(null);
      } catch {
        toast.error("Error al eliminar el activo");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Activos</h3>
        <Button size="sm" onClick={() => { setEditingAsset(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Agregar Activo
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripcion</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} goalCurrency={currency} rates={rates} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
            ))}
            {assets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay activos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {assets.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">Totales</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    Disp: {fmt(totalAvailable, currency)}
                  </span>
                  {" / "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Pend: {fmt(totalPending, currency)}
                  </span>
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Asset form dialog */}
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        goalId={goalId}
        defaultCurrency={currency}
        asset={editingAsset}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar activo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara el activo permanentemente.
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

function AssetRow({ asset, goalCurrency, rates, onEdit, onDelete }: {
  asset: GoalAsset; goalCurrency: string; rates: ExchangeRateMap;
  onEdit: (asset: GoalAsset) => void; onDelete: (id: string) => void;
}) {
  const needsConversion = asset.currency !== goalCurrency;
  const convertedAmount = needsConversion
    ? convertToGoalCurrency(asset.amount, asset.currency, goalCurrency, rates)
    : asset.amount;
  const [status, setStatus] = useState<string>(asset.status);
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setUpdating(true);
    try {
      await updateGoalAsset(asset.id, { status: newStatus });
      toast.success("Estado actualizado");
    } catch {
      setStatus(asset.status); // revert
      toast.error("Error al actualizar");
    } finally {
      setUpdating(false);
    }
  }

  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.AVAILABLE;

  return (
    <TableRow className={updating ? "opacity-60" : ""}>
      <TableCell className="font-medium">{asset.description}</TableCell>
      <TableCell className="text-muted-foreground">{ASSET_TYPES[asset.type] ?? asset.type}</TableCell>
      <TableCell>{asset.currency}</TableCell>
      <TableCell className="text-right">
        <span className="font-medium">{fmt(asset.amount, asset.currency)}</span>
        {needsConversion && (
          <span className="block text-[11px] text-muted-foreground">
            ≈ {fmt(convertedAmount, goalCurrency)}
          </span>
        )}
      </TableCell>
      <TableCell>
        <NativeSelect
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`h-8 text-xs font-medium px-2 py-0 w-auto min-w-[110px] rounded-lg border-0 ${statusInfo.class}`}
        >
          {Object.entries(STATUS_MAP).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </NativeSelect>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs max-w-[120px] truncate">
        {asset.note ?? ""}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(asset)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onDelete(asset.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function AssetFormDialog({
  open,
  onOpenChange,
  goalId,
  defaultCurrency,
  asset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  goalId: string;
  defaultCurrency: string;
  asset: GoalAsset | null;
}) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!asset;

  const { register, handleSubmit, reset } = useForm<AssetFormData>({
    defaultValues: {
      description: asset?.description ?? "",
      type: asset?.type ?? "OTHER",
      currency: asset?.currency ?? defaultCurrency,
      amount: asset?.amount ?? 0,
      status: asset?.status ?? "AVAILABLE",
      note: asset?.note ?? "",
    },
  });

  const onSubmit = (data: AssetFormData) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          amount: Number(data.amount),
          note: data.note || undefined,
        };
        if (isEditing && asset) {
          await updateGoalAsset(asset.id, payload);
          toast.success("Activo actualizado");
        } else {
          await createGoalAsset(goalId, payload);
          toast.success("Activo creado");
        }
        reset();
        onOpenChange(false);
      } catch {
        toast.error("Error al guardar el activo");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Activo" : "Nuevo Activo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Descripcion *</Label>
            <Input placeholder="Ej: Plazo fijo en banco" {...register("description", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <NativeSelect {...register("type")}>
                {Object.entries(ASSET_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <NativeSelect {...register("status")}>
                {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NativeSelect>
            </div>
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
