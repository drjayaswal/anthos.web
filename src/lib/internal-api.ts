import { cookies, headers } from "next/headers";

function buildOrigin(): string {
  const envBase = (process.env.BETTER_AUTH_URL)?.replace(
    /\/$/,
    "",
  );
  if (envBase) return envBase;
  return "";
}

export async function fetchInternalApi(path: string, init?: RequestInit): Promise<Response> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = buildOrigin() || `${proto}://${host}`;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ");

  const mergedHeaders = new Headers(init?.headers);
  if (cookieHeader) mergedHeaders.set("Cookie", cookieHeader);

  return fetch(`${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: mergedHeaders,
    cache: "no-store",
  });
}
