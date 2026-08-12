import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/app/api/_db/profile";
import Auth from "@/components/Auth";
import Profile from "@/components/Profile";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) return <Auth />;

  const profile = await getUserProfile(session.user.id);
  if (!profile) return <Auth />;

  return <Profile profile={profile} />;
}
