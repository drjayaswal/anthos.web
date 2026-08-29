import { NextResponse } from 'next/server';
import { db } from '@/app/db';
import { categories } from '@/app/db/schema';
import { requireAdminSession } from '@/lib/admin-auth';

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ ok: false, error: 'Category name is required' }, { status: 400 });
    }

    await db.insert(categories).values({
      name: name.trim(),
      description: description?.trim() || null,
    });

    return NextResponse.json({ ok: true, message: 'Category created successfully' });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      return NextResponse.json({ ok: false, error: 'A category with this name already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ ok: false, error: 'Failed to create category' }, { status: 500 });
  }
}