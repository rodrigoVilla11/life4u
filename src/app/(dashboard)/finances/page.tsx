import { getTransactions, getCategories, getAccounts, getRecurringTransactions } from "@/actions/finance";
import { FinancesPageClient } from "@/components/finances/finances-page-client";

export default async function FinancesPage() {
  const [transactions, categories, accounts, recurring] = await Promise.all([
    getTransactions(),
    getCategories(),
    getAccounts(),
    getRecurringTransactions(),
  ]);

  return (
    <FinancesPageClient
      transactions={JSON.parse(JSON.stringify(transactions))}
      categories={JSON.parse(JSON.stringify(categories))}
      accounts={JSON.parse(JSON.stringify(accounts))}
      recurring={JSON.parse(JSON.stringify(recurring))}
    />
  );
}
