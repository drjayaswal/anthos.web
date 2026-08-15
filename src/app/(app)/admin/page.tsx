import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import Admin from "@/components/Admin";
import Restriction from "@/components/Restriction";
import DemoAdminGate from "@/components/DemoAdminGate";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) return <DemoAdminGate />;
  if (!isAdminEmail(session.user?.email)) return <Restriction />;
  return <Admin />;
}