import { getSession } from "@/lib/auth";
import DemoGate from "@/components/DemoGate";
import Analyze from "@/components/Analyze";

export default async function AnalyzePage() {
  const session = await getSession();
  if (!session) return <DemoGate />;
  return (
    <Analyze
      sessionUserId={session.user?.id ?? null}
      sessionUserEmail={session.user?.email ?? null}
    />
  );
}