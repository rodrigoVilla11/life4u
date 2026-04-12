"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createTransaction, updateTransaction } from "@/actions/finance";
import { CURRENCIES, PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface Category { id: string; name: string; type: string; icon: string | null; }
interface Account { id: string; name: string; type: string; }

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  accounts: Account[];
  editTransaction?: {
    id: string; type: string; amount: number; currency: string; date: string;
    description: string | null; notes: string | null; categoryId: string | null;
    accountId: string | null; toAccountId: string | null; paymentMethod: string | null;
    isFixed: boolean; receiptUrl?: string | null;
  } | null;
}

const TYPE_CONFIG = {
  INCOME: { icon: ArrowDownLeft, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", ring: "ring-emerald-500" },
  EXPENSE: { icon: ArrowUpRight, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", ring: "ring-red-500" },
  TRANSFER: { icon: ArrowLeftRight, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", ring: "ring-blue-500" },
};

export function TransactionForm({ open, onOpenChange, categories, accounts, editTransaction }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setCurrency(editTransaction.currency);
      setDate(new Date(editTransaction.date).toISOString().split("T")[0]);
      setDescription(editTransaction.description ?? "");
      setNotes(editTransaction.notes ?? "");
      setCategoryId(editTransaction.categoryId ?? "");
      setAccountId(editTransaction.accountId ?? "");
      setToAccountId(editTransaction.toAccountId ?? "");
      setPaymentMethod(editTransaction.paymentMethod ?? "");
      setIsFixed(editTransaction.isFixed);
      setReceiptUrl(editTransaction.receiptUrl ?? "");
    } else {
      setType("EXPENSE"); setAmount(""); setCurrency("USD");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription(""); setNotes(""); setCategoryId("");
      setAccountId(""); setToAccountId(""); setPaymentMethod("");
      setIsFixed(false); setReceiptUrl("");
    }
  }, [editTransaction, open]);

  const filteredCategories = categories.filter((c) => c.type === type);
  const cfg = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.EXPENSE;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || cloudName === "tu-cloud-name") {
      toast.error("Configurá NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en .env");
      return;
    }

    if (!uploadPreset) {
      toast.error("Configurá NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset!);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setReceiptUrl(data.secure_url);
      toast.success("Comprobante subido");
    } catch (err) {
      console.error("TransactionForm.handleUpload:", err);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { toast.error("Ingresá un monto válido"); return; }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        type, amount: Number(amount), currency, date, description: description || undefined,
        notes: notes || undefined, categoryId: categoryId || undefined,
        accountId: accountId || undefined, toAccountId: toAccountId || undefined,
        paymentMethod: paymentMethod || undefined, isFixed,
        receiptUrl: receiptUrl || undefined, tags: [],
      };

      if (editTransaction) {
        await updateTransaction(editTransaction.id, payload);
        toast.success("Movimiento actualizado");
      } else {
        await createTransaction(payload);
        toast.success("Movimiento creado");
      }
      onOpenChange(false);
    } catch (err) {
      console.error("TransactionForm.handleSubmit:", err);
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg">{editTransaction ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
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

          {/* ===== AMOUNT + CURRENCY ===== */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="tx-amount" className="text-xs text-muted-foreground uppercase tracking-wide">Monto</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xl font-bold h-14 text-center"
                autoFocus
              />
            </div>
            <div className="w-24 space-y-1.5">
              <Label htmlFor="tx-currency" className="text-xs text-muted-foreground uppercase tracking-wide">Moneda</Label>
              <NativeSelect id="tx-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-14">
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* ===== DATE + DESCRIPTION ===== */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="tx-date" className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</Label>
              <Input id="tx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="col-span-3 space-y-1.5">
              <Label htmlFor="tx-description" className="text-xs text-muted-foreground uppercase tracking-wide">Descripción</Label>
              <Input id="tx-description" placeholder="Ej: Supermercado, Uber..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {/* ===== CATEGORY + ACCOUNT ===== */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-category" className="text-xs text-muted-foreground uppercase tracking-wide">Categoría</Label>
              <NativeSelect id="tx-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sin categoría</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon ?? ""} {cat.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-account" className="text-xs text-muted-foreground uppercase tracking-wide">Cuenta</Label>
              <NativeSelect id="tx-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Sin cuenta</option>
                {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* ===== TO ACCOUNT (transfers only) ===== */}
          {type === "TRANSFER" && (
            <div className="space-y-1.5">
              <Label htmlFor="tx-to-account" className="text-xs text-muted-foreground uppercase tracking-wide">Cuenta destino</Label>
              <NativeSelect id="tx-to-account" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
                <option value="">Seleccionar cuenta</option>
                {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </NativeSelect>
            </div>
          )}

          {/* ===== PAYMENT METHOD + FIXED ===== */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="tx-payment" className="text-xs text-muted-foreground uppercase tracking-wide">Método de pago</Label>
              <NativeSelect id="tx-payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">Sin especificar</option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </NativeSelect>
            </div>
            <div className="flex items-center gap-2 pb-2.5">
              <Switch checked={isFixed} onCheckedChange={setIsFixed} aria-label="Gasto fijo" />
              <Label className="text-sm">Fijo</Label>
            </div>
          </div>

          {/* ===== RECEIPT IMAGE ===== */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Comprobante</Label>
            {receiptUrl ? (
              <div className="relative rounded-xl overflow-hidden border bg-muted/30">
                <Image src={receiptUrl} alt="Comprobante" width={400} height={192} className="w-full max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setReceiptUrl("")}
                  aria-label="Quitar comprobante"
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/30 transition-all"
              >
                {uploading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Subiendo...</>
                ) : (
                  <><ImagePlus className="h-5 w-5" /> Subir comprobante</>
                )}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>

          {/* ===== NOTES ===== */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-notes" className="text-xs text-muted-foreground uppercase tracking-wide">Notas</Label>
            <Textarea id="tx-notes" placeholder="Notas adicionales..." rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editTransaction ? "Actualizar" : "Crear Movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
