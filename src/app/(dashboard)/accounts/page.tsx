import { getAccounts } from "@/actions/finance";
import { AccountsPageClient } from "@/components/accounts/accounts-page-client";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <AccountsPageClient
      accounts={JSON.parse(JSON.stringify(accounts))}
    />
  );
}
