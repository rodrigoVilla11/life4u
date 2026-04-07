"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      title: "Tareas Pendientes Hoy",
      value: todayPending.toString(),
      icon: ClipboardList,
      accent: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      borderAccent: "border-amber-200 dark:border-amber-800/50",
    },
    {
      title: "Tareas Vencidas",
      value: overdue.toString(),
      icon: AlertTriangle,
      accent: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40",
      borderAccent: "border-red-200 dark:border-red-800/50",
    },
    {
      title: "Balance del Mes",
      value: formatCurrency(monthBalance),
      icon: TrendingUp,
      accent:
        monthBalance >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      bg:
        monthBalance >= 0
          ? "bg-emerald-50 dark:bg-emerald-950/40"
          : "bg-red-50 dark:bg-red-950/40",
      borderAccent:
        monthBalance >= 0
          ? "border-emerald-200 dark:border-emerald-800/50"
          : "border-red-200 dark:border-red-800/50",
    },
    {
      title: "Ahorro Acumulado",
      value: `${symbol}${totalSavings.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: PiggyBank,
      accent: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      borderAccent: "border-blue-200 dark:border-blue-800/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={`${card.borderAccent} py-4`}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.accent}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.accent}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
