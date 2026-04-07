"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, Wallet, Tag,
  CreditCard, FileText, Pin, Trash2, Edit, Image as ImageIcon, ExternalLink,
} from "lucide-react";
import { deleteTransaction } from "@/actions/finance";
import { getCurrencySymbol, PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface Transaction {
  id: string; type: string; amount: number; currency: string; date: string;
  description: string | null; notes: string | null; paymentMethod: string | null;
  isFixed: boolean; categoryId: string | null; accountId: string | null; toAccountId: string | null;
  receiptUrl?: string | null;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
  account: { id: string; name: string; type: string } | null;
  toAccount: { id: string; name: string; type: string } | null;
  goal: { id: string; name: string } | null;
  tags: Array<{ id: string; name: string }>;
}

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (tx: Transaction) => void;
}

const TYPE_CONFIG: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; label: string; sign: string }> = {
  INCOME: { icon: ArrowDownLeft, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Ingreso", sign: "+" },
  EXPENSE: { icon: ArrowUpRight, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", label: "Gasto", sign: "-" },
  TRANSFER: { icon: ArrowLeftRight, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Transferencia", sign: "" },
};

export function TransactionDetailSheet({ transaction: tx, open, onOpenChange, onEdit }: TransactionDetailSheetProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!tx) return null;

  const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.EXPENSE;
  const Icon = cfg.icon;
  const symbol = getCurrencySymbol(tx.currency);

  async function handleDelete() {
    try {
      await deleteTransaction(tx!.id);
      toast.success("Movimiento eliminado");
      setDeleteOpen(false);
      onOpenChange(false);
    } catch {
      toast.error("Error al eliminar");
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          <div className="p-5 sm:p-6 space-y-6">
            {/* Header with amount */}
            <div className="text-center pt-2">
              <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl ${cfg.bg} mb-4`}>
                {tx.category?.icon
                  ? <span className="text-2xl">{tx.category.icon}</span>
                  : <Icon className={`h-7 w-7 ${cfg.color}`} />
                }
              </div>
              <p className={`text-3xl font-bold tracking-tight ${cfg.color}`}>
                {cfg.sign}{symbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {tx.description || tx.category?.name || "Sin descripción"}
              </p>
              <Badge variant="secondary" className="mt-2">
                {TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type}
              </Badge>
            </div>

            {/* Details list */}
            <div className="space-y-0.5">
              <DetailRow icon={Calendar} label="Fecha" value={format(new Date(tx.date), "EEEE d 'de' MMMM, yyyy", { locale: es })} />

              {tx.category && (
                <DetailRow icon={Tag} label="Categoría" value={`${tx.category.icon ?? ""} ${tx.category.name}`} />
              )}

              {tx.account && (
                <DetailRow
                  icon={Wallet}
                  label={tx.type === "TRANSFER" ? "Desde" : "Cuenta"}
                  value={tx.account.name}
                />
              )}

              {tx.type === "TRANSFER" && tx.toAccount && (
                <DetailRow icon={Wallet} label="Hacia" value={tx.toAccount.name} />
              )}

              {tx.paymentMethod && (
                <DetailRow icon={CreditCard} label="Método de pago" value={PAYMENT_METHOD_LABELS[tx.paymentMethod] ?? tx.paymentMethod} />
              )}

              <DetailRow icon={Pin} label="Tipo" value={tx.isFixed ? "Gasto fijo" : "Variable"} />

              {tx.goal && (
                <DetailRow icon={Tag} label="Meta vinculada" value={tx.goal.name} />
              )}

              {tx.tags.length > 0 && (
                <div className="flex items-start gap-3 py-3 px-1">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Etiquetas</p>
                    <div className="flex flex-wrap gap-1">
                      {tx.tags.map((t) => <Badge key={t.id} variant="secondary" className="text-xs">{t.name}</Badge>)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {tx.notes && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Notas</span>
                </div>
                <p className="text-sm leading-relaxed bg-muted/50 rounded-xl p-3">{tx.notes}</p>
              </div>
            )}

            {/* Receipt image */}
            {tx.receiptUrl && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Comprobante</span>
                </div>
                <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative rounded-xl overflow-hidden border hover:opacity-90 transition-opacity">
                    <img src={tx.receiptUrl} alt="Comprobante" className="w-full max-h-60 object-cover" />
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Ver original
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => { onOpenChange(false); onEdit(tx); }}
              >
                <Edit className="h-4 w-4" /> Editar
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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

function DetailRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-border/40 last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
