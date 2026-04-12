"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, AlertTriangle, TrendingUp, PiggyBank } from "lucide-react";
import { getCurrencySymbol } from "@/lib/constants";

interface StatsCardsProps {
  todayPending: number;
  overdue: number;
  monthBalance: number;
  totalSavings: number;
  currency?: string;
}

export function StatsCards({
  todayPending,
  overdue,
  monthBalance,
  totalSavings,
  currency = "EUR",
}: StatsCardsProps) {
  const symbol = getCurrencySymbol(currency);

  const formatCurrency = (amount: number) => {
    const prefix = amount >= 0 ? "+" : "";
    return `${prefix}${symbol}${Math.abs(amount).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const cards = [
    {
      title: "Pendientes Hoy",
      value: todayPending.toString(),
      icon: ClipboardList,
      color: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      title: "Tareas Vencidas",
      value: overdue.toString(),
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-500/10",
    },
    {
      title: "Balance del Mes",
      value: formatCurrency(monthBalance),
      icon: TrendingUp,
      color: monthBalance >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
      iconBg: monthBalance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
    },
    {
      title: "Ahorro Acumulado",
      value: `${symbol}${totalSavings.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: PiggyBank,
      color: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <Card key={card.title} className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                {card.title}
              </p>
              <div className={`rounded-lg p-1.5 ${card.iconBg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold tracking-tight ${card.color} animate-count-up`}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
