import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookie = req.cookies.get('syed_admin_session')?.value;
  const authHeader = req.headers.get('authorization');
  const ok = Boolean(
    adminPassword &&
      (cookie === adminPassword || cookie === 'authenticated' || authHeader === `Bearer ${adminPassword}`)
  );

  if (ok) {
    return NextResponse.json({ success: true, authenticated: true });
  }
  return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
}
