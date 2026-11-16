import { NextResponse, NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
]);

function isAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const adminCookie = req.cookies.get('syed_admin_session');
  const authHeader = req.headers.get('authorization');
  return adminCookie?.value === adminPassword || authHeader === `Bearer ${adminPassword}`;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);

    if (!files.length) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ success: false, error: `Too many files (max ${MAX_FILES})` }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const ext = ALLOWED.get(file.type);
      if (!ext) {
        return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
      }
      if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: 'Invalid file size (max 10MB each)' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      uploadedUrls.push(`/uploads/gallery/${filename}`);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to upload files' }, { status: 500 });
  }
}
