import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/app/db";
import { encryptedMail } from "@/app/db/schema";
import type { Mail } from "@/types";
import { DEFAULT_MAIL_PRIORITY } from "@/lib/mail-priority";

export async function upsertEncryptedMailsForUser(
  userId: string,
  mails: Mail[],
  encryptJsonPayload: (mail: Mail) => string,
): Promise<void> {
  const now = new Date();
  for (const m of mails) {
    const ciphertext = encryptJsonPayload(m);

    const mailCategories: string[] = m.categories?.filter(Boolean) as string[] ??
      (m.category ? [m.category] : []);
    const mailPriority: string[] = m.priority?.filter(Boolean) as string[] ??
      (m.priority_score != null ? [String(m.priority_score)] : []);
    const mailConfidence: string[] =
      m.confidence_score != null ? [String(m.confidence_score)] : [];
    const mailSummary: string | undefined = m.summary ?? undefined;
    const mailDescription: string | undefined = m.description ?? undefined;
    const mailVersion: string[] = m.versions?.map(String) ?? [];

    const values = {
      userId,
      gmailMessageId: m.id,
      ciphertext,
      categories: mailCategories.length > 0 ? mailCategories : undefined,
      priority: mailPriority.length > 0 ? mailPriority : undefined,
      confidence: mailConfidence.length > 0 ? mailConfidence : undefined,
      summary: mailSummary,
      description: mailDescription,
      version: mailVersion.length > 0 ? mailVersion : undefined,
      createdAt: now,
      updatedAt: now,
    };

    await db
      .insert(encryptedMail)
      .values(values)
      .onConflictDoUpdate({
        target: [encryptedMail.userId, encryptedMail.gmailMessageId],
        set: {
          ciphertext,
          categories: mailCategories.length > 0 ? mailCategories : undefined,
          priority: mailPriority.length > 0 ? mailPriority : undefined,
          confidence: mailConfidence.length > 0 ? mailConfidence : undefined,
          summary: mailSummary,
          description: mailDescription,
          version: mailVersion.length > 0 ? mailVersion : undefined,
          updatedAt: now,
        },
      });
  }
}

export async function getExistingGmailMessageIdsForUser(
  userId: string,
  gmailMessageIds: string[],
): Promise<Set<string>> {
  if (gmailMessageIds.length === 0) return new Set();
  const rows = await db
    .select({ gmailMessageId: encryptedMail.gmailMessageId })
    .from(encryptedMail)
    .where(and(eq(encryptedMail.userId, userId), inArray(encryptedMail.gmailMessageId, gmailMessageIds)));
  return new Set(rows.map((r) => r.gmailMessageId));
}

export async function getCategoriesAndPriorityByGmailIds(
  userId: string,
  gmailMessageIds: string[],
): Promise<Map<string, { categories: string[] | null; priority: string }>> {
  if (gmailMessageIds.length === 0) return new Map();
  const rows = await db
    .select({
      gmailMessageId: encryptedMail.gmailMessageId,
      categories: encryptedMail.categories,
      priority: encryptedMail.priority,
    })
    .from(encryptedMail)
    .where(and(eq(encryptedMail.userId, userId), inArray(encryptedMail.gmailMessageId, gmailMessageIds)));
  const map = new Map<string, { categories: string[] | null; priority: string }>();
  for (const r of rows) {
    map.set(r.gmailMessageId, {
      categories: r.categories ?? null,
      priority:
        r.priority != null && String(r.priority) !== ""
          ? String(r.priority)
          : DEFAULT_MAIL_PRIORITY,
    });
  }
  return map;
}
