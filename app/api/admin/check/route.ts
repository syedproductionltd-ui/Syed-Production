import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('syed_admin_session');
  if (adminCookie?.value === 'authenticated') {
    return NextResponse.json({ success: true, authenticated: true });
  }
  return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
}
