"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Wallet, Landmark, CreditCard, PiggyBank, TrendingUp, TrendingDown,
  Bitcoin, CircleDollarSign, Edit, Trash2, Archive, Save, StickyNote,
} from "lucide-react";
import { deleteAccount, updateAccount } from "@/actions/finance";
import { ACCOUNT_TYPE_LABELS, getCurrencySymbol } from "@/lib/constants";
import { toast } from "sonner";
import type { AccountWithBalance } from "@/types";

const ACCOUNT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: CircleDollarSign, BANK: Landmark, VIRTUAL_WALLET: Wallet,
  SAVINGS: PiggyBank, INVESTMENT: TrendingUp, CREDIT_CARD: CreditCard,
  CRYPTO: Bitcoin, OTHER: Wallet,
};

interface AccountDetailSheetProps {
  account: AccountWithBalance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (account: AccountWithBalance) => void;
}

export function AccountDetailSheet({ account, open, onOpenChange, onEdit }: AccountDetailSheetProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesChanged, setNotesChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync notes when account changes
  if (account && notes === "" && !notesChanged) {
    // We don't have notes in AccountWithBalance, so start empty
    // The user can add notes and save them
  }

  if (!account) return null;

  const Icon = ACCOUNT_ICONS[account.type] ?? Wallet;
  const symbol = getCurrencySymbol(account.currency);
  const netFlow = account.totalIncome - account.totalExpense;

  async function handleDelete() {
    try {
      await deleteAccount(account!.id);
      toast.success("Cuenta eliminada");
      setDeleteOpen(false);
      onOpenChange(false);
    } catch {
      toast.error("Error al eliminar");
    }
  }

  async function handleArchive() {
    try {
      await updateAccount(account!.id, { isActive: false });
      toast.success("Cuenta archivada");
      onOpenChange(false);
    } catch {
      toast.error("Error al archivar");
    }
  }

  async function handleSaveNotes() {
    setSaving(true);
    try {
      await updateAccount(account!.id, { notes });
      toast.success("Notas guardadas");
      setNotesChanged(false);
    } catch {
      toast.error("Error al guardar notas");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setNotes(""); setNotesChanged(false); } }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          <div className="p-5 sm:p-6 space-y-6">
            {/* Header */}
            <div className="text-center pt-2">
              <div
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-4"
                style={{ backgroundColor: `${account.color ?? "#6366f1"}15` }}
              >
                <Icon className="h-8 w-8" />
              </div>
              <SheetHeader className="mb-0">
                <SheetTitle className="text-xl">{account.name}</SheetTitle>
              </SheetHeader>
              <Badge variant="secondary" className="mt-2">{ACCOUNT_TYPE_LABELS[account.type] ?? account.type}</Badge>
              <span className="text-xs text-muted-foreground ml-2">{account.currency}</span>
            </div>

            {/* Balance hero */}
            <div className="text-center py-4 bg-accent/30 rounded-2xl">
              <p className="text-xs text-muted-foreground mb-1">Saldo Actual</p>
              <p className={`text-4xl font-bold tracking-tight ${account.currentBalance < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                {symbol}{account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Saldo inicial: {symbol}{account.initialBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  +{symbol}{account.totalIncome.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">Ingresos</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <TrendingDown className="h-4 w-4 mx-auto mb-1 text-red-600 dark:text-red-400" />
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  -{symbol}{account.totalExpense.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">Gastos</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <Wallet className="h-4 w-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <p className={`text-sm font-semibold ${netFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {netFlow >= 0 ? "+" : ""}{symbol}{netFlow.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">Neto</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                  <StickyNote className="h-3.5 w-3.5" /> Notas
                </Label>
                {notesChanged && (
                  <Button size="xs" onClick={handleSaveNotes} disabled={saving} className="gap-1">
                    <Save className="h-3 w-3" /> {saving ? "..." : "Guardar"}
                  </Button>
                )}
              </div>
              <Textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesChanged(true); }}
                placeholder="Anotá datos importantes: CBU, alias, número de cuenta, titular, sucursal..."
                rows={4}
                className="text-sm"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => onEdit(account)}>
                <Edit className="h-4 w-4" /> Editar cuenta
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleArchive}>
                <Archive className="h-4 w-4" /> Archivar cuenta
              </Button>
              <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Eliminar cuenta
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar &quot;{account.name}&quot;</AlertDialogTitle>
            <AlertDialogDescription>Se eliminarán todos los movimientos asociados. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
