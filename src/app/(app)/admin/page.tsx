import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-auth";
import Admin from "@/components/Admin";
import Restriction from "@/components/Restriction";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/connect");
  }
  if (!isAdminEmail(session.user.email)) return <Restriction />;
  return <Admin />;
}