import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/api/_db/profile";
import Profile from "@/components/Profile";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/");
  }

  const profile = await getUserProfile(session.user.id);
  if (!profile) {
    redirect("/");
  }

  return <Profile profile={profile} />;
}
