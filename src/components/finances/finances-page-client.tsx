"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Repeat,
  Trash2, Search, Filter, X, TrendingUp, TrendingDown, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
// DropdownMenu no longer needed in transaction rows - detail sheet handles actions
import { TransactionForm } from "@/components/finances/transaction-form";
import { TransactionDetailSheet } from "@/components/finances/transaction-detail-sheet";
import { RecurringForm } from "@/components/finances/recurring-form";
import { toggleRecurring, deleteRecurring, deleteTransaction } from "@/actions/finance";
import { TRANSACTION_TYPE_LABELS, FREQUENCY_LABELS, getCurrencySymbol, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import type { AccountWithBalance } from "@/types";

interface Category {
  id: string; name: string; type: string; icon: string | null; color: string | null;
  children: Category[]; _count: { transactions: number };
}

interface Transaction {
  id: string; type: string; amount: number; currency: string; date: string;
  description: string | null; notes: string | null; paymentMethod: string | null;
  isFixed: boolean; categoryId: string | null; accountId: string | null; toAccountId: string | null;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
  account: { id: string; name: string; type: string } | null;
  toAccount: { id: string; name: string; type: string } | null;
  goal: { id: string; name: string } | null;
  tags: Array<{ id: string; name: string }>;
}

interface RecurringTx {
  id: string; name: string; type: string; amount: number; currency: string;
  frequency: string; interval: number; startDate: string; endDate: string | null;
  nextDueDate: string; isActive: boolean;
}

interface FinancesPageClientProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: AccountWithBalance[];
  recurring: RecurringTx[];
}

