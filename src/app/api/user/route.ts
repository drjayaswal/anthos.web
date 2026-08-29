import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { eq, count } from 'drizzle-orm';
import { db } from '@/app/db';
import { encryptedMail, user } from '@/app/db/schema';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const userData = await db
      .select({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        totalEncryptedMails: count(encryptedMail.id),
      })
      .from(user)
      .leftJoin(encryptedMail, eq(user.id, encryptedMail.userId))
      .where(eq(user.id, session.user.id))
      .groupBy(user.id);

    return NextResponse.json({
      ok: true,
      data: userData[0] || {}
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to fetch' }, { status: 500 });
  }
}