import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const user = await db.user.upsert({
      where: { email: 'admin@heovose.com' },
      update: {
        password: adminPassword,
        role: 'superadmin',
      },
      create: {
        email: 'admin@heovose.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'superadmin',
      },
    });
    return NextResponse.json({ success: true, user: { email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Reset failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
