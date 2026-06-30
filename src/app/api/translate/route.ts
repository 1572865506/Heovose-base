import { NextResponse } from 'next/server';
import { translateContent } from '@/ai/flows/translate-flow';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await translateContent(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Error] /api/translate:', error);
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
  }
}
