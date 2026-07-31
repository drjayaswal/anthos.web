import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import Home from "@/components/Home";
import Auth from "@/components/Auth";

export default async function HomePage() {
  const session = await getSession();
  if (!session) return <Auth />;
  const email = session.user?.email ?? null;
  const isAdmin = isAdminEmail(email);
  return (
    <Home
      sessionUserEmail={email}
      sessionUserId={session.user?.id ?? null}
    />
  );
}