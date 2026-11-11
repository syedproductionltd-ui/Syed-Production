import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('syed_admin_session');
  return response;
}
