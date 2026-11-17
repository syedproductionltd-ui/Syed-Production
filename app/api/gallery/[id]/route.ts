import { NextResponse, NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
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

    if (typeof title === 'string') post.title = title;
    if (typeof category === 'string') post.category = category;
    if (isPublished !== undefined) post.isPublished = isPublished;

    if (images && Array.isArray(images) && images.length > 0) {
      const titleForAlt = typeof title === 'string' ? title : post.title;
      post.images = (images as any[])
        .map((img: any, idx: number) => {
          if (typeof img === 'string') {
            return { imageUrl: img, altText: titleForAlt, hidden: false, sortOrder: idx + 1, _idx: idx };
          }
          const so = typeof img.sortOrder === 'number' && Number.isFinite(img.sortOrder) ? img.sortOrder : idx + 1;
          return {
            imageUrl: img.imageUrl,
            altText: img.altText || titleForAlt,
            hidden: Boolean(img.hidden),
            sortOrder: so,
            _idx: idx,
          };
        })
        .sort((a, b) => (a.sortOrder - b.sortOrder) || (a._idx - b._idx))
        .map((img, idx) => ({
          imageUrl: img.imageUrl,
          altText: img.altText,
          hidden: img.hidden,
          sortOrder: idx + 1,
        })) as any;
    }

    const imgs = (post.images as any[]) || [];
    if (coverImage && imgs.some((i) => i.imageUrl === coverImage)) {
      post.coverImage = coverImage;
    } else if (imgs.length > 0) {
      post.coverImage = imgs[0].imageUrl || imgs[0];
    }

    await post.save();
    revalidatePath('/');
    revalidatePath('/gallery');
    revalidatePath('/portfolio');
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

    revalidatePath('/');
    revalidatePath('/gallery');
    revalidatePath('/portfolio');
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to delete gallery post' }, { status: 500 });
  }
}
