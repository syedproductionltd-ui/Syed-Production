import { NextResponse, NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
]);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function isAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const adminCookie = req.cookies.get('syed_admin_session')?.value;
  const authHeader = req.headers.get('authorization');
  return (
    adminCookie === adminPassword ||
    adminCookie === 'authenticated' ||
    authHeader === `Bearer ${adminPassword}`
  );
}

function resolveExt(file: File): string | null {
  const byType = ALLOWED.get(file.type);
  if (byType) return byType;
  const rawExt = path.extname(file.name || '').toLowerCase();
  if (rawExt === '.jpeg') return '.jpg';
  if (ALLOWED_EXT.has(rawExt)) return rawExt;
  return null;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    directUpload: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
  });
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

    const uploadedUrls: string[] = [];
    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    if (!useBlob && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
      return NextResponse.json(
        { success: false, error: 'Image upload storage is not configured on this server' },
        { status: 503 }
      );
    }

    if (!useBlob) {
      await mkdir(path.join(process.cwd(), 'public', 'uploads', 'gallery'), { recursive: true });
    }

    for (const file of files) {
      const ext = resolveExt(file);
      if (!ext) {
        return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
      }
      if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: 'Invalid file size (max 10MB each)' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      if (!buffer.length) {
        return NextResponse.json({ success: false, error: 'Empty file' }, { status: 400 });
      }

      const filename = `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      if (useBlob) {
        const blob = await put(`gallery/${filename}`, buffer, {
          access: 'public',
          contentType: file.type || undefined,
          addRandomSuffix: false,
        });
        uploadedUrls.push(blob.url);
      } else {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
        await writeFile(path.join(uploadDir, filename), buffer);
        uploadedUrls.push(`/uploads/gallery/${filename}`);
      }
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (err) {
    console.error('Upload error:', err);
    const msg = err instanceof Error ? err.message : '';
    if (/EACCES|EPERM|EROFS|ENOSPC/i.test(msg)) {
      return NextResponse.json({ success: false, error: 'Upload storage is not writable on this server' }, { status: 500 });
    }
    if (/Unauthorized|Database/i.test(msg)) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
    return NextResponse.json(
      { success: false, error: msg || 'Unable to upload files' },
      { status: 500 }
    );
  }
}
