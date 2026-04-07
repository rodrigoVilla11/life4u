"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Repeat, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrencySymbol } from "@/lib/constants";

interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  nextDueDate: Date | string;
  type: string;
}

interface UpcomingRecurringProps {
  items: RecurringItem[];
}

export function UpcomingRecurring({ items }: UpcomingRecurringProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Proximos Recurrentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No hay transacciones recurrentes programadas
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                    {item.type === "INCOME" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.nextDueDate), "d MMM", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${
                    item.type === "INCOME"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {item.type === "INCOME" ? "+" : "-"}
                  {getCurrencySymbol(item.currency)}
                  {item.amount.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
