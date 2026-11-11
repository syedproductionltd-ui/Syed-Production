import { NextResponse, NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function isAdmin(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('syed_admin_session');
  const authHeader = req.headers.get('authorization');
  return adminCookie?.value === 'authenticated' || authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.name) || '.jpg';
      const filename = `gallery-${uniqueSuffix}${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      uploadedUrls.push(`/uploads/gallery/${filename}`);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
