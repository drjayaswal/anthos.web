import { getSession } from "@/lib/auth";
import { getUserSettings } from "@/app/api/_db/settings";
import Auth from "@/components/Auth";
import Settings from "@/components/Settings";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) return <Auth />;

  const settings = await getUserSettings(session.user.id);
  if (!settings) return <Auth />;

  return <Settings settings={settings} />;
}
