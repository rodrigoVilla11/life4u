"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { createAccount, updateAccount } from "@/actions/finance";
import { CURRENCIES, ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Loader2, Wallet, Landmark, CreditCard, PiggyBank, TrendingUp, Bitcoin, CircleDollarSign } from "lucide-react";

const PRESET_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
];

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: CircleDollarSign, BANK: Landmark, VIRTUAL_WALLET: Wallet,
  SAVINGS: PiggyBank, INVESTMENT: TrendingUp, CREDIT_CARD: CreditCard,
  CRYPTO: Bitcoin, OTHER: Wallet,
};

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAccount?: {
    id: string; name: string; type: string; currency: string;
    initialBalance: number; color: string | null;
  } | null;
}

export function AccountForm({ open, onOpenChange, editAccount }: AccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("BANK");
  const [currency, setCurrency] = useState("USD");
  const [initialBalance, setInitialBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setCurrency(editAccount.currency);
      setInitialBalance(String(editAccount.initialBalance));
      setColor(editAccount.color ?? PRESET_COLORS[0]);
    } else {
      setName(""); setType("BANK"); setCurrency("USD");
      setInitialBalance(""); setNotes(""); setColor(PRESET_COLORS[0]);
    }
  }, [editAccount, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Ingresá un nombre"); return; }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(), type, currency, color,
        initialBalance: Number(initialBalance) || 0,
        notes: notes.trim() || undefined,
      };

      if (editAccount) {
        await updateAccount(editAccount.id, payload);
        toast.success("Cuenta actualizada");
      } else {
        await createAccount(payload);
        toast.success("Cuenta creada");
      }
      onOpenChange(false);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const TypeIcon = TYPE_ICONS[type] ?? Wallet;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg">{editAccount ? "Editar Cuenta" : "Nueva Cuenta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 pt-4 space-y-5">
          {/* Preview */}
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-accent/20">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <TypeIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{name || "Nombre de cuenta"}</p>
              <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[type]} · {currency}</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Banco Nación, Mercado Pago..." autoFocus />
          </div>

          {/* Type + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</Label>
              <NativeSelect value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Moneda</Label>
              <NativeSelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* Initial Balance */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Saldo inicial</Label>
            <Input type="number" step="0.01" placeholder="0.00" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="text-lg font-semibold h-12 text-center" />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="CBU, alias, número de cuenta, titular, datos útiles..."
              rows={3}
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editAccount ? "Actualizar" : "Crear Cuenta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
