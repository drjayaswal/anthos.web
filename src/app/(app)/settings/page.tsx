import { getSession } from "@/lib/auth";
import { getUserSettings } from "@/app/api/_db/settings";
import Settings from "@/components/Settings";
import DemoSettingsGate from "@/components/DemoSettingsGate";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) return <DemoSettingsGate />;

  const settings = await getUserSettings(session.user.id);
  if (!settings) return <DemoSettingsGate />;

  return <Settings settings={settings} />;
}
