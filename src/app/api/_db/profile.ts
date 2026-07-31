import { eq, and, count } from "drizzle-orm";
import { db } from "@/app/db";
import { user, encryptedMail, account, session } from "@/app/db/schema";

export type Session = {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  authCreatedAt: string;
  appCreatedAt: string | null;
  totalEncryptedMails: number;
  provider: string | null;
  providerAccountId: string | null;
  scopes: string | null;
  providerLinkedAt: string | null;
  sessions: Session[];
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [authRow, appRow, googleAccount, sessions] =
    await Promise.all([
      db.select().from(user).where(eq(user.id, userId)).limit(1),
      db
        .select({
          createdAt: user.createdAt,
          totalEncryptedMails: count(encryptedMail.id),
        })
        .from(user)
        .leftJoin(encryptedMail, eq(user.id, encryptedMail.userId))
        .where(eq(user.id, userId))
        .groupBy(user.id, user.createdAt),
      db
        .select()
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "google"))),
      db.select().from(session).where(eq(session.userId, userId)),
    ]);

  if (!authRow[0]) return null;

  return {
    id: authRow[0].id,
    name: authRow[0].name,
    email: authRow[0].email,
    image: authRow[0].image,
    emailVerified: authRow[0].emailVerified,
    authCreatedAt: authRow[0].createdAt.toISOString(),
    appCreatedAt: appRow[0]?.createdAt?.toISOString() ?? null,
    totalEncryptedMails: Number(appRow[0]?.totalEncryptedMails ?? 0),
    provider: googleAccount[0]?.providerId ?? null,
    providerAccountId: googleAccount[0]?.accountId ?? null,
    scopes: googleAccount[0]?.scope ?? null,
    providerLinkedAt: googleAccount[0]?.createdAt?.toISOString() ?? null,
    sessions: sessions.map(({ token, ...rest }) => ({
      ...rest,
      expiresAt: rest.expiresAt.toISOString(),
      createdAt: rest.createdAt.toISOString(),
      updatedAt: rest.updatedAt.toISOString(),
    })),
  };
}