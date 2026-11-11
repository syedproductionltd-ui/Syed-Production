import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { GalleryPostModel } from '@/models/GalleryPost';
import { galleryPosts as initialPosts } from '@/lib/data';

/** Public GET is cacheable; admin/mutating handlers still hit the DB live. */
export const revalidate = 60;

function isAdmin(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('syed_admin_session');
  const authHeader = req.headers.get('authorization');
  return adminCookie?.value === 'authenticated' || authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('admin') === 'true';

    if (includeUnpublished && !isAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let query = includeUnpublished ? {} : { isPublished: true };
    let posts = await GalleryPostModel.find(query).sort({ createdAt: -1 }).lean();

    // If database is empty, seed initial data from lib/data.ts
    if (posts.length === 0) {
      const seedData = initialPosts.map((p, idx) => ({
        id: p.id || `post-${Date.now()}-${idx}`,
        title: p.title,
        category: p.title.toLowerCase().includes('wedding') ? 'Wedding' : p.title.toLowerCase().includes('studio') ? 'Studio' : p.title.toLowerCase().includes('editorial') ? 'Editorial' : 'Cinematic',
        coverImage: p.images[0]?.imageUrl || '',
        images: p.images.map((img) => ({
          imageUrl: img.imageUrl,
          altText: img.altText || p.title,
          hidden: img.hidden || false,
        })),
        isPublished: true,
      }));

      await GalleryPostModel.insertMany(seedData);
      posts = await GalleryPostModel.find(query).sort({ createdAt: -1 }).lean();
    }

    const res = NextResponse.json({ success: true, posts });
    if (!includeUnpublished) {
      res.headers.set(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=300'
      );
    } else {
      res.headers.set('Cache-Control', 'no-store');
    }
    return res;
  } catch (error: any) {
    console.error('Error fetching gallery posts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { title, category, coverImage, images, isPublished } = body;

    if (!title || !images || images.length === 0) {
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
  } catch (error: any) {
    console.error('Error creating gallery post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
