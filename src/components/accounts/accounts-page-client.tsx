"use client";

import { useState } from "react";
import {
  Plus, Wallet, Building2, CreditCard, TrendingUp, TrendingDown,
  Landmark, PiggyBank, Bitcoin, CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountForm } from "./account-form";
import { AccountDetailSheet } from "./account-detail-sheet";
import { ACCOUNT_TYPE_LABELS, getCurrencySymbol } from "@/lib/constants";
import type { AccountWithBalance } from "@/types";

const ACCOUNT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: CircleDollarSign,
  BANK: Landmark,
  VIRTUAL_WALLET: Wallet,
  SAVINGS: PiggyBank,
  INVESTMENT: TrendingUp,
  CREDIT_CARD: CreditCard,
  CRYPTO: Bitcoin,
  OTHER: Wallet,
};

interface AccountsPageClientProps {
  accounts: AccountWithBalance[];
}

export function AccountsPageClient({ accounts }: AccountsPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountWithBalance | null>(null);
  const [detailAccount, setDetailAccount] = useState<AccountWithBalance | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const totalIncome = accounts.reduce((s, a) => s + a.totalIncome, 0);
  const totalExpense = accounts.reduce((s, a) => s + a.totalExpense, 0);

  function handleOpenDetail(account: AccountWithBalance) {
    setDetailAccount(account);
    setDetailOpen(true);
  }

  function handleEdit(account: AccountWithBalance) {
    setDetailOpen(false);
    setEditAccount(account);
    setFormOpen(true);
  }

  function handleCloseForm(open: boolean) {
    setFormOpen(open);
    if (!open) setEditAccount(null);
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cuentas</h1>
        <p className="text-muted-foreground text-[15px] mt-1">Tus cuentas, bolsillos y fondos</p>
      </div>

      {/* Summary cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold">${totalBalance.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Balance total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">+${totalIncome.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Ingresos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">-${totalExpense.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Gastos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New account button */}
      <Button onClick={() => { setEditAccount(null); setFormOpen(true); }} className="gap-2 w-full sm:w-auto">
        <Plus className="h-4 w-4" /> Nueva Cuenta
      </Button>

      {/* Account cards */}
      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No hay cuentas"
          description="Creá tu primera cuenta para empezar a gestionar tus finanzas"
          actionLabel="Crear Cuenta"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const Icon = ACCOUNT_ICONS[account.type] ?? Wallet;
            const symbol = getCurrencySymbol(account.currency);

            return (
              <Card
                key={account.id}
                className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
                onClick={() => handleOpenDetail(account)}
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: account.color ?? "#6366f1" }} />
                <CardContent className="p-5 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${account.color ?? "#6366f1"}15` }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[15px] truncate">{account.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{ACCOUNT_TYPE_LABELS[account.type] ?? account.type}</Badge>
                        <span className="text-[10px] text-muted-foreground">{account.currency}</span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-2xl font-bold tracking-tight mb-3 ${account.currentBalance < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                    {symbol}{account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>

                  <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      {symbol}{account.totalIncome.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      {symbol}{account.totalExpense.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccountForm open={formOpen} onOpenChange={handleCloseForm} editAccount={editAccount} />
      <AccountDetailSheet
        account={detailAccount}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
      />
    </div>
  );
}
