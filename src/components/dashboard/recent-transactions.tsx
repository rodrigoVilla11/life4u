"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrencySymbol } from "@/lib/constants";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  date: Date | string;
  category: { name: string; icon: string | null } | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case "EXPENSE":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAmountColor = (type: string) => {
    return type === "INCOME"
      ? "text-emerald-600 dark:text-emerald-400"
      : type === "EXPENSE"
        ? "text-red-600 dark:text-red-400"
        : "text-blue-600 dark:text-blue-400";
  };

  const formatAmount = (amount: number, currency: string, type: string) => {
    const symbol = getCurrencySymbol(currency);
    const prefix = type === "INCOME" ? "+" : type === "EXPENSE" ? "-" : "";
    return `${prefix}${symbol}${amount.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">
            No hay transacciones recientes
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-muted">
                    {transaction.category?.icon ? (
                      <span className="text-base">
                        {transaction.category.icon}
                      </span>
                    ) : (
                      getTypeIcon(transaction.type)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {transaction.description ??
                        transaction.category?.name ??
                        "Sin descripcion"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), "d MMM yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${getAmountColor(
                    transaction.type
                  )}`}
                >
                  {formatAmount(
                    transaction.amount,
                    transaction.currency,
                    transaction.type
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
