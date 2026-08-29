import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Auth from "@/components/Auth";

export default async function Page() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect("/analyze");
  }

  return <Auth />;
}