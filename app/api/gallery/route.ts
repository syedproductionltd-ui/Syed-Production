import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { GalleryPostModel } from '@/models/GalleryPost';
import { galleryPosts as staticGalleryPosts } from '@/lib/data';

export const revalidate = 60;

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('admin') === 'true';
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 60, 1), 200);

    if (includeUnpublished && !isAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectDB();
    if (!conn) {
      const posts = includeUnpublished ? [] : staticGalleryPosts.slice(0, limit);
      const res = NextResponse.json({ success: true, posts, source: 'static' });
      res.headers.set('Cache-Control', includeUnpublished ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300');
      return res;
    }

    const query = includeUnpublished ? {} : { isPublished: true };
    const posts = await GalleryPostModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const result = posts.length || includeUnpublished ? posts : staticGalleryPosts.slice(0, limit);
    const res = NextResponse.json({ success: true, posts: result });
    res.headers.set(
      'Cache-Control',
      includeUnpublished ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300'
    );
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch gallery posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const body = await req.json();
    const { title, category, coverImage, images, isPublished } = body;

    if (!title || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ success: false, error: 'Title and at least one image are required' }, { status: 400 });
    }

    const id = body.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const resolvedCover = coverImage || (typeof images[0] === 'string' ? images[0] : images[0]?.imageUrl);

    const formattedImages = images.map((img: any) => {
      if (typeof img === 'string') {
        return { imageUrl: img, altText: title, hidden: false };
      }
      return {
        imageUrl: img.imageUrl,
        altText: img.altText || title,
        hidden: Boolean(img.hidden),
      };
    });

    const newPost = await GalleryPostModel.create({
      id,
      title,
      category: category || 'Portfolio',
      coverImage: resolvedCover,
      images: formattedImages,
      isPublished: isPublished ?? true,
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create gallery post' }, { status: 500 });
  }
}
