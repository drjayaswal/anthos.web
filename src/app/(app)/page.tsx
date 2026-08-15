import { getSession } from "@/lib/auth";
import Home from "@/components/Home";
import DemoGate from "@/components/DemoGate";

export default async function HomePage() {
  const session = await getSession();
  if (!session) return <DemoGate />;
  return (
    <Home
      sessionUserId={session.user?.id ?? null}
    />
  );
}