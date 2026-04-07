"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { createRecurringTransaction } from "@/actions/finance";
import { CURRENCIES, PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS, FREQUENCY_LABELS } from "@/lib/constants";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2 } from "lucide-react";

interface Category { id: string; name: string; type: string; icon: string | null; }
interface Account { id: string; name: string; }

interface RecurringFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  accounts: Account[];
}

const TYPE_CONFIG = {
  INCOME: { icon: ArrowDownLeft, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  EXPENSE: { icon: ArrowUpRight, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  TRANSFER: { icon: ArrowLeftRight, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
};

export function RecurringForm({ open, onOpenChange, categories, accounts }: RecurringFormProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("EXPENSE");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [interval, setInterval] = useState("1");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Ingresá un nombre"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Ingresá un monto válido"); return; }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(), type, amount: Number(amount), currency,
        frequency, interval: Number(interval), startDate,
        endDate: endDate || undefined, categoryId: categoryId || undefined,
        accountId: accountId || undefined, paymentMethod: paymentMethod || undefined,
      };
      await createRecurringTransaction(payload);
      toast.success("Recurrente creado");
      onOpenChange(false);
      // Reset
      setName(""); setAmount(""); setType("EXPENSE"); setFrequency("MONTHLY");
      setInterval("1"); setCategoryId(""); setAccountId(""); setPaymentMethod("");
    } catch {
      toast.error("Error al crear recurrente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg">Nuevo Recurrente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 pt-4 space-y-5">
          {/* ===== TYPE SELECTOR ===== */}
          <div className="grid grid-cols-3 gap-2">
            {(["INCOME", "EXPENSE", "TRANSFER"] as const).map((t) => {
              const c = TYPE_CONFIG[t];
              const Icon = c.icon;
              const selected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    selected ? `${c.bg} border-current ${c.color}` : "border-transparent hover:bg-accent"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${selected ? c.color : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${selected ? c.color : "text-muted-foreground"}`}>
                    {TRANSACTION_TYPE_LABELS[t]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ===== NAME ===== */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nombre</Label>
            <Input placeholder="Ej: Alquiler, Netflix, Sueldo..." value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>

          {/* ===== AMOUNT + CURRENCY ===== */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Monto</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-xl font-bold h-14 text-center" />
            </div>
            <div className="w-24 space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Moneda</Label>
              <NativeSelect value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-14">
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* ===== FREQUENCY + INTERVAL ===== */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Frecuencia</Label>
              <NativeSelect value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                {Object.entries(FREQUENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Cada</Label>
              <Input type="number" min="1" value={interval} onChange={(e) => setInterval(e.target.value)} />
            </div>
          </div>

          {/* ===== DATES ===== */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Fecha inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Fecha fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="Opcional" />
            </div>
          </div>

          {/* ===== CATEGORY + ACCOUNT ===== */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Categoría</Label>
              <NativeSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sin categoría</option>
                {filteredCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon ?? ""} {cat.name}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Cuenta</Label>
              <NativeSelect value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Sin cuenta</option>
                {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* ===== PAYMENT METHOD ===== */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Método de pago</Label>
            <NativeSelect value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">Sin especificar</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </NativeSelect>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Recurrente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
