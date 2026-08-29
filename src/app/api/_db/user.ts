import type { AppSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { db } from "@/app/db";
import { encryptedMail, user } from "@/app/db/schema";

export type OAuthAccountInput = {
  providerAccountId: string;
  provider: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  scope?: string | null;
  id_token?: string | null;
};

async function upsertOAuthUserRow(opts: {
  userId: string;
  email: string;
  createdAt: Date;
}): Promise<void> {
  const { userId, email, createdAt } = opts;
  await db.transaction(async (tx) => {
    const [existingByEmail] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingByEmail && existingByEmail.id !== userId) {
      const oldId = existingByEmail.id;
      const holdEmail = `__migrating__${oldId}@internal.invalid`;
      await tx
        .update(user)
        .set({ email: holdEmail })
        .where(eq(user.id, oldId));

      await tx
        .insert(user)
        .values({
          id: userId,
          email,
          name: email.split("@")[0],
          createdAt,
          updatedAt: createdAt,
        })
        .onConflictDoUpdate({
          target: user.id,
          set: {
            email,
            updatedAt: new Date(),
          },
        });

      await tx.update(encryptedMail).set({ userId }).where(eq(encryptedMail.userId, oldId));
      await tx.delete(user).where(eq(user.id, oldId));
      return;
    }

    await tx
      .insert(user)
      .values({
        id: userId,
        email,
        name: email.split("@")[0],
        createdAt,
        updatedAt: createdAt,
      })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          email,
          updatedAt: new Date(),
        },
      });
  });
}

export async function upsertOAuthUserFromCredentials(opts: {
  userId: string;
  email: string;
  name: string | null | undefined;
  image: string | null | undefined;
  oauthAccount: OAuthAccountInput;
}): Promise<void> {
  void opts.name;
  void opts.image;
  const { userId, email } = opts;
  await upsertOAuthUserRow({ userId, email, createdAt: new Date() });
}

export async function ensureUserRowFromSession(session: AppSession | null): Promise<boolean> {
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) return false;
  await upsertOAuthUserRow({ userId, email, createdAt: new Date() });
  return true;
}
