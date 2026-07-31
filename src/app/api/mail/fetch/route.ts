import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCustomMails } from '@/lib/action';
import type { FetchOptions, Mail } from '@/types';

export type MailFetchResponse = { ok: true; mails: Mail[] } | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<MailFetchResponse>> {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  let options: FetchOptions;
  try {
    options = (await req.json()) as FetchOptions;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  try {
    const mails = await getCustomMails({ ...options, store: false });
    return NextResponse.json({ ok: true, mails });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Could not load mail from Gmail';
    console.error('Fetch route error:', err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