export function FinancesPageClient({ transactions, categories, accounts, recurring }: FinancesPageClientProps) {
  const [tab, setTab] = useState("transactions");
  const [showTxForm, setShowTxForm] = useState(false);
  const [showRecForm, setShowRecForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [deleteRecId, setDeleteRecId] = useState<string | null>(null);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [fType, setFType] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fAccount, setFAccount] = useState("");
  const [fSearch, setFSearch] = useState("");

  const hasFilters = !!(fType || fCategory || fAccount || fSearch);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (fType && t.type !== fType) return false;
      if (fCategory && t.categoryId !== fCategory) return false;
      if (fAccount && t.accountId !== fAccount) return false;
      if (fSearch) {
        const s = fSearch.toLowerCase();
        if (!t.description?.toLowerCase().includes(s) && !t.category?.name.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [transactions, fType, fCategory, fAccount, fSearch]);

  // Summary stats
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Group transactions by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const key = format(new Date(tx.date), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function clearFilters() { setFType(""); setFCategory(""); setFAccount(""); setFSearch(""); }

  async function handleDeleteTx() {
    if (!deleteTxId) return;
    try { await deleteTransaction(deleteTxId); toast.success("Movimiento eliminado"); }
    catch (err) { console.error("FinancesPageClient.handleDeleteTx:", err); toast.error("Error al eliminar movimiento"); }
    setDeleteTxId(null);
  }

  async function handleDeleteRec() {
    if (!deleteRecId) return;
    try { await deleteRecurring(deleteRecId); toast.success("Recurrente eliminado"); }
    catch (err) { console.error("FinancesPageClient.handleDeleteRec:", err); toast.error("Error al eliminar recurrencia"); }
    setDeleteRecId(null);
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finanzas</h1>
        <p className="text-muted-foreground text-[15px] mt-1">Tus movimientos e ingresos</p>
      </div>

      {/* ===== SUMMARY CARDS + ACTION ===== */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
              +${totalIncome.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ingresos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
              -${totalExpense.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Gastos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className={`text-lg sm:text-xl font-bold ${balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {balance >= 0 ? "+" : ""}${balance.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Balance</p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => tab === "recurring" ? setShowRecForm(true) : setShowTxForm(true)} className="gap-2 w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        {tab === "recurring" ? "Nuevo Recurrente" : "Nuevo Movimiento"}
      </Button>

      {/* ===== TABS ===== */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transactions">Movimientos</TabsTrigger>
          <TabsTrigger value="recurring">Recurrentes</TabsTrigger>
        </TabsList>

        {/* ===== TRANSACTIONS TAB ===== */}
        <TabsContent value="transactions" className="space-y-3 mt-4">
          {/* Search + filter toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={fSearch}
                onChange={(e) => setFSearch(e.target.value)}
                placeholder="Buscar movimientos..."
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Collapsible filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <NativeSelect value={fType} onChange={(e) => setFType(e.target.value)} className="w-auto min-w-[140px]">
                <option value="">Todos los tipos</option>
                {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </NativeSelect>
              <NativeSelect value={fCategory} onChange={(e) => setFCategory(e.target.value)} className="w-auto min-w-[160px]">
                <option value="">Todas las categorías</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon ?? ""} {c.name}</option>)}
              </NativeSelect>
              <NativeSelect value={fAccount} onChange={(e) => setFAccount(e.target.value)} className="w-auto min-w-[140px]">
                <option value="">Todas las cuentas</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </NativeSelect>
            </div>
          )}

          {/* Active filter badges */}
          {hasFilters && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {fType && <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFType("")}>{TRANSACTION_TYPE_LABELS[fType]} <X className="h-3 w-3" /></Badge>}
              {fCategory && <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFCategory("")}>{categories.find((c) => c.id === fCategory)?.name} <X className="h-3 w-3" /></Badge>}
              {fAccount && <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFAccount("")}>{accounts.find((a) => a.id === fAccount)?.name} <X className="h-3 w-3" /></Badge>}
              <span className="text-xs text-muted-foreground">{filtered.length} resultados</span>
            </div>
          )}

          {/* Transaction list grouped by date */}
          {grouped.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <ArrowLeftRight className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">No hay movimientos</p>
                <p className="text-sm text-muted-foreground mb-4">Registrá tu primer ingreso o gasto</p>
                <Button onClick={() => setShowTxForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Nuevo Movimiento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {grouped.map(([dateKey, txs]) => (
                <div key={dateKey}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    {format(new Date(dateKey), "EEEE, d MMMM", { locale: es })}
                  </p>
                  <Card>
                    <CardContent className="p-0 divide-y divide-border/50">
                      {txs.map((tx) => {
                        const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.EXPENSE;
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={tx.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 active:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => { setDetailTx(tx); setDetailOpen(true); }}
                          >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                              {tx.category?.icon
                                ? <span className="text-base">{tx.category.icon}</span>
                                : <Icon className={`h-4.5 w-4.5 ${cfg.color}`} />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {tx.description || tx.category?.name || "Sin descripción"}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {tx.category && tx.description && (
                                  <span className="text-[11px] text-muted-foreground">{tx.category.name}</span>
                                )}
                                {tx.account && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {tx.type === "TRANSFER" && tx.toAccount
                                      ? `${tx.account.name} → ${tx.toAccount.name}`
                                      : tx.account.name}
                                  </span>
                                )}
                                {tx.paymentMethod && (
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-3.5 hidden sm:inline-flex">
                                    {PAYMENT_METHOD_LABELS[tx.paymentMethod] ?? tx.paymentMethod}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className={`text-sm font-semibold tabular-nums shrink-0 ${cfg.color}`}>
                              {cfg.sign}{getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== RECURRING TAB ===== */}
        <TabsContent value="recurring" className="mt-4">
          {recurring.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Repeat className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">Sin recurrentes</p>
                <p className="text-sm text-muted-foreground mb-4">Configurá tus gastos e ingresos fijos</p>
                <Button onClick={() => setShowRecForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Nuevo Recurrente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border/50">
                {recurring.map((rec) => {
                  const cfg = TX_CONFIG[rec.type] ?? TX_CONFIG.EXPENSE;
                  return (
                    <div key={rec.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/30 transition-colors">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Repeat className={`h-4.5 w-4.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{rec.name}</p>
                          {!rec.isActive && <Badge variant="secondary" className="text-[10px]">Pausado</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {FREQUENCY_LABELS[rec.frequency] ?? rec.frequency}
                          {rec.interval > 1 ? ` (cada ${rec.interval})` : ""}
                          {" · Próx: "}
                          {format(new Date(rec.nextDueDate), "d MMM", { locale: es })}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums shrink-0 ${cfg.color}`}>
                        {cfg.sign}{getCurrencySymbol(rec.currency)}{rec.amount.toLocaleString()}
                      </span>
                      <Switch
                        checked={rec.isActive}
                        onCheckedChange={(v) => { toggleRecurring(rec.id, v); toast.success(v ? "Activado" : "Pausado"); }}
                      />
                      <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors" onClick={() => setDeleteRecId(rec.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TransactionForm open={showTxForm} onOpenChange={(o) => { setShowTxForm(o); if (!o) setEditTx(null); }} categories={categories} accounts={accounts} editTransaction={editTx} />
      <RecurringForm open={showRecForm} onOpenChange={setShowRecForm} categories={categories} accounts={accounts} />
      <TransactionDetailSheet
        transaction={detailTx}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(tx) => { setDetailOpen(false); setEditTx(tx); setShowTxForm(true); }}
      />

      <AlertDialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTx} className="bg-destructive text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteRecId} onOpenChange={() => setDeleteRecId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Eliminar recurrente</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRec} className="bg-destructive text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const TX_CONFIG: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; sign: string }> = {
  INCOME: { icon: ArrowDownLeft, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/20", sign: "+" },
  EXPENSE: { icon: ArrowUpRight, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20", sign: "-" },
  TRANSFER: { icon: ArrowLeftRight, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20", sign: "" },
};
