import { getUserSettings } from "@/actions/dashboard";
import { getCategories } from "@/actions/finance";
import { getExchangeRates } from "@/actions/goals";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

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
