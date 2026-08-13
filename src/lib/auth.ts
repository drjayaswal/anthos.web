import { betterAuth as createBetterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { db } from "@/app/db";
import {
  user,
  session,
  account,
  verification,
} from "@/app/db/schema";
import {
  syncAppUserFromAuthAccount,
  resolveGoogleAccessToken,
  type AppSession,
} from "@/lib/auth-server";

function authBaseUrl(): string {
  const url = process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!url) {
    throw new Error("BETTER_AUTH_URL or NEXTAUTH_URL must be set");
  }
  return url.replace(/\/$/, "");
}

function authSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET or AUTH_SECRET must be set");
  }
  return secret;
}

export const auth = createBetterAuth({
  appName: "anthos",
  secret: authSecret(),
  baseURL: authBaseUrl(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
    },
  }),
  user: {
    modelName: "user",
  },
  trustedOrigins: [
    "https://*.vercel.app",
  ],
  session: {
    modelName: "session",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  account: {
    modelName: "account",
  },
  verification: {
    modelName: "verification",
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      accessType: "offline",
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          await syncAppUserFromAuthAccount(account);
        },
      },
      update: {
        after: async (account) => {
          await syncAppUserFromAuthAccount(account);
        },
      },
    },
  },
  plugins: [
    nextCookies(),
  ],
});

export type { AppSession };

export async function getSession(): Promise<AppSession | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const { accessToken, error } = await resolveGoogleAccessToken(session.user.id);

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
    accessToken,
    error,
  };
}