"use client";

import { useState, useTransition } from "react";
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
import { getCurrencySymbol, CURRENCIES } from "@/lib/constants";
import { NativeSelect } from "@/components/ui/native-select";
import { upsertDailyEntry } from "@/actions/goals";
import { toast } from "sonner";
import type { DailyRow, DailyEntry, ExchangeRateMap } from "@/lib/savings/types";
import { convertToGoalCurrency } from "@/lib/savings/currency";
import { Check, X, Pencil, Loader2, Trash2 } from "lucide-react";

interface GoalDailyTableProps {
  goalId: string;
  currency: string;
  dailyTable: DailyRow[];
  dailyEntries: DailyEntry[];
  rates: ExchangeRateMap;
}

function fmt(n: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  return `${sym}${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isSameDay(a: Date | string, b: Date): boolean {
  const d = typeof a === "string" ? new Date(a) : a;
  return d.getFullYear() === b.getFullYear() && d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
}

export function GoalDailyTable({ goalId, currency, dailyTable, dailyEntries, rates }: GoalDailyTableProps) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState(currency);
  const [editNote, setEditNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sym = getCurrencySymbol(currency);

  // Calculate totals only from visible rows (today and past)
  const visibleRows = dailyTable.filter((r) => {
    const d = typeof r.date === "string" ? new Date(r.date) : r.date;
    d.setHours(0, 0, 0, 0);
    return d <= today;
  });
  const totalReal = visibleRows
    .filter((r) => r.entryType === "real" && r.convertedAmount > 0)
    .reduce((sum, r) => sum + r.convertedAmount, 0);
  const totalProjected = dailyTable
    .filter((r) => r.entryType === "projected")
    .reduce((sum, r) => sum + r.convertedAmount, 0);

  function handleEdit(row: DailyRow) {
    const dateStr = (typeof row.date === "string" ? new Date(row.date) : row.date)
      .toISOString()
      .split("T")[0];
    setEditingDate(dateStr);
    setEditAmount(row.entryType === "real" ? String(row.amount) : "");
    // Find the original entry to get its currency
    const entry = dailyEntries.find((e) => {
      const ed = typeof e.date === "string" ? new Date(e.date) : e.date;
      return ed.toISOString().split("T")[0] === dateStr;
    });
    setEditCurrency(entry?.currency ?? currency);
    setEditNote(row.note ?? "");
  }

  function handleCancel() {
    setEditingDate(null);
    setEditAmount("");
    setEditNote("");
  }

  function handleSave() {
    if (!editingDate) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount)) {
      toast.error("Ingresa un monto valido");
      return;
    }

    startTransition(async () => {
      try {
        await upsertDailyEntry(goalId, {
          date: editingDate,
          amount,
          currency: editCurrency,
          note: editNote || undefined,
        });
        toast.success("Entrada guardada");
        handleCancel();
      } catch (err) {
        console.error("GoalDailyTable.handleSave:", err);
        toast.error("Error al guardar la entrada");
      }
    });
  }

  function handleClear(dateStr: string) {
    startTransition(async () => {
      try {
        await upsertDailyEntry(goalId, { date: dateStr, amount: 0, currency, note: undefined });
        toast.success("Entrada borrada");
      } catch (err) {
        console.error("GoalDailyTable.handleClear:", err);
        toast.error("Error al borrar");
      }
    });
  }

  // Show only today and past, newest first
  const sortedRows = [...dailyTable]
    .filter((r) => {
      const d = typeof r.date === "string" ? new Date(r.date) : r.date;
      return d <= today || isSameDay(d, today);
    })
    .reverse();

  return (
    <div className="space-y-4">
      {/* Quick add for today */}
      <QuickDailyInput goalId={goalId} currency={currency} />

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Convertido ({sym})</TableHead>
              <TableHead className="text-right">Acumulado</TableHead>
              <TableHead className="text-right">Diff vs Base</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, idx) => {
              const rowDate = typeof row.date === "string" ? new Date(row.date) : row.date;
              const dateStr = rowDate.toISOString().split("T")[0];
              const isToday = isSameDay(rowDate, today);
              const isEditingThis = editingDate === dateStr;

              return (
                <TableRow
                  key={dateStr}
                  className={isToday ? "bg-blue-50/50 dark:bg-blue-950/20" : undefined}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      {fmtDate(row.date)}
                      {isToday && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                          HOY
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.entryType === "real"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0"
                      }
                    >
                      {row.entryType === "real" ? "Real" : "Proyectado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1 justify-end">
                        <Input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-20 h-7 text-right text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") handleCancel();
                          }}
                        />
                        <NativeSelect
                          value={editCurrency}
                          onChange={(e) => setEditCurrency(e.target.value)}
                          className="w-16 h-7 text-xs px-1"
                        >
                          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </NativeSelect>
                      </div>
                    ) : (
                      <span>
                        {fmt(row.amount, row.entryType === "real" ? (dailyEntries.find((e) => {
                          const ed = typeof e.date === "string" ? new Date(e.date) : e.date;
                          return ed.toISOString().split("T")[0] === (typeof row.date === "string" ? new Date(row.date) : row.date).toISOString().split("T")[0];
                        })?.currency ?? currency) : currency)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {fmt(row.convertedAmount, currency)}
                    {row.entryType === "real" && (() => {
                      const entry = dailyEntries.find((e) => {
                        const ed = typeof e.date === "string" ? new Date(e.date) : e.date;
                        return ed.toISOString().split("T")[0] === (typeof row.date === "string" ? new Date(row.date) : row.date).toISOString().split("T")[0];
                      });
                      return entry && entry.currency !== currency ? (
                        <span className="block text-[10px] text-muted-foreground">({entry.currency}→{currency})</span>
                      ) : null;
                    })()}
                  </TableCell>
                  <TableCell className="text-right font-medium">{fmt(row.accumulated, currency)}</TableCell>
                  <TableCell className={`text-right font-medium ${row.differenceVsBase >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {row.differenceVsBase >= 0 ? "+" : ""}{fmt(row.differenceVsBase, currency)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[120px] truncate">
                    {isEditingThis ? (
                      <Input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="w-24 h-7 text-xs"
                        placeholder="Nota..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave();
                          if (e.key === "Escape") handleCancel();
                        }}
                      />
                    ) : (
                      row.note ?? ""
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditingThis ? (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={isPending} aria-label="Guardar">
                          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-green-600" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel} aria-label="Cancelar">
                          <X className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(row)} aria-label="Editar entrada">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        {row.entryType === "real" && row.amount > 0 && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleClear(dateStr)} disabled={isPending} aria-label="Eliminar entrada">
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay entradas diarias todavia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {sortedRows.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">Totales</TableCell>
                <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                  Real: {fmt(totalReal, currency)}
                </TableCell>
                <TableCell className="text-right font-semibold text-muted-foreground">
                  Proy: {fmt(totalProjected, currency)}
                </TableCell>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}

function QuickDailyInput({ goalId, currency }: { goalId: string; currency: string }) {
  const [amount, setAmount] = useState("");
  const [entryCurrency, setEntryCurrency] = useState(currency);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().split("T")[0];

  function handleSave() {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    startTransition(async () => {
      try {
        await upsertDailyEntry(goalId, {
          date: today,
          amount: num,
          currency: entryCurrency,
          note: note || undefined,
        });
        toast.success("Ahorro de hoy guardado");
        setAmount("");
        setNote("");
      } catch (err) {
        console.error("TodaySavingInline.handleSave:", err);
        toast.error("Error al guardar");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border bg-muted/30">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Ahorro de hoy</label>
        <div className="flex gap-1.5">
          <Input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-28"
          />
          <NativeSelect value={entryCurrency} onChange={(e) => setEntryCurrency(e.target.value)} className="w-20 text-sm">
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
          </NativeSelect>
        </div>
      </div>
      <div className="flex-1 min-w-[120px] space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Nota</label>
        <Input
          placeholder="Opcional..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      </div>
      <Button onClick={handleSave} disabled={isPending} className="shrink-0">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
      </Button>
    </div>
  );
}
