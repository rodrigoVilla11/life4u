"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyReport } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FinanceChartProps {
  data: MonthlyReport[];
}

export function FinanceChart({ data }: FinanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No hay datos disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value: number) =>
                  `${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                  })}`,
                  name === "income" ? "Ingresos" : "Gastos",
                ]}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Bar
                dataKey="income"
                name="income"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expense"
                name="expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
