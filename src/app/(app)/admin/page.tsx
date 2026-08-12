import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import Admin from "@/components/Admin";
import Restriction from "@/components/Restriction";
import Auth from "@/components/Auth";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) return <Auth />
  if (!isAdminEmail(session.user?.email)) return <Restriction />
  return <Admin />;
}