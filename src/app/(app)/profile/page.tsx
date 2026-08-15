import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/app/api/_db/profile";
import Profile from "@/components/Profile";
import DemoProfileGate from "@/components/DemoProfileGate";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) return <DemoProfileGate />;

  const profile = await getUserProfile(session.user.id);
  if (!profile) return <DemoProfileGate />;

  return <Profile profile={profile} />;
}
