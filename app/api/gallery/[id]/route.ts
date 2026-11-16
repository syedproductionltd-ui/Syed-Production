import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { GalleryPostModel } from '@/models/GalleryPost';

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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, category, coverImage, images, isPublished } = body;

    const post = await GalleryPostModel.findOne({ id });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Gallery post not found' }, { status: 404 });
    }

    if (title) post.title = title;
    if (category) post.category = category;
    if (isPublished !== undefined) post.isPublished = isPublished;

    if (images && Array.isArray(images) && images.length > 0) {
      post.images = images.map((img: any) => {
        if (typeof img === 'string') {
          return { imageUrl: img, altText: post.title, hidden: false };
        }
        return {
          imageUrl: img.imageUrl,
          altText: img.altText || post.title,
          hidden: Boolean(img.hidden),
        };
      }) as any;
    }

    if (coverImage) {
      post.coverImage = coverImage;
    } else if (post.images.length > 0) {
      const firstImg = post.images[0] as any;
      post.coverImage = firstImg.imageUrl || firstImg;
    }

    await post.save();
    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update gallery post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const deleted = await GalleryPostModel.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Gallery post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete gallery post' }, { status: 500 });
  }
}
