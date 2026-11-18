import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await request.json();

    const inquiry = await db.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const inquiry = await db.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    let dossier: Record<string, any> = {};
    if (inquiry.subject && inquiry.subject.startsWith('{')) {
      try {
        dossier = JSON.parse(inquiry.subject);
      } catch {}
    }

    let productName: string | null = null;
    if (inquiry.productId) {
      const prod = await db.product.findUnique({
        where: { id: inquiry.productId },
        include: { nameText: true },
      });
      if (prod?.nameText) {
        productName = prod.nameText.zh || prod.nameText.en || null;
      }
    }

    const { sendInquiryNotification } = await import('@/lib/mail');
    const mailRes = await sendInquiryNotification({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      company: inquiry.company,
      message: inquiry.message,
      productId: inquiry.productId,
      productName,
      dossier: Object.keys(dossier).length > 0 ? dossier : undefined,
    });

    const mailStatus = mailRes.success
      ? 'sent'
      : mailRes.unconfigured
      ? 'unconfigured'
      : 'failed';
    const mailSentAt = mailRes.success ? new Date().toISOString() : undefined;
    const mailError = mailRes.success ? undefined : mailRes.error;

    const updatedDossier = {
      ...dossier,
      mailStatus,
      mailError,
      mailSentAt,
    };

    await db.inquiry.update({
      where: { id },
      data: { subject: JSON.stringify(updatedDossier) },
    });

    return NextResponse.json({
      success: mailRes.success,
      mailStatus,
      mailError,
      mailSentAt,
      attempts: mailRes.attempts,
    });
  } catch (error: any) {
    console.error('[API] Resend inquiry email failed:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await db.inquiry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
