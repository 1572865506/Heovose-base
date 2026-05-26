import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';

export const POST = withAuth('editor', async (request: Request) => {
  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
    return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
  }

  // Perform batch update using a transaction
  await db.$transaction(
    ids.map((id, index) => 
      db.homepageBentoItem.update({
        where: { id },
        data: { order: index + 1 }
      })
    )
  );

  return NextResponse.json({ success: true });
});
