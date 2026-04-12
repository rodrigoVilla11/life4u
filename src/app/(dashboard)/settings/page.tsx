import type { Metadata } from "next";
import { getUserSettings } from "@/actions/dashboard";
import { getCategories } from "@/actions/finance";
import { getExchangeRates } from "@/actions/goals";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const [settings, incomeCategories, expenseCategories, exchangeRates] = await Promise.all([
    getUserSettings(),
    getCategories("INCOME"),
    getCategories("EXPENSE"),
    getExchangeRates(),
  ]);

  return (
    <SettingsPageClient
      settings={settings}
      incomeCategories={incomeCategories}
      expenseCategories={expenseCategories}
      exchangeRates={JSON.parse(JSON.stringify(exchangeRates))}
    />
  );
}
