import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureUserRowFromSession } from "@/app/api/_db/user";
import {
  getCategoriesAndPriorityByGmailIds,
  getExistingGmailMessageIdsForUser,
} from "@/app/api/_db/encrypted-mail";
import type { AnalyzeCheckRequest, Mail } from "@/types";

export type AnalyzeCheckResponse =
  | { ok: true; existingInDb: Mail[]; missingInDb: Mail[] }
  | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<AnalyzeCheckResponse>> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: AnalyzeCheckRequest;
  try {
    body = (await req.json()) as AnalyzeCheckRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const mails = Array.isArray(body.mails) ? body.mails : [];

  const ensured = await ensureUserRowFromSession(session);
  if (!ensured) {
    return NextResponse.json(
      { ok: false, error: "Missing user id or email" },
      { status: 400 },
    );
  }

  if (mails.length === 0) {
    return NextResponse.json({ ok: true, existingInDb: [], missingInDb: [] });
  }

  try {
    const gmailIds = mails.map((m) => m.id);
    const existingIdsSet = await getExistingGmailMessageIdsForUser(userId, gmailIds);

    const existingInDb: Mail[] = [];
    const missingInDb: Mail[] = [];
    for (const m of mails) {
      if (existingIdsSet.has(m.id)) existingInDb.push(m);
      else missingInDb.push(m);
    }

    await getCategoriesAndPriorityByGmailIds(
      userId,
      existingInDb.map((m) => m.id),
    );

    return NextResponse.json({ ok: true, existingInDb: [], missingInDb });
  } catch {
    return NextResponse.json({ ok: false, error: "Sync failed during database check" }, { status: 500 });
  }
}
