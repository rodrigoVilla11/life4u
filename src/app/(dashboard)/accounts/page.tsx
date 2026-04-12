import type { Metadata } from "next";
import { getAccounts } from "@/actions/finance";
import { AccountsPageClient } from "@/components/accounts/accounts-page-client";

export const metadata: Metadata = { title: "Cuentas" };

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <AccountsPageClient
      accounts={JSON.parse(JSON.stringify(accounts))}
    />
  );
}
