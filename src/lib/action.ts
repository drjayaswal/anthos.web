import { google, type gmail_v1 } from 'googleapis';
import { getSession } from '@/lib/auth';
import { AnalyzeOptions, DatabaseQueryOptions, Mail } from '@/types';
import { db } from '@/app/db';
import { categories, encryptedMail } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { decryptJsonPayload } from './mail-crypto';

function parseGmailMessage(msgId: string, details: { data: gmail_v1.Schema$Message }): Mail {
  const payload = details.data.payload;
  const headers = payload?.headers;
  const labels = details.data.labelIds || [];
  let fullBody = '';
  if (payload?.body?.data) {
    fullBody = Buffer.from(payload.body.data, 'base64').toString();
  } else if (payload?.parts) {
    const textPart = payload.parts.find((part) => part.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      fullBody = Buffer.from(textPart.body.data, 'base64').toString();
    }
  }
  return {
    id: msgId,
    subject: headers?.find((h) => h.name === 'Subject')?.value || 'No Subject',
    sender: headers?.find((h) => h.name === 'From')?.value || 'Unknown Sender',
    recipient: headers?.find((h) => h.name === 'To')?.value || 'me',
    body: fullBody || details.data.snippet || '',
    status: labels.includes('UNREAD') ? 'unread' : 'read',
    createdAt: new Date(headers?.find((h) => h.name === 'Date')?.value || Date.now()).toISOString(),
    labels,
    threadId: details.data.threadId!,
  };
}

export async function getCustomMails(opts: AnalyzeOptions): Promise<Mail[]> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Unauthorized: No access token');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const queryParts: string[] = [];
  if (opts.unread) {
    queryParts.push('is:unread');
  } else {
    queryParts.push('is:read');
  }
  queryParts.push(`newer_than:${opts.days}d`);
  if (opts.important) queryParts.push('is:important');
  if (opts.starred) queryParts.push('is:starred');

  const q = queryParts.filter(Boolean).join(' ');

  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: opts.count,
      q,
    });

    const messages = res.data.messages || [];
    const mails: Mail[] = [];

    for (const msg of messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });
      mails.push(parseGmailMessage(msg.id!, details));
    }

    return mails;
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 401) {
      throw new Error('Your session expired. Please sign in again.');
    }
    throw error;
  }
}
export async function getCategories(): Promise<{ name: string; description: string | null }[]> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Unauthorized: No access token');
  }

  try {
    const res = await db
      .select({ name: categories.name, description: categories.description })
      .from(categories);

    return res || [];
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 401) {
      throw new Error('Your session expired. Please sign in again.');
    }
    throw error;
  }
}

export async function getDatabaseMails(opts: DatabaseQueryOptions): Promise<Mail[]> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Unauthorized: No access token');
  }

  try {
    const res = await db
      .select()
      .from(encryptedMail)
      .where(eq(encryptedMail.userId, session.user.id!))
      .limit(opts.count);

    const messages = res || [];
    const mails: Mail[] = [];
    if (messages.length === 0) {
      return mails;
    }

    for (const msg of messages) {
      try {
        const decryptedPayload = decryptJsonPayload<Mail>(msg.ciphertext);

        mails.push({
          id: msg.gmailMessageId,
          threadId: decryptedPayload.threadId ?? null,
          subject: decryptedPayload.subject ?? '(No Subject)',
          sender: decryptedPayload.sender ?? 'Unknown Sender',
          recipient: decryptedPayload.recipient ?? 'Unknown Recipient',
          body: decryptedPayload.body ?? '',
          status: decryptedPayload.status ?? 'unread',
          labels: decryptedPayload.labels ?? [],
          createdAt: msg.createdAt.toISOString(),
          categories: msg.categories,
          priority: msg.priority,
        });
      } catch (decryptionError) {
        console.error(`Failed to decrypt mail item with message ID: ${msg.gmailMessageId}`, decryptionError);
      }
    }
    return mails;
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 401) {
      throw new Error('Your session expired. Please sign in again.');
    }
    throw error;
  }
}