import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Analyze from "@/components/Analyze";

export default async function AnalyzePage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/");
  }
  return (
    <Analyze
      sessionUserId={session.user.id}
      sessionUserEmail={session.user.email ?? null}
    />
  );
}