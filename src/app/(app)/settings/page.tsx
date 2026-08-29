import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserSettings } from "@/app/api/_db/settings";
import Settings from "@/components/Settings";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/");
  }

  const settings = await getUserSettings(session.user.id);
  if (!settings) {
    redirect("/");
  }

  return <Settings settings={settings} />;
}
