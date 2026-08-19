import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import AppNavbar from "@/components/AppNavbar";

export default async function AppNavbarShell() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  return (
    <AppNavbar
      authenticated={Boolean(session?.user?.id)}
      isAdmin={isAdminEmail(session?.user?.email)}
    />
  );
}
