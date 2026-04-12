"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { deleteTransaction } from "@/actions/finance";
import { getCurrencySymbol, PAYMENT_METHOD_LABELS } from "@/lib/constants";

interface TransactionCardProps {
  transaction: {
    id: string;
    type: string;
    amount: number;
    currency: string;
    date: string;
    description: string | null;
    notes: string | null;
    paymentMethod: string | null;
    isFixed: boolean;
    categoryId: string | null;
    accountId: string | null;
    toAccountId: string | null;
    category: { id: string; name: string; icon: string | null; color: string | null } | null;
    account: { id: string; name: string; type: string } | null;
    toAccount: { id: string; name: string; type: string } | null;
    goal: { id: string; name: string } | null;
    tags: Array<{ id: string; name: string }>;
  };
  onEdit: (transaction: TransactionCardProps["transaction"]) => void;
}

export function TransactionCard({ transaction, onEdit }: TransactionCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeConfig = {
    INCOME: {
      icon: ArrowUpRight,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      sign: "+",
    },
    EXPENSE: {
      icon: ArrowDownRight,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
      sign: "-",
    },
    TRANSFER: {
      icon: ArrowLeftRight,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      sign: "",
    },
  }[transaction.type] ?? {
    icon: ArrowDownRight,
    color: "text-muted-foreground",
    bg: "bg-muted",
    sign: "",
  };

  const Icon = typeConfig.icon;
  const symbol = getCurrencySymbol(transaction.currency);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      toast.success("Movimiento eliminado");
      setShowDelete(false);
    } catch (err) {
      console.error("TransactionCard.handleDelete:", err);
      toast.error("Error al eliminar el movimiento");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors rounded-lg group">
        {/* Icon / emoji */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${typeConfig.bg}`}
        >
          {transaction.category?.icon ? (
            <span className="text-lg">{transaction.category.icon}</span>
          ) : (
            <Icon className={`w-5 h-5 ${typeConfig.color}`} />
          )}
        </div>

        {/* Description & category */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {transaction.description || transaction.category?.name || "Sin descripcion"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {transaction.category && (
              <span className="text-xs text-muted-foreground">
                {transaction.category.name}
              </span>
            )}
            {transaction.account && (
              <span className="text-xs text-muted-foreground">
                {transaction.type === "TRANSFER" && transaction.toAccount
                  ? `${transaction.account.name} → ${transaction.toAccount.name}`
                  : transaction.account.name}
              </span>
            )}
          </div>
        </div>

        {/* Amount & date */}
        <div className="text-right shrink-0">
          <p className={`text-sm font-semibold ${typeConfig.color}`}>
            {typeConfig.sign}
            {symbol}
            {transaction.amount.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(transaction.date), "dd MMM yyyy", { locale: es })}
          </p>
        </div>

        {/* Payment method badge */}
        {transaction.paymentMethod && (
          <Badge variant="secondary" className="hidden sm:inline-flex shrink-0 text-[10px]">
            {PAYMENT_METHOD_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}
          </Badge>
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente este movimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDelete(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
