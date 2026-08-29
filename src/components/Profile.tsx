"use client";

import Image from "next/image";
import { ShieldIcon } from "lucide-react";
import type { UserProfile } from "@/app/api/_db/profile";
import { parseUserAgent } from "@/lib/utils";

type ExtendedSession = {
  id: string;
  expiresAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
};

type ExtendedUserProfile = UserProfile & {
  accessToken?: string;
  sessions?: ExtendedSession[];
};

function formatDate(val: string | Date | null): string {
  if (!val) return "—";
  return new Date(val).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5 py-2.5 border-0 sm:py-3 flex flex-col w-full">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-black/50 sm:text-xs">
        {label}
      </dt>
      <dd
        className={`text-xs text-black/70 sm:text-sm ${mono ? "break-all font-mono text-[11px] sm:text-xs" : "wrap-break-word"}`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function Profile({ profile }: { profile: ExtendedUserProfile }) {
  const scopeList = profile.scopes
    ? profile.scopes.split(/[\s,]+/).filter(Boolean)
    : [];

  return (
    <div className="min-h-0 text-black sm:mt-0 mt-10 mx-2">
      <main className="mx-auto max-w-2xl px-3 py-4 sm:p-6">
        <div className="mb-4 space-y-1 sm:mb-6">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl text-black">
            Your profile
          </h1>
          <p className="text-xs text-black/50 sm:text-sm">
            Account details from your sign-in. This is read-only information and cannot be edited.
          </p>
        </div>

        <section className="overflow-hidden rounded-4xl bg-white border shadow-sm">
          <div className="flex items-center gap-3 border-b p-3 sm:gap-4 sm:p-4">
            <div className={profile.emailVerified ? "p-0.5 rounded-full ring-2 ring-green-600 shrink-0" : "shrink-0"}>
              <Image
                src={profile.image || "/anthos.png"}
                alt=""
                width={48}
                height={48}
                className="h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium sm:text-base text-black">
                {profile.name}
              </p>
              <p className="truncate text-xs text-black/50 sm:text-sm">
                {profile.email}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:gap-x-4 px-3 sm:px-4 pb-2">
            <Field label="Display name" value={profile.name} />
            <Field label="Email" value={profile.email} />
            <Field label="User ID" value={profile.id.slice(0, profile.id.length / 2).concat("XXXXXXX")} mono />
            <Field
              label="Signed up"
              value={formatDate(profile.authCreatedAt)}
            />
            {profile.appCreatedAt && (
              <Field
                label="App record created"
                value={formatDate(profile.appCreatedAt)}
              />
            )}
            <Field
              label="Encrypted Context stored"
              value={String(profile.totalEncryptedMails || 0)}
            />
          </dl>
        </section>

        <section className="mt-3 overflow-hidden rounded-2xl border bg-white shadow-sm sm:mt-4">
          <div className="border-b px-3 py-2 sm:px-4 sm:py-2.5">
            <h2 className="flex items-center gap-1.5 text-xs font-medium sm:text-sm text-black">
              <ShieldIcon className="h-3.5 w-3.5 text-black/50" />
              Sign-in &amp; access
            </h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:gap-x-4 px-3 sm:px-4 pb-2">
            <Field
              label="Provider"
              value={
                profile.provider
                  ? profile.provider.charAt(0).toUpperCase() +
                  profile.provider.slice(1)
                  : "—"
              }
            />
            {profile.providerAccountId && (
              <Field
                label="Provider acc. ID"
                value={profile.providerAccountId.slice(profile.providerAccountId.length / 2).concat("XXXXXXX")}
                mono
              />
            )}
            <Field
              label="Linked"
              value={formatDate(profile.providerLinkedAt)}
            />
            {profile.accessToken && (
              <Field
                label="Access Token"
                value={`${profile.accessToken.substring(0, 16)}...${profile.accessToken.slice(-6)}`}
                mono
              />
            )}
            <div className="col-span-1 sm:col-span-2 space-y-1.5 border-b py-2.5 last:border-0 sm:py-3">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-black/50 sm:text-xs">
                Permissions
              </dt>
              <dd className="flex flex-wrap gap-1">
                {scopeList.length > 0 ? (
                  scopeList.map((scope) => (
                    <a
                      key={scope}
                      href={`https://www.google.com/search?q=${scope}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block max-w-full truncate rounded-md bg-black/5 px-1.5 py-0.5 font-mono text-[9px] text-black/70 hover:text-black transition-colors sm:text-[10px]"
                    >
                      {scope}
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-black/50 sm:text-sm">—</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-3 overflow-hidden rounded-2xl bg-white border shadow-sm sm:mt-4">
          <div className="border-b px-3 py-2 sm:px-4 sm:py-2.5">
            <h2 className="text-xs font-medium sm:text-sm text-black">Active Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] sm:text-xs">
              <thead className="border-b uppercase text-black/50">
                <tr>
                  <th className="px-3 py-2 font-medium">Session ID</th>
                  <th className="px-3 py-2 font-medium">IP Address</th>
                  <th className="px-3 py-2 font-medium">Device</th>
                  <th className="px-3 py-2 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {profile.sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-black/5 transition-colors">
                    <td
                      className="px-3 py-2 font-mono text-black/60 cursor-pointer hover:text-black transition-colors"
                      onClick={() => navigator.clipboard.writeText(sess.id)}
                    >
                      {sess.id.slice(0, 8)}...{sess.id.slice(-4)}
                    </td>
                    <td
                      className="px-3 py-2 font-mono text-black/60 cursor-pointer hover:text-black transition-colors"
                      onClick={() =>
                        sess.ipAddress &&
                        navigator.clipboard.writeText(sess.ipAddress)
                      }
                    >
                      {sess.ipAddress ? `${sess.ipAddress.slice(0, 8)}...${sess.ipAddress.slice(-4)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-black/50">
                      {parseUserAgent(sess.userAgent || "").split(" ")[0] || "—"}
                    </td>
                    <td className="px-3 py-2 text-black/50">
                      {new Date(sess.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-black/50 sm:text-xs">
          Profile data is tied to your Anthos account and Anthos records.
        </p>
      </main>
    </div>
  );
}
